import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getAchievementsList,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/lib/data-service';
import { achievementSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const items = await getAchievementsList(false);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const validation = achievementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createAchievement(validation.data as any);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'ACHIEVEMENT_CREATED',
      entityType: 'Achievement',
      entityId: created.id,
      req,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err) {
    console.error('[API Admin Achievement POST Error]:', err);
    return NextResponse.json({ error: 'Failed to create achievement.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const validation = achievementSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateAchievement(id, validation.data as any);
    if (!updated) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'ACHIEVEMENT_UPDATED',
      entityType: 'Achievement',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('[API Admin Achievement PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update achievement.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const success = await deleteAchievement(id);
    if (!success) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'ACHIEVEMENT_DELETED',
      entityType: 'Achievement',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Achievement deleted.' });
  } catch (err) {
    console.error('[API Admin Achievement DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to delete achievement.' }, { status: 500 });
  }
}
