import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { isDatabaseConfigured, isDatabaseAvailable, withDbTimeout, getPrisma } from './db';

export const SESSION_COOKIE_NAME = 'athrav_admin_session';
export const SESSION_MAX_AGE_SECONDS = Number(process.env.SESSION_MAX_AGE_SECONDS) || 60 * 60 * 24 * 7; // 7 days

export function isSecureContext(): boolean {
  return process.env.NODE_ENV === 'production' && Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https'));
}

const DEV_STORAGE_DIR = path.join(process.cwd(), '.dev-storage');
const SESSIONS_FILE = path.join(DEV_STORAGE_DIR, 'sessions.json');
const USERS_FILE = path.join(DEV_STORAGE_DIR, 'admin-users.json');

// In-memory mock session and user store when database is not configured
export interface MockAdmin {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  mustChangePassword?: boolean;
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
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@athravpathak.dev',
    username: process.env.INITIAL_ADMIN_USERNAME || 'athrav_admin',
    passwordHash: `scrypt:${defaultSalt}:${defaultHash}`,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    mustChangePassword: false,
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
  return [...initialMockAdminUsers];
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
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

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

export async function validateSessionToken(token: string) {
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

      if (session.expiresAt < new Date()) {
        await withDbTimeout(getPrisma().session.delete({ where: { id: session.id } }));
        return null;
      }

      if (session.user.status !== 'ACTIVE') {
        return null;
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
      return users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString() || null,
      }));
    } catch (err) {
      console.warn('[Auth] Prisma get all users error:', err);
    }
  }

  return mockAdminUsers.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    status: u.status,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  }));
}
