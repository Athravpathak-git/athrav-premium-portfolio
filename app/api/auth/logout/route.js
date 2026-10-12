import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, revokeSession, clearSessionCookie, getCurrentAdmin } from '@/lib/session.js';
import { logAuditEvent } from '@/lib/audit.js';

export async function POST(req) {
  try {
    const current = await getCurrentAdmin();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await revokeSession(token);
    }

    if (current?.user) {
      await logAuditEvent({
        userId: current.user.id,
        action: 'LOGOUT',
        req,
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  }
}
