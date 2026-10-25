import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getHomepageSections, updateHomepageSection } from '@/lib/data-service';
import { homepageSectionSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const sections = await getHomepageSections();
  return NextResponse.json({ sections });
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { sectionKey, ...data } = body;
    if (!sectionKey) {
      return NextResponse.json({ error: 'Section key is required.' }, { status: 400 });
    }

    const validation = homepageSectionSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateHomepageSection(sectionKey, validation.data);
    if (!updated) {
      return NextResponse.json({ error: 'Section not found.' }, { status: 404 });
    }

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'HOMEPAGE_SECTION_UPDATED',
      entityType: 'HomepageSection',
      entityId: sectionKey,
      req,
    });

    return NextResponse.json({ success: true, section: updated });
  } catch (err) {
    console.error('[API Admin Homepage PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update section.' }, { status: 500 });
  }
}
