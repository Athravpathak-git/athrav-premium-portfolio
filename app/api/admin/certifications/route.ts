import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getCertificationsList,
  createCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/data-service';
import { certificationSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const items = await getCertificationsList({ publishedOnly: false });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const validation = certificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createCertification(validation.data as any);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATION_CREATED',
      entityType: 'Certification',
      entityId: created.id,
      req,
      metadata: { slug: created.slug, title: created.title },
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err) {
    console.error('[API Admin Certification POST Error]:', err);
    return NextResponse.json({ error: 'Failed to create certification.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Certification ID is required.' }, { status: 400 });

    const validation = certificationSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateCertification(id, validation.data as any);
    if (!updated) return NextResponse.json({ error: 'Certification not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATION_UPDATED',
      entityType: 'Certification',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('[API Admin Certification PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update certification.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Certification ID is required.' }, { status: 400 });

    const success = await deleteCertification(id);
    if (!success) return NextResponse.json({ error: 'Certification not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATION_DELETED',
      entityType: 'Certification',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Certification deleted.' });
  } catch (err) {
    console.error('[API Admin Certification DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to delete certification.' }, { status: 500 });
  }
}
