import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getExperienceList,
  createExperience,
  updateExperience,
  deleteExperience,
} from '@/lib/data-service';
import { experienceSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const items = await getExperienceList(false);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const validation = experienceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createExperience(validation.data as any);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'EXPERIENCE_CREATED',
      entityType: 'Experience',
      entityId: created.id,
      req,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err) {
    console.error('[API Admin Experience POST Error]:', err);
    return NextResponse.json({ error: 'Failed to create experience record.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const validation = experienceSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateExperience(id, validation.data as any);
    if (!updated) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'EXPERIENCE_UPDATED',
      entityType: 'Experience',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('[API Admin Experience PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update experience record.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const success = await deleteExperience(id);
    if (!success) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'EXPERIENCE_DELETED',
      entityType: 'Experience',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Experience record deleted.' });
  } catch (err) {
    console.error('[API Admin Experience DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to delete experience record.' }, { status: 500 });
  }
}
