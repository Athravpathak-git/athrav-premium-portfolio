import { NextResponse } from 'next/server';
import {
  getSessionCookie,
  validateSessionToken,
  touchSession,
  INACTIVITY_TIMEOUT_SECONDS,
  SESSION_COOKIE_NAME,
  isSecureContext,
} from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = await getSessionCookie();
    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No active session.' },
        { status: 401 }
      );
    }

    // Strictly validate without auto-touching first to check expiration
    const current = await validateSessionToken(token, { touch: false });
    if (!current) {
      const res = NextResponse.json(
        { authenticated: false, error: 'Session expired due to inactivity.' },
        { status: 401 }
      );
      res.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: isSecureContext(),
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return res;
    }

    // Touch and extend session expiration by 300 seconds (5 minutes)
    const touched = await touchSession(token);
    if (!touched) {
      return NextResponse.json(
        { authenticated: false, error: 'Session expired due to inactivity.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      expiresInSeconds: INACTIVITY_TIMEOUT_SECONDS,
    });

    // Refresh the cookie's maxAge to match the renewed session deadline
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecureContext(),
      sameSite: 'lax',
      path: '/',
      maxAge: INACTIVITY_TIMEOUT_SECONDS,
    });

    return response;
  } catch (err) {
    console.error('[API Auth Heartbeat Error]:', err);
    return NextResponse.json(
      { error: 'Internal server error during heartbeat.' },
      { status: 500 }
    );
  }
}
