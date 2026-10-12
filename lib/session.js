import crypto from 'crypto';
import { cookies } from 'next/headers';
import prisma from './prisma.js';

export const SESSION_COOKIE_NAME = 'athrav_admin_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash raw token using SHA-256 before database lookup/storage.
 * @param {string} token
 * @returns {string}
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure random session token.
 * @returns {string}
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Extract client IP safely from headers or request.
 * @param {Request|Headers|object} req
 * @returns {string}
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1';
  const headers = req.headers || (req instanceof Headers ? req : null);
  if (!headers) return '127.0.0.1';

  const getHeader = (name) => {
    if (typeof headers.get === 'function') return headers.get(name);
    return headers[name] || headers[name.toLowerCase()];
  };

  const forwarded = getHeader('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return getHeader('x-real-ip') || '127.0.0.1';
}

/**
 * Extract user-agent safely.
 * @param {Request|Headers|object} req
 * @returns {string}
 */
export function getUserAgent(req) {
  if (!req) return 'Unknown';
  const headers = req.headers || (req instanceof Headers ? req : null);
  if (!headers) return 'Unknown';
  if (typeof headers.get === 'function') {
    return headers.get('user-agent') || 'Unknown';
  }
  return headers['user-agent'] || 'Unknown';
}

/**
 * Create a new database session and return the raw token.
 * @param {string} userId
 * @param {Request|object} req
 * @returns {Promise<{ token: string, expiresAt: Date }>}
 */
export async function createSession(userId, req = null) {
  const token = generateSessionToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);

  await prisma.session.create({
    data: {
      sessionToken: hashedToken,
      userId,
      expiresAt,
      ipAddress,
      userAgent: userAgent.slice(0, 500),
    },
  });

  return { token, expiresAt };
}

/**
 * Set the secure HTTP-only cookie on response headers or cookies store.
 * @param {import('next/headers').cookies|Response} target
 * @param {string} token
 * @param {Date} expiresAt
 */
export function setSessionCookie(target, token, expiresAt) {
  const isProd = process.env.NODE_ENV === 'production';
  const options = {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  };

  if (typeof target?.cookies?.set === 'function') {
    target.cookies.set(options);
  } else if (typeof target?.set === 'function') {
    target.set(options);
  }
}

/**
 * Clear the session cookie.
 * @param {import('next/headers').cookies|Response} target
 */
export function clearSessionCookie(target) {
  const isProd = process.env.NODE_ENV === 'production';
  const options = {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  };

  if (typeof target?.cookies?.set === 'function') {
    target.cookies.set(options);
  } else if (typeof target?.set === 'function') {
    target.set(options);
  }
}

/**
 * Revoke and delete a session from database.
 * @param {string} token
 */
export async function revokeSession(token) {
  if (!token) return;
  const hashedToken = hashToken(token);
  try {
    await prisma.session.deleteMany({
      where: { sessionToken: hashedToken },
    });
  } catch (error) {
    // Silently continue if already removed
  }
}

/**
 * Rotate a session (revoke old, issue new) for privilege elevation or after login.
 * @param {string} oldToken
 * @param {string} userId
 * @param {Request|object} req
 * @returns {Promise<{ token: string, expiresAt: Date }>}
 */
export async function rotateSession(oldToken, userId, req = null) {
  if (oldToken) {
    await revokeSession(oldToken);
  }
  return createSession(userId, req);
}

/**
 * Verify current session from cookies and return the authenticated admin user.
 * @returns {Promise<{ user: object, session: object } | null>}
 */
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const hashedToken = hashToken(token);
    const session = await prisma.session.findUnique({
      where: { sessionToken: hashedToken },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            mustChangePassword: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!session) return null;

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    return {
      user: session.user,
      session,
      rawToken: token,
    };
  } catch (error) {
    return null;
  }
}
