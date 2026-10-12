import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { skillSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  return NextResponse.json({ skills });
}

export async function POST(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = skillSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid skill data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const skill = await prisma.skill.create({
    data: parseResult.data,
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'SKILL_CREATED',
    entityType: 'Skill',
    entityId: skill.id,
    req,
    metadata: { name: skill.name, category: skill.category },
  });

  return NextResponse.json({ success: true, skill });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Skill ID is required.' }, { status: 400 });
  }

  const parseResult = skillSchema.safeParse(updateData);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid skill data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const updated = await prisma.skill.update({
    where: { id },
    data: parseResult.data,
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'SKILL_UPDATED',
    entityType: 'Skill',
    entityId: id,
    req,
    metadata: { name: updated.name, category: updated.category },
  });

  return NextResponse.json({ success: true, skill: updated });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Skill ID is required.' }, { status: 400 });
  }

  const existing = await prisma.skill.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Skill not found.' }, { status: 404 });
  }

  await prisma.skill.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'SKILL_DELETED',
    entityType: 'Skill',
    entityId: id,
    req,
    metadata: { name: existing.name },
  });

  return NextResponse.json({ success: true, message: 'Skill deleted successfully.' });
}
