import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { isDatabaseConfigured, isDatabaseAvailable, withDbTimeout, getPrisma } from './db';

export const SESSION_COOKIE_NAME = 'athrav_admin_session';
export const INACTIVITY_TIMEOUT_SECONDS = 300; // 5 minutes (300 seconds) inactivity timeout
export const SESSION_MAX_AGE_SECONDS = Number(process.env.SESSION_MAX_AGE_SECONDS) || INACTIVITY_TIMEOUT_SECONDS;

export function isSecureContext(): boolean {
  return process.env.NODE_ENV === 'production' && Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https'));
}

const DEV_STORAGE_DIR = path.join(process.cwd(), '.dev-storage');
const SESSIONS_FILE = path.join(DEV_STORAGE_DIR, 'sessions.json');
const USERS_FILE = path.join(DEV_STORAGE_DIR, 'admin-users.json');

// In-memory mock session and user store when database is not configured
export interface MockAdmin {
  id: string;
  name?: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  mustChangePassword?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

interface StoredSession {
  userId: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

function ensureDevStorageDir() {
  try {
    if (!fs.existsSync(DEV_STORAGE_DIR)) {
      fs.mkdirSync(DEV_STORAGE_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

function loadDevSessions(): Map<string, { userId: string; expiresAt: Date; ipAddress?: string; userAgent?: string }> {
  const map = new Map<string, { userId: string; expiresAt: Date; ipAddress?: string; userAgent?: string }>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const now = new Date();
      for (const [token, s] of Object.entries(data as Record<string, StoredSession>)) {
        const exp = new Date(s.expiresAt);
        if (exp > now) {
          map.set(token, {
            userId: s.userId,
            expiresAt: exp,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
          });
        }
      }
    }
  } catch {
    // fallback to empty map
  }
  return map;
}

function saveDevSessions(map: Map<string, { userId: string; expiresAt: Date; ipAddress?: string; userAgent?: string }>) {
  try {
    ensureDevStorageDir();
    const serializable: Record<string, StoredSession> = {};
    const now = new Date();
    for (const [token, s] of map.entries()) {
      if (s.expiresAt > now) {
        serializable[token] = {
          userId: s.userId,
          expiresAt: s.expiresAt.toISOString(),
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
        };
      }
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(serializable, null, 2), 'utf-8');
  } catch {
    // ignore write errors in restricted environments
  }
}

// Default mock admin password hash (fallback if unconfigured)
// Password: "ReplaceWithStrongPassword123!"
const defaultSalt = '0f9a2b8e4c7d1f3a5e8c2a9f4b7d1e3c';
const defaultHash = crypto.scryptSync('ReplaceWithStrongPassword123!', defaultSalt, 64).toString('hex');

const initialMockAdminUsers: MockAdmin[] = [
  {
    id: 'admin-super-1',
    name: 'Athrav Pathak',
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@athravpathak.dev',
    username: process.env.INITIAL_ADMIN_USERNAME || 'athrav_admin',
    passwordHash: `scrypt:${defaultSalt}:${defaultHash}`,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    mustChangePassword: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

function loadDevUsers(): MockAdmin[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  const fallback = [...initialMockAdminUsers];
  saveDevUsers(fallback);
  return fallback;
}

function saveDevUsers(users: MockAdmin[]) {
  try {
    ensureDevStorageDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Global persistence for Next.js hot module reloads
const globalForAuth = globalThis as unknown as {
  __athravMockSessions?: Map<string, { userId: string; expiresAt: Date; ipAddress?: string; userAgent?: string }>;
  __athravMockUsers?: MockAdmin[];
};

const mockSessions = globalForAuth.__athravMockSessions ?? loadDevSessions();
globalForAuth.__athravMockSessions = mockSessions;

const mockAdminUsers = globalForAuth.__athravMockUsers ?? loadDevUsers();
globalForAuth.__athravMockUsers = mockAdminUsers;

// ============================================================================
// SECURE PASSWORD HASHING (Argon2id + Scrypt Fallback)
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  try {
    const argon2 = await import('@node-rs/argon2');
    return await argon2.hash(password, {
      algorithm: 2, // 2 corresponds to Argon2id in @node-rs/argon2
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  } catch {
    // Cryptographically secure scrypt fallback
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !password) return false;

  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const key = parts[2];
    const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(candidate, 'hex'));
    } catch {
      return false;
    }
  }

  try {
    const argon2 = await import('@node-rs/argon2');
    return await argon2.verify(storedHash, password);
  } catch {
    return false;
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + INACTIVITY_TIMEOUT_SECONDS * 1000);

  if (isDatabaseAvailable()) {
    try {
      await withDbTimeout(
        getPrisma().session.create({
          data: {
            sessionToken: token,
            userId,
            expiresAt,
            ipAddress: meta?.ipAddress,
            userAgent: meta?.userAgent,
          },
        })
      );
      return token;
    } catch (err) {
      console.warn('[Auth] Prisma session create error, fallback to memory:', err);
    }
  }

  mockSessions.set(token, {
    userId,
    expiresAt,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });
  saveDevSessions(mockSessions);

  return token;
}

/**
 * Resets the sliding inactivity expiration deadline for an active session.
 * Strictly checks that the session has not already expired; expired sessions cannot be touched.
 */
export async function touchSession(token: string): Promise<boolean> {
  if (!token) return false;
  const newExpiresAt = new Date(Date.now() + INACTIVITY_TIMEOUT_SECONDS * 1000);

  if (isDatabaseAvailable()) {
    try {
      const result = await withDbTimeout(
        getPrisma().session.updateMany({
          where: {
            sessionToken: token,
            expiresAt: { gt: new Date() }, // strictly only if NOT already expired!
          },
          data: {
            expiresAt: newExpiresAt,
          },
        })
      );
      if (result.count > 0) return true;
      return false;
    } catch (err) {
      console.warn('[Auth] Prisma touchSession error:', err);
    }
  }

  let memSession = mockSessions.get(token);
  if (!memSession) {
    const reloaded = loadDevSessions();
    for (const [k, v] of reloaded.entries()) {
      mockSessions.set(k, v);
    }
    memSession = mockSessions.get(token);
  }

  if (memSession && memSession.expiresAt > new Date()) {
    memSession.expiresAt = newExpiresAt;
    saveDevSessions(mockSessions);
    return true;
  }

  return false;
}

export async function validateSessionToken(
  token: string,
  options: { touch?: boolean } = { touch: true }
) {
  if (!token) return null;

  if (isDatabaseAvailable()) {
    try {
      const session = await withDbTimeout(
        getPrisma().session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        })
      );

      if (!session) return null;

      // 1. Strict Server-Side Expiration Check (> 300 seconds of inactivity)
      if (session.expiresAt < new Date()) {
        try {
          await withDbTimeout(getPrisma().session.delete({ where: { id: session.id } }));
        } catch {
          // ignore cleanup errors
        }
        return null;
      }

      if (session.user.status !== 'ACTIVE') {
        return null;
      }

      // 2. Rolling Inactivity Extension (throttled to avoid DB write thrashing)
      // Only extend if more than 30 seconds have passed since last renewal (remaining time < 270s)
      const remainingMs = session.expiresAt.getTime() - Date.now();
      if (options.touch && remainingMs < (INACTIVITY_TIMEOUT_SECONDS - 30) * 1000) {
        const newExpiresAt = new Date(Date.now() + INACTIVITY_TIMEOUT_SECONDS * 1000);
        try {
          await withDbTimeout(
            getPrisma().session.update({
              where: { id: session.id },
              data: { expiresAt: newExpiresAt },
            })
          );
          session.expiresAt = newExpiresAt;
        } catch (touchErr) {
          console.warn('[Auth] Rolling session extension error:', touchErr);
        }
      }

      return {
        session: {
          id: session.id,
          token: session.sessionToken,
          expiresAt: session.expiresAt,
        },
        user: {
          id: session.user.id,
          email: session.user.email,
          username: session.user.username,
          role: session.user.role,
          mustChangePassword: session.user.mustChangePassword,
        },
      };
    } catch (err) {
      console.warn('[Auth] Prisma session validate error, check mock sessions:', err);
    }
  }

  let memSession = mockSessions.get(token);
  if (!memSession) {
    // If not found in memory, reload from disk in development
    const reloaded = loadDevSessions();
    for (const [k, v] of reloaded.entries()) {
      mockSessions.set(k, v);
    }
    memSession = mockSessions.get(token);
  }
  if (!memSession) return null;

  if (memSession.expiresAt < new Date()) {
    mockSessions.delete(token);
    saveDevSessions(mockSessions);
    return null;
  }

  const user = mockAdminUsers.find((u) => u.id === memSession.userId);
  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  // Rolling Inactivity Extension for mock sessions
  const remainingMs = memSession.expiresAt.getTime() - Date.now();
  if (options.touch && remainingMs < (INACTIVITY_TIMEOUT_SECONDS - 30) * 1000) {
    memSession.expiresAt = new Date(Date.now() + INACTIVITY_TIMEOUT_SECONDS * 1000);
    saveDevSessions(mockSessions);
  }

  return {
    session: {
      id: `mem-${token.substring(0, 8)}`,
      token,
      expiresAt: memSession.expiresAt,
    },
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      mustChangePassword: false,
    },
  };
}

export async function invalidateSession(token: string): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await getPrisma().session.deleteMany({ where: { sessionToken: token } });
    } catch (err) {
      console.warn('[Auth] Prisma invalidate session error:', err);
    }
  }
  mockSessions.delete(token);
  saveDevSessions(mockSessions);
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await getPrisma().session.deleteMany({ where: { userId } });
    } catch (err) {
      console.warn('[Auth] Prisma invalidate all user sessions error:', err);
    }
  }
  for (const [token, data] of mockSessions.entries()) {
    if (data.userId === userId) {
      mockSessions.delete(token);
    }
  }
  saveDevSessions(mockSessions);
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ============================================================================
// USER LOOKUP & PASSWORD MODIFICATION
// ============================================================================

export async function findAdminByIdentifier(identifier: string) {
  const lower = identifier.trim().toLowerCase();
  if (isDatabaseAvailable()) {
    try {
      const user = await withDbTimeout(
        getPrisma().adminUser.findFirst({
          where: {
            OR: [
              { email: { equals: lower, mode: 'insensitive' } },
              { username: { equals: lower, mode: 'insensitive' } },
            ],
          },
        })
      );
      return user;
    } catch (err) {
      console.warn('[Auth] Prisma user lookup error:', err);
    }
  }

  return (
    mockAdminUsers.find(
      (u) => u.email.toLowerCase() === lower || u.username.toLowerCase() === lower
    ) || null
  );
}

export async function changeAdminPassword(userId: string, newPassword: string): Promise<boolean> {
  const newHash = await hashPassword(newPassword);

  if (isDatabaseAvailable()) {
    try {
      await withDbTimeout(
        getPrisma().adminUser.update({
          where: { id: userId },
          data: {
            passwordHash: newHash,
            mustChangePassword: false,
          },
        })
      );
      await invalidateAllUserSessions(userId);
      return true;
    } catch (err) {
      console.warn('[Auth] Prisma password change error:', err);
      return false;
    }
  }

  const user = mockAdminUsers.find((u) => u.id === userId);
  if (!user) return false;
  user.passwordHash = newHash;
  saveDevUsers(mockAdminUsers);
  await invalidateAllUserSessions(userId);
  return true;
}

export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters in length.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password) && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, error: 'Password must include at least one number (0-9) or symbol.' };
  }
  return { valid: true };
}

export async function createAdminUser(data: {
  name?: string;
  username: string;
  email: string;
  password: string;
  role?: 'SUPER_ADMIN' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED';
}) {
  const cleanUsername = data.username.trim().toLowerCase();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name?.trim() || cleanUsername;
  const role = data.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
  const status = data.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
    throw new Error('Username can only contain alphanumeric characters, underscores, and hyphens.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('A valid email address is required.');
  }

  const pwdCheck = validatePasswordStrength(data.password);
  if (!pwdCheck.valid) {
    throw new Error(pwdCheck.error || 'Password does not meet security requirements.');
  }

  // Uniqueness check
  if (isDatabaseAvailable()) {
    try {
      const existing = await withDbTimeout(
        getPrisma().adminUser.findFirst({
          where: {
            OR: [
              { username: { equals: cleanUsername, mode: 'insensitive' } },
              { email: { equals: cleanEmail, mode: 'insensitive' } },
            ],
          },
        })
      );
      if (existing) {
        if (existing.username.toLowerCase() === cleanUsername) {
          throw new Error(`Username "${cleanUsername}" is already registered.`);
        }
        throw new Error(`Email "${cleanEmail}" is already registered.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('already registered') || err.message.includes('unique'))) {
        throw err;
      }
    }
  }

  const mockExisting = mockAdminUsers.find(
    (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
  );
  if (mockExisting) {
    if (mockExisting.username.toLowerCase() === cleanUsername) {
      throw new Error(`Username "${cleanUsername}" is already registered.`);
    }
    throw new Error(`Email "${cleanEmail}" is already registered.`);
  }

  const passwordHash = await hashPassword(data.password);
  const newId = `admin-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  if (isDatabaseAvailable()) {
    try {
      const created = await withDbTimeout(
        getPrisma().adminUser.create({
          data: {
            id: newId,
            username: cleanUsername,
            email: cleanEmail,
            passwordHash,
            role,
            status,
          },
        })
      );
      return {
        id: created.id,
        name: cleanName,
        username: created.username,
        email: created.email,
        role: created.role,
        status: created.status,
        createdAt: created.createdAt.toISOString(),
        lastLoginAt: null,
      };
    } catch (err: unknown) {
      console.warn('[Auth] Prisma create admin user error, falling back to local store:', err);
      if (err instanceof Error && err.message.includes('already registered')) throw err;
    }
  }

  const newUser: MockAdmin = {
    id: newId,
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    role,
    status,
    mustChangePassword: false,
    createdAt: now,
    lastLoginAt: null,
  };

  mockAdminUsers.push(newUser);
  saveDevUsers(mockAdminUsers);

  return {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    createdAt: newUser.createdAt,
    lastLoginAt: null,
  };
}

export async function updateAdminUser(
  id: string,
  updates: {
    name?: string;
    username?: string;
    email?: string;
    role?: 'SUPER_ADMIN' | 'ADMIN';
    status?: 'ACTIVE' | 'SUSPENDED';
    password?: string;
  },
  requesterId?: string
) {
  let existingUser = mockAdminUsers.find((u) => u.id === id);

  if (isDatabaseAvailable()) {
    try {
      const dbUser = await withDbTimeout(getPrisma().adminUser.findUnique({ where: { id } }));
      if (dbUser) {
        existingUser = {
          id: dbUser.id,
          name: existingUser?.name || dbUser.username,
          username: dbUser.username,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          role: dbUser.role as 'SUPER_ADMIN' | 'ADMIN',
          status: dbUser.status as 'ACTIVE' | 'SUSPENDED',
          mustChangePassword: dbUser.mustChangePassword,
          createdAt: dbUser.createdAt.toISOString(),
          lastLoginAt: dbUser.lastLoginAt?.toISOString() || null,
        };
      }
    } catch (err) {
      console.warn('[Auth] Prisma user lookup for update error:', err);
    }
  }

  if (!existingUser) {
    throw new Error('Administrator account not found.');
  }

  // Check username uniqueness if changed
  if (updates.username && updates.username.trim().toLowerCase() !== existingUser.username.toLowerCase()) {
    const cleanUsername = updates.username.trim().toLowerCase();
    if (cleanUsername.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      throw new Error('Username can only contain alphanumeric characters, underscores, and hyphens (min 3 chars).');
    }
    const duplicate = mockAdminUsers.find((u) => u.id !== id && u.username.toLowerCase() === cleanUsername);
    if (duplicate) {
      throw new Error(`Username "${cleanUsername}" is already taken.`);
    }
    existingUser.username = cleanUsername;
  }

  // Check email uniqueness if changed
  if (updates.email && updates.email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
    const cleanEmail = updates.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('A valid email address is required.');
    }
    const duplicate = mockAdminUsers.find((u) => u.id !== id && u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      throw new Error(`Email "${cleanEmail}" is already in use.`);
    }
    existingUser.email = cleanEmail;
  }

  if (updates.name !== undefined) {
    existingUser.name = updates.name.trim();
  }

  // Safeguard: Check if attempting to deactivate or demote the last active super admin
  if (
    (updates.status === 'SUSPENDED' && existingUser.status === 'ACTIVE') ||
    (updates.role === 'ADMIN' && existingUser.role === 'SUPER_ADMIN')
  ) {
    const activeSuperAdmins = mockAdminUsers.filter(
      (u) => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE'
    );
    if (activeSuperAdmins.length <= 1 && activeSuperAdmins.some((u) => u.id === id)) {
      throw new Error('Safety protection: Cannot demote or suspend the last active super administrator.');
    }
  }

  if (updates.role) {
    existingUser.role = updates.role;
  }
  if (updates.status) {
    existingUser.status = updates.status;
  }

  let passwordChanged = false;
  if (updates.password && updates.password.trim().length > 0) {
    const pwdCheck = validatePasswordStrength(updates.password);
    if (!pwdCheck.valid) {
      throw new Error(pwdCheck.error || 'Password does not meet complexity requirements.');
    }
    existingUser.passwordHash = await hashPassword(updates.password);
    passwordChanged = true;
  }

  if (isDatabaseAvailable()) {
    try {
      const dbData: any = {
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
      };
      if (passwordChanged) {
        dbData.passwordHash = existingUser.passwordHash;
      }
      await withDbTimeout(
        getPrisma().adminUser.update({
          where: { id },
          data: dbData,
        })
      );
    } catch (err) {
      console.warn('[Auth] Prisma user update error:', err);
    }
  }

  const memIdx = mockAdminUsers.findIndex((u) => u.id === id);
  if (memIdx !== -1) {
    mockAdminUsers[memIdx] = { ...existingUser };
  } else {
    mockAdminUsers.push(existingUser);
  }
  saveDevUsers(mockAdminUsers);

  if (passwordChanged) {
    await invalidateAllUserSessions(id);
  }

  return {
    id: existingUser.id,
    name: existingUser.name || existingUser.username,
    username: existingUser.username,
    email: existingUser.email,
    role: existingUser.role,
    status: existingUser.status,
    createdAt: existingUser.createdAt || new Date().toISOString(),
    lastLoginAt: existingUser.lastLoginAt || null,
  };
}

export async function deleteAdminUser(id: string, currentAdminId: string) {
  if (id === currentAdminId) {
    throw new Error('Self-deletion lockout: You cannot delete your own administrative account while logged in.');
  }

  const user = mockAdminUsers.find((u) => u.id === id);
  if (!user) {
    throw new Error('Administrator account not found.');
  }

  // Active admin check
  const activeAdmins = mockAdminUsers.filter((u) => u.status === 'ACTIVE');
  if (user.status === 'ACTIVE' && activeAdmins.length <= 1) {
    throw new Error('Safety protection: Cannot delete the last active administrator.');
  }

  // Super admin check
  if (user.role === 'SUPER_ADMIN') {
    const activeSuperAdmins = mockAdminUsers.filter((u) => u.role === 'SUPER_ADMIN' && u.status === 'ACTIVE');
    if (activeSuperAdmins.length <= 1) {
      throw new Error('Safety protection: Cannot delete the last active super administrator.');
    }
  }

  if (isDatabaseAvailable()) {
    try {
      await withDbTimeout(getPrisma().adminUser.delete({ where: { id } }));
    } catch (err) {
      console.warn('[Auth] Prisma user delete error:', err);
    }
  }

  await invalidateAllUserSessions(id);

  const idx = mockAdminUsers.findIndex((u) => u.id === id);
  if (idx !== -1) {
    mockAdminUsers.splice(idx, 1);
    saveDevUsers(mockAdminUsers);
  }

  return { success: true };
}

export async function getAllAdminUsers() {
  if (isDatabaseAvailable()) {
    try {
      const users = await withDbTimeout(
        getPrisma().adminUser.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
          },
          orderBy: { createdAt: 'asc' },
        })
      );
      return users.map((u) => {
        const mem = mockAdminUsers.find((m) => m.id === u.id);
        return {
          id: u.id,
          name: mem?.name || (u.username === 'athrav_admin' ? 'Athrav Pathak' : u.username),
          email: u.email,
          username: u.username,
          role: u.role,
          status: u.status,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt?.toISOString() || null,
        };
      });
    } catch (err) {
      console.warn('[Auth] Prisma get all users error:', err);
    }
  }

  return mockAdminUsers.map((u) => ({
    id: u.id,
    name: u.name || (u.username === 'athrav_admin' ? 'Athrav Pathak' : u.username),
    email: u.email,
    username: u.username,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt || '2025-01-01T00:00:00.000Z',
    lastLoginAt: u.lastLoginAt || null,
  }));
}
