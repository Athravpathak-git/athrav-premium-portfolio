import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { achievementSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const achievements = await prisma.achievement.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ achievements });
}

export async function POST(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = achievementSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid achievement data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { date, ...rest } = parseResult.data;

  const achievement = await prisma.achievement.create({
    data: {
      ...rest,
      date: date ? new Date(date) : null,
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'ACHIEVEMENT_CREATED',
    entityType: 'Achievement',
    entityId: achievement.id,
    req,
    metadata: { title: achievement.title },
  });

  try {
    revalidatePath('/achievements');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, achievement });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, date, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Achievement ID is required.' }, { status: 400 });
  }

  const parseResult = achievementSchema.safeParse({ ...updateData, date });
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid achievement data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const updated = await prisma.achievement.update({
    where: { id },
    data: {
      ...parseResult.data,
      date: date ? new Date(date) : null,
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'ACHIEVEMENT_UPDATED',
    entityType: 'Achievement',
    entityId: id,
    req,
    metadata: { title: updated.title },
  });

  try {
    revalidatePath('/achievements');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, achievement: updated });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Achievement ID is required.' }, { status: 400 });
  }

  const existing = await prisma.achievement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Achievement not found.' }, { status: 404 });
  }

  await prisma.achievement.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'ACHIEVEMENT_DELETED',
    entityType: 'Achievement',
    entityId: id,
    req,
    metadata: { title: existing.title },
  });

  try {
    revalidatePath('/achievements');
    revalidatePath('/about');
    revalidatePath('/');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, message: 'Achievement deleted successfully.' });
}
