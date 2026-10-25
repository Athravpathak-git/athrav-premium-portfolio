import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '@/lib/data-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const messages = await getContactMessages();
  return NextResponse.json({ messages });
}

export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, isRead, isResolved, isArchived } = body;
    if (!id) return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });

    const updated = await updateContactMessageStatus(id, {
      isRead,
      isResolved,
      isArchived,
    });
    if (!updated) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'MESSAGE_STATUS_UPDATED',
      entityType: 'ContactMessage',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error('[API Admin Messages PATCH Error]:', err);
    return NextResponse.json({ error: 'Failed to update message.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });

    const success = await deleteContactMessage(id);
    if (!success) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'MESSAGE_DELETED',
      entityType: 'ContactMessage',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('[API Admin Messages DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to delete message.' }, { status: 500 });
  }
}
