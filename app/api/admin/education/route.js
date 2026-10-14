import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { educationSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const educations = await prisma.education.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  });

  return NextResponse.json({ education: educations });
}

export async function POST(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = educationSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid education data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { startDate, endDate, status, ...rest } = parseResult.data;

  const parseSafeDate = (val) => {
    if (!val) return null;
    const trimmed = String(val).trim();
    if (/^\d{4}$/.test(trimmed)) {
      return new Date(`${trimmed}-01-01T00:00:00Z`);
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const education = await prisma.education.create({
    data: {
      ...rest,
      status: status || 'Completed',
      startDate: parseSafeDate(startDate),
      endDate: status === 'Pursuing' ? null : parseSafeDate(endDate),
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'EDUCATION_CREATED',
    entityType: 'Education',
    entityId: education.id,
    req,
    metadata: { institution: education.institution, degree: education.degree },
  });

  try {
    revalidatePath('/education');
    revalidatePath('/about');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, education });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, startDate, endDate, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Education ID is required.' }, { status: 400 });
  }

  const parseResult = educationSchema.safeParse({ ...updateData, startDate, endDate });
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid education data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const parseSafeDate = (val) => {
    if (!val) return null;
    const trimmed = String(val).trim();
    if (/^\d{4}$/.test(trimmed)) {
      return new Date(`${trimmed}-01-01T00:00:00Z`);
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const { status, ...rest } = parseResult.data;

  const updated = await prisma.education.update({
    where: { id },
    data: {
      ...rest,
      status: status || 'Completed',
      startDate: parseSafeDate(parseResult.data.startDate),
      endDate: status === 'Pursuing' ? null : parseSafeDate(parseResult.data.endDate),
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'EDUCATION_UPDATED',
    entityType: 'Education',
    entityId: id,
    req,
    metadata: { institution: updated.institution, degree: updated.degree },
  });

  try {
    revalidatePath('/education');
    revalidatePath('/about');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, education: updated });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Education ID is required.' }, { status: 400 });
  }

  const existing = await prisma.education.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Education record not found.' }, { status: 404 });
  }

  await prisma.education.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'EDUCATION_DELETED',
    entityType: 'Education',
    entityId: id,
    req,
    metadata: { institution: existing.institution },
  });

  try {
    revalidatePath('/education');
    revalidatePath('/about');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, message: 'Education record deleted successfully.' });
}
