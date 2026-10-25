import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation/schemas';
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limiter';
import {
  findAdminByIdentifier,
  verifyPassword,
  createSession,
  setSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  isSecureContext,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`login:${ip}`, 5, 900); // 5 attempts per 15 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. For security, please wait ${rateLimit.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid submission',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;
    const user = await findAdminByIdentifier(identifier);

    // Generic timing-safe error to prevent username/email enumeration
    const genericAuthError = 'Invalid credentials. Please verify your username/email and password.';

    if (!user) {
      await logAuditEvent({
        action: 'AUTH_LOGIN_FAILED',
        req,
        metadata: { identifier, reason: 'user_not_found' },
      });
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      await logAuditEvent({
        userId: user.id,
        action: 'AUTH_LOGIN_SUSPENDED',
        req,
      });
      return NextResponse.json(
        { error: 'Account is inactive or suspended. Please contact administrator.' },
        { status: 403 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      await logAuditEvent({
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        req,
        metadata: { reason: 'invalid_password' },
      });
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    // Reset rate limiter on successful login
    resetRateLimit(`login:${ip}`);

    // Create secure server-side session
    const userAgent = req.headers.get('user-agent') || undefined;
    const token = await createSession(user.id, { ipAddress: ip, userAgent });

    await setSessionCookie(token);

    await logAuditEvent({
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      req,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecureContext(),
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (err) {
    console.error('[API Auth Login Error]:', err);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
