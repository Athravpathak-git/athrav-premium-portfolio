import crypto from 'crypto';
import { cookies } from 'next/headers';
import { isDatabaseConfigured, getPrisma } from './db';

const SESSION_COOKIE_NAME = 'athrav_admin_session';
const SESSION_MAX_AGE_SECONDS = Number(process.env.SESSION_MAX_AGE_SECONDS) || 60 * 60 * 24 * 7; // 7 days

// In-memory mock session and user store when database is not configured
interface MockAdmin {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  mustChangePassword?: boolean;
}

const mockSessions = new Map<
  string,
  {
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }
>();

// Default mock admin password hash (fallback if unconfigured)
// Password: "ReplaceWithStrongPassword123!"
const defaultSalt = '0f9a2b8e4c7d1f3a5e8c2a9f4b7d1e3c';
const defaultHash = crypto.scryptSync('ReplaceWithStrongPassword123!', defaultSalt, 64).toString('hex');

const mockAdminUsers: MockAdmin[] = [
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

  if (isDatabaseConfigured()) {
    try {
      await getPrisma().session.create({
        data: {
          sessionToken: token,
          userId,
          expiresAt,
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        },
      });
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

  return token;
}

export async function validateSessionToken(token: string) {
  if (!token) return null;

  if (isDatabaseConfigured()) {
    try {
      const session = await getPrisma().session.findUnique({
        where: { sessionToken: token },
        include: { user: true },
      });

      if (!session) return null;

      if (session.expiresAt < new Date()) {
        await getPrisma().session.delete({ where: { id: session.id } });
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

  const memSession = mockSessions.get(token);
  if (!memSession) return null;

  if (memSession.expiresAt < new Date()) {
    mockSessions.delete(token);
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
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
    secure: process.env.NODE_ENV === 'production',
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
  if (isDatabaseConfigured()) {
    try {
      const user = await getPrisma().adminUser.findFirst({
        where: {
          OR: [
            { email: { equals: lower, mode: 'insensitive' } },
            { username: { equals: lower, mode: 'insensitive' } },
          ],
        },
      });
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

  if (isDatabaseConfigured()) {
    try {
      await getPrisma().adminUser.update({
        where: { id: userId },
        data: {
          passwordHash: newHash,
          mustChangePassword: false,
        },
      });
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
  await invalidateAllUserSessions(userId);
  return true;
}

export async function getAllAdminUsers() {
  if (isDatabaseConfigured()) {
    try {
      const users = await getPrisma().adminUser.findMany({
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
      });
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
