import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getSkillsList,
  createSkill,
  updateSkill,
  deleteSkill,
} from '@/lib/data-service';
import { skillSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const items = await getSkillsList(false);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const validation = skillSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createSkill(validation.data as any);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SKILL_CREATED',
      entityType: 'Skill',
      entityId: created.id,
      req,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err) {
    console.error('[API Admin Skill POST Error]:', err);
    return NextResponse.json({ error: 'Failed to create skill.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const validation = skillSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateSkill(id, validation.data as any);
    if (!updated) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SKILL_UPDATED',
      entityType: 'Skill',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('[API Admin Skill PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update skill.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const success = await deleteSkill(id);
    if (!success) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SKILL_DELETED',
      entityType: 'Skill',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Skill deleted.' });
  } catch (err) {
    console.error('[API Admin Skill DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to delete skill.' }, { status: 500 });
  }
}
