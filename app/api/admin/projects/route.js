import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { projectSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ projects });
}

export async function POST(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = projectSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid project data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const data = parseResult.data;

  // Check unique slug
  const existing = await prisma.project.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'A project with this URL slug already exists. Please choose a unique slug.' },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data,
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'PROJECT_CREATED',
    entityType: 'Project',
    entityId: project.id,
    req,
    metadata: { title: project.title, slug: project.slug, isPublished: project.isPublished },
  });

  return NextResponse.json({ success: true, project });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
  }

  const parseResult = projectSchema.safeParse(updateData);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid project data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const data = parseResult.data;

  // Verify project exists
  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  // Check unique slug if changed
  if (data.slug !== current.slug) {
    const slugConflict = await prisma.project.findUnique({
      where: { slug: data.slug },
    });
    if (slugConflict) {
      return NextResponse.json(
        { error: 'A project with this URL slug already exists.' },
        { status: 400 }
      );
    }
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data,
  });

  await logAuditEvent({
    userId: admin.id,
    action: 'PROJECT_UPDATED',
    entityType: 'Project',
    entityId: id,
    req,
    metadata: { title: updatedProject.title, slug: updatedProject.slug, isPublished: updatedProject.isPublished },
  });

  return NextResponse.json({ success: true, project: updatedProject });
}

export async function DELETE(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
  }

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });

  await logAuditEvent({
    userId: admin.id,
    action: 'PROJECT_DELETED',
    entityType: 'Project',
    entityId: id,
    req,
    metadata: { title: existing.title, slug: existing.slug },
  });

  return NextResponse.json({ success: true, message: 'Project deleted successfully.' });
}
