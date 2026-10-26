import { NextResponse } from 'next/server';
import { requireSuperAdminApi } from '@/lib/auth-guard';
import {
  getAllAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  const users = await getAllAdminUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { name, username, email, password, role, status } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required fields.' },
        { status: 400 }
      );
    }

    const newUser = await createAdminUser({
      name,
      username,
      email,
      password,
      role: role || 'ADMIN',
      status: status || 'ACTIVE',
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'ADMIN_USER_CREATED',
      entityType: 'AdminUser',
      entityId: newUser.id,
      req,
      metadata: { username: newUser.username, email: newUser.email, role: newUser.role },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create administrator account.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, name, username, email, role, status, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Administrator ID is required for updates.' }, { status: 400 });
    }

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

export async function DELETE(req: Request) {
  const auth = await requireSuperAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    let id: string | null = null;
    const url = new URL(req.url);
    id = url.searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // no json body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Administrator ID is required for deletion.' }, { status: 400 });
    }

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
