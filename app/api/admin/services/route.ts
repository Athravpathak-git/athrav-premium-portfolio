import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getServicesList,
  createService,
  updateService,
  deleteService,
} from '@/lib/data-service';
import { serviceSchema } from '@/lib/validation/schemas';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const items = await getServicesList(false);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const validation = serviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const created = await createService(validation.data as any);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SERVICE_CREATED',
      entityType: 'Service',
      entityId: created.id,
      req,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err) {
    console.error('[API Admin Service POST Error]:', err);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const validation = serviceSchema.partial().safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateService(id, validation.data as any);
    if (!updated) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SERVICE_UPDATED',
      entityType: 'Service',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error('[API Admin Service PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });

    const success = await deleteService(id);
    if (!success) return NextResponse.json({ error: 'Record not found.' }, { status: 404 });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'SERVICE_DELETED',
      entityType: 'Service',
      entityId: id,
      req,
    });

    return NextResponse.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    console.error('[API Admin Service DELETE Error]:', err);
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 });
  }
}
