import { NextResponse } from 'next/server';
import { getSessionCookie, invalidateSession, clearSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const token = await getSessionCookie();
    if (token) {
      await invalidateSession(token);
      await clearSessionCookie();
      await logAuditEvent({
        action: 'AUTH_LOGOUT',
        req,
      });
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[API Auth Logout Error]:', err);
    return NextResponse.json(
      { error: 'An error occurred during logout.' },
      { status: 500 }
    );
  }
}
