import { NextResponse } from 'next/server';
import { requireSuperAdminApi } from '@/lib/auth-guard';
import { updateAdminUser, deleteAdminUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, username, email, role, status, password } = body;

    const updated = await updateAdminUser(
      id,
      { name, username, email, role, status, password },
      auth.admin.id
    );

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'ADMIN_USER_UPDATED',
      entityType: 'AdminUser',
      entityId: updated.id,
      req,
      metadata: { username: updated.username, role: updated.role, status: updated.status },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update administrator account.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    await deleteAdminUser(id, auth.admin.id);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'ADMIN_USER_DELETED',
      entityType: 'AdminUser',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Administrator account deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete administrator account.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
