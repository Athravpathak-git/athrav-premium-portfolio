import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { certificationSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const certifications = await prisma.certification.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ certifications });
}

export async function POST(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = certificationSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid certification data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { issueDate, expiryDate, ...rest } = parseResult.data;

  const certification = await prisma.certification.create({
    data: {
      ...rest,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'CERTIFICATION_CREATED',
    entityType: 'Certification',
    entityId: certification.id,
    req,
    metadata: { title: certification.title, issuer: certification.issuer },
  });

  try {
    revalidatePath('/certifications');
    revalidatePath('/about');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, certification });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, issueDate, expiryDate, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Certification ID is required.' }, { status: 400 });
  }

  const parseResult = certificationSchema.safeParse({ ...updateData, issueDate, expiryDate });
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid certification data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const updated = await prisma.certification.update({
    where: { id },
    data: {
      ...parseResult.data,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'CERTIFICATION_UPDATED',
    entityType: 'Certification',
    entityId: id,
    req,
    metadata: { title: updated.title },
  });

  try {
    revalidatePath('/certifications');
    revalidatePath('/about');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, certification: updated });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Certification ID is required.' }, { status: 400 });
  }

  const existing = await prisma.certification.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Certification not found.' }, { status: 404 });
  }

  await prisma.certification.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'CERTIFICATION_DELETED',
    entityType: 'Certification',
    entityId: id,
    req,
    metadata: { title: existing.title },
  });

  try {
    revalidatePath('/certifications');
    revalidatePath('/about');
  } catch (err) {
    // Non-fatal if outside server context
  }

  return NextResponse.json({ success: true, message: 'Certification deleted successfully.' });
}
