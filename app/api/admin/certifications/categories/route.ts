import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getCertificateCategoriesList,
  getCertificateCategoryUsageCounts,
  createCertificateCategory,
  updateCertificateCategory,
  deleteCertificateCategory,
} from '@/lib/data-service';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const categories = await getCertificateCategoriesList();
    const usageCounts = await getCertificateCategoryUsageCounts();

    return NextResponse.json({
      success: true,
      categories,
      usageCounts,
    });
  } catch (err: unknown) {
    console.error('[API Categories GET Error]:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve certificate categories.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : undefined;

    const created = await createCertificateCategory({ name, sortOrder });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATE_CATEGORY_CREATED',
      entityType: 'CertificateCategory',
      entityId: created.id,
      req,
      metadata: { name: created.name, slug: created.slug },
    });

    return NextResponse.json({
      success: true,
      category: created,
      message: `Category "${created.name}" created successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create certificate category.';
    const status = message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, name, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const updated = await updateCertificateCategory(id, {
      name: typeof name === 'string' ? name.trim() : undefined,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATE_CATEGORY_UPDATED',
      entityType: 'CertificateCategory',
      entityId: id,
      req,
      metadata: { name: updated.name, slug: updated.slug },
    });

    return NextResponse.json({
      success: true,
      category: updated,
      message: `Category "${updated.name}" updated successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update certificate category.';
    const status = message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reassignToId = searchParams.get('reassignToId') || undefined;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const result = await deleteCertificateCategory(id, reassignToId);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATE_CATEGORY_DELETED',
      entityType: 'CertificateCategory',
      entityId: id,
      req,
      metadata: { reassignToId, reassignedCount: result.reassignedCount },
    });

    return NextResponse.json({
      success: true,
      reassignedCount: result.reassignedCount,
      message:
        result.reassignedCount > 0
          ? `Category deleted. Reassigned ${result.reassignedCount} certificate(s).`
          : 'Category deleted successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete certificate category.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
