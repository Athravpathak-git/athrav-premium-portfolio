import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-guard';
import { SESSION_COOKIE_NAME, isSecureContext } from '@/lib/auth';

export async function GET() {
  const current = await getCurrentAdmin();
  if (!current) {
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    res.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecureContext(),
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    user: current.user,
  });
}
