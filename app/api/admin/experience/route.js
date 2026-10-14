import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { experienceSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  });

  return NextResponse.json({ experiences });
}

export async function POST(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = experienceSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid experience data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { startDate, endDate, isCurrent, ...rest } = parseResult.data;

  const experience = await prisma.experience.create({
    data: {
      ...rest,
      isCurrent: Boolean(isCurrent),
      startDate: new Date(startDate),
      endDate: isCurrent ? null : (endDate ? new Date(endDate) : null),
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'EXPERIENCE_CREATED',
    entityType: 'Experience',
    entityId: experience.id,
    req,
    metadata: { role: experience.role, company: experience.company },
  });

  try {
    revalidatePath('/experience');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, experience });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, startDate, endDate, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Experience ID is required.' }, { status: 400 });
  }

  const parseResult = experienceSchema.safeParse({ ...updateData, startDate, endDate });
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid experience data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { isCurrent: updatedIsCurrent, ...restUpdate } = parseResult.data;

  const updated = await prisma.experience.update({
    where: { id },
    data: {
      ...restUpdate,
      isCurrent: Boolean(updatedIsCurrent),
      startDate: new Date(parseResult.data.startDate),
      endDate: updatedIsCurrent ? null : (parseResult.data.endDate ? new Date(parseResult.data.endDate) : null),
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'EXPERIENCE_UPDATED',
    entityType: 'Experience',
    entityId: id,
    req,
    metadata: { role: updated.role, company: updated.company },
  });

  try {
    revalidatePath('/experience');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, experience: updated });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Experience ID is required.' }, { status: 400 });
  }

  const existing = await prisma.experience.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Experience not found.' }, { status: 404 });
  }

  await prisma.experience.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'EXPERIENCE_DELETED',
    entityType: 'Experience',
    entityId: id,
    req,
    metadata: { role: existing.role, company: existing.company },
  });

  try {
    revalidatePath('/experience');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, message: 'Experience deleted successfully.' });
}
