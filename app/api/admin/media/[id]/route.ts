import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getMediaItemById,
  updateMediaRecord,
  deleteMediaRecord,
  checkMediaReferences,
} from '@/lib/data-service';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const item = await getMediaItemById(id);
  if (!item) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      ...item,
      references: checkMediaReferences(item.url),
    },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';

    const existing = await getMediaItemById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const originalName = formData.get('originalName') as string | null;
      const altText = formData.get('altText') as string | null;
      const description = formData.get('description') as string | null;
      const category = formData.get('category') as string | null;

      const updates: any = {};
      if (originalName) updates.originalName = originalName;
      if (altText !== null) updates.altText = altText;
      if (description !== null) updates.description = description;
      if (category) updates.category = category;

      if (file && file.size > 0) {
        const storageResult = await saveUploadedFile(file);
        if (existing.storageProvider === 'local' && existing.url) {
          await deleteUploadedFile(existing.url);
        }
        updates.url = storageResult.url;
        updates.filename = storageResult.filename;
        updates.mimeType = storageResult.mimeType;
        updates.sizeBytes = storageResult.sizeBytes;
        if (!originalName) {
          updates.originalName = storageResult.originalName;
        }
      }

      const updated = await updateMediaRecord(id, updates);

      await logAuditEvent({
        userId: auth.admin.id,
        action: 'MEDIA_ITEM_UPDATED',
        entityType: 'MediaItem',
        entityId: id,
        req,
      });

      return NextResponse.json({
        success: true,
        item: { ...updated, references: checkMediaReferences(updated.url) },
      });
    }

    const body = await req.json();
    const { originalName, altText, description, category } = body;

    const updated = await updateMediaRecord(id, {
      originalName,
      altText,
      description,
      category,
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'MEDIA_METADATA_UPDATED',
      entityType: 'MediaItem',
      entityId: id,
      req,
    });

    return NextResponse.json({
      success: true,
      item: { ...updated, references: checkMediaReferences(updated.url) },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update media asset.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === 'true';

    const item = await getMediaItemById(id);
    if (!item) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    const references = checkMediaReferences(item.url);
    if (references.length > 0 && !force) {
      return NextResponse.json(
        {
          error: 'This media asset is currently in active use and cannot be removed without confirmation.',
          referenced: true,
          references,
        },
        { status: 409 }
      );
    }

    if (item.storageProvider === 'local' && item.url) {
      await deleteUploadedFile(item.url);
    }

    await deleteMediaRecord(id);

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'MEDIA_ITEM_DELETED',
      entityType: 'MediaItem',
      entityId: id,
      req,
      metadata: { url: item.url, filename: item.filename },
    });

    return NextResponse.json({
      success: true,
      message: 'Media asset deleted successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete media asset.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
