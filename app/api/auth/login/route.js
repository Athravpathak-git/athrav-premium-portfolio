import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyPassword } from '@/lib/password.js';
import { createSession, setSessionCookie, getClientIp } from '@/lib/session.js';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limiter.js';
import { logAuditEvent } from '@/lib/audit.js';
import { loginSchema } from '@/lib/validation.js';

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimitKey = `login:ip:${ip}`;

    // Rate limit: 5 attempts per 15 minutes (900 seconds)
    const ipLimit = await checkRateLimit(ipLimitKey, 5, 900);
    if (!ipLimit.allowed) {
      const waitMinutes = Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 60000);
      await logAuditEvent({
        action: 'LOGIN_RATE_LIMITED',
        req,
        metadata: { ip, message: 'Exceeded maximum login attempts' },
      });
      return NextResponse.json(
        { error: `Too many failed login attempts. Please try again in ${waitMinutes} minutes.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 400 }
      );
    }

    const { username, password } = parseResult.data;

    // Rate limit by username as well to prevent distributed brute force on single account
    const userLimitKey = `login:user:${username.toLowerCase()}`;
    const userLimit = await checkRateLimit(userLimitKey, 5, 900);
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to repeated attempts. Please wait.' },
        { status: 429 }
      );
    }

    // Generic response message to prevent username enumeration
    const genericAuthError = 'Invalid username or password.';

    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!user) {
      // Dummy verify to mitigate timing attacks
      await verifyPassword(
        password,
        '$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$dGVzdGhhc2h0ZXN0aGFzaHRlc3RoYXNo'
      );
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        req,
        metadata: { attemptedUsername: username, reason: 'User not found' },
      });
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      await logAuditEvent({
        userId: user.id,
        action: 'LOGIN_FAILED',
        req,
        metadata: { attemptedUsername: username, reason: 'Invalid password' },
      });
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    // Successful login: reset rate limits
    await resetRateLimit(ipLimitKey);
    await resetRateLimit(userLimitKey);

    // Create session in DB
    const { token, expiresAt } = await createSession(user.id, req);

    await logAuditEvent({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      req,
      metadata: { username: user.username },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });

    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
