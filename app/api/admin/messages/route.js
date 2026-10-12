import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ messages });
}

export async function PATCH(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, isRead, isArchived } = body;

  if (!id) {
    return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });
  }

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  }

  const data = {};
  if (typeof isRead === 'boolean') data.isRead = isRead;
  if (typeof isArchived === 'boolean') data.isArchived = isArchived;

  const updated = await prisma.contactMessage.update({
    where: { id },
    data,
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'MESSAGE_STATUS_UPDATED',
    entityType: 'ContactMessage',
    entityId: id,
    req,
    metadata: { isRead: updated.isRead, isArchived: updated.isArchived },
  });

  return NextResponse.json({ success: true, message: updated });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });
  }

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
  }

  await prisma.contactMessage.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'MESSAGE_DELETED',
    entityType: 'ContactMessage',
    entityId: id,
    req,
    metadata: { subject: existing.subject },
  });

  return NextResponse.json({ success: true, message: 'Message deleted successfully.' });
}
