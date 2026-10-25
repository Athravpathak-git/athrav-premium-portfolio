import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { changePasswordSchema } from '@/lib/validation/schemas';
import {
  findAdminByIdentifier,
  verifyPassword,
  changeAdminPassword,
  createSession,
  setSessionCookie,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { getClientIp } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;
    const user = await findAdminByIdentifier(auth.admin.email);

    if (!user) {
      return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        userId: user.id,
        action: 'PASSWORD_CHANGE_FAILED',
        req,
        metadata: { reason: 'incorrect_current_password' },
      });
      return NextResponse.json(
        { error: 'Current password provided is incorrect.' },
        { status: 400 }
      );
    }

    // Change password (this invalidates all active sessions)
    await changeAdminPassword(user.id, newPassword);

    // Create a new session for the current client
    const ip = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || undefined;
    const newToken = await createSession(user.id, { ipAddress: ip, userAgent });
    await setSessionCookie(newToken);

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_CHANGED_SUCCESS',
      req,
    });

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated. All other active sessions have been revoked.',
    });
  } catch (err) {
    console.error('[API Change Password Error]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating password.' },
      { status: 500 }
    );
  }
}
