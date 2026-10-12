import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyPassword, hashPassword, validatePasswordStrength } from '@/lib/password.js';
import { getCurrentAdmin, rotateSession, setSessionCookie } from '@/lib/session.js';
import { logAuditEvent } from '@/lib/audit.js';
import { changePasswordSchema } from '@/lib/validation.js';

export async function POST(req) {
  try {
    const current = await getCurrentAdmin();
    if (!current || !current.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = changePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Fetch fresh user record with current password hash
    const user = await prisma.adminUser.findUnique({
      where: { id: current.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      await logAuditEvent({
        userId: user.id,
        action: 'PASSWORD_CHANGE_FAILED',
        req,
        metadata: { reason: 'Incorrect current password' },
      });
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
    }

    // Enforce password strength rules
    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.valid) {
      return NextResponse.json({ error: strengthResult.errors[0] }, { status: 400 });
    }

    // Disallow setting the same password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password cannot be the same as your current password.' },
        { status: 400 }
      );
    }

    // Hash with Argon2id
    const newHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false, // successfully changed
      },
    });

    // Invalidate old session and rotate to a fresh session token
    const { token, expiresAt } = await rotateSession(current.rawToken, user.id, req);

    await logAuditEvent({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      req,
      metadata: { username: user.username },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully. You now have full dashboard access.',
    });

    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the password.' },
      { status: 500 }
    );
  }
}
