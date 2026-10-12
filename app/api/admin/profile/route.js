import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';
import { logAuditEvent } from '@/lib/audit.js';
import { profileSchema } from '@/lib/validation.js';

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  let profile = await prisma.profile.findFirst();
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        name: 'Athrav Pathak',
        headline: 'Full-Stack Software Engineer & Systems Architect',
        bio: 'Designing and engineering resilient, high-performance distributed systems, modern web architectures, and elegant user interfaces.',
        email: 'contact@athravpathak.com',
      },
    });
  }

  return NextResponse.json({ profile });
}

export async function PUT(req) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const parseResult = profileSchema.safeParse(body);

  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors[0]?.message || 'Invalid profile data.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  let profile = await prisma.profile.findFirst();
  if (!profile) {
    profile = await prisma.profile.create({
      data: parseResult.data,
    });
  } else {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: parseResult.data,
    });
  }

  await logAuditEvent({
    userId: admin.id,
    action: 'PROFILE_UPDATED',
    entityType: 'Profile',
    entityId: profile.id,
    req,
    metadata: { name: profile.name },
  });

  return NextResponse.json({ success: true, profile });
}
