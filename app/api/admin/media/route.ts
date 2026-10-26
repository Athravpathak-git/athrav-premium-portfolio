import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import {
  getMediaList,
  getMediaItemById,
  createMediaRecord,
  updateMediaRecord,
  deleteMediaRecord,
  checkMediaReferences,
} from '@/lib/data-service';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const url = new URL(req.url);
  const checkId = url.searchParams.get('checkReferences');

  if (checkId) {
    const item = await getMediaItemById(checkId);
    if (!item) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }
    const references = checkMediaReferences(item.url);
    return NextResponse.json({ item, references });
  }

  const items = await getMediaList();
  // Include references count/data for each item
  const itemsWithRefs = items.map((item) => ({
    ...item,
    references: checkMediaReferences(item.url),
  }));

  return NextResponse.json({ items: itemsWithRefs });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form File Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const category = (formData.get('category') as string) || 'general';
      const altText = (formData.get('altText') as string) || '';
      const description = (formData.get('description') as string) || '';

      if (!file) {
        return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
      }

      const storageResult = await saveUploadedFile(file);

      const record = await createMediaRecord({
        filename: storageResult.filename,
        originalName: storageResult.originalName,
        mimeType: storageResult.mimeType,
        sizeBytes: storageResult.sizeBytes,
        url: storageResult.url,
        storageProvider: 'local',
        altText,
        description,
        category,
      });

      await logAuditEvent({
        userId: auth.admin.id,
        action: 'MEDIA_FILE_UPLOADED',
        entityType: 'MediaItem',
        entityId: record.id,
        req,
        metadata: { filename: record.filename, sizeBytes: record.sizeBytes, category },
      });

      return NextResponse.json({
        success: true,
        item: { ...record, references: [] },
      });
    }

    // Handle JSON URL-based media registration
    const body = await req.json();
    const { url, name, altText, description, category } = body;

    if (!url || !name) {
      return NextResponse.json({ error: 'URL and asset name are required.' }, { status: 400 });
    }

    const record = await createMediaRecord({
      filename: name,
      originalName: name,
      mimeType: 'image/url-reference',
      sizeBytes: 0,
      url,
      storageProvider: 'external-url',
      altText: altText || name,
      description: description || '',
      category: category || 'general',
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'MEDIA_URL_REGISTERED',
      entityType: 'MediaItem',
      entityId: record.id,
      req,
      metadata: { url, name },
    });

    return NextResponse.json({
      success: true,
      item: { ...record, references: [] },
    });
  } catch (err: unknown) {
    console.error('[API Admin Media POST Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to process media file.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart File Replacement
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const id = formData.get('id') as string;
      const file = formData.get('file') as File | null;
      const originalName = formData.get('originalName') as string | null;
      const altText = formData.get('altText') as string | null;
      const description = formData.get('description') as string | null;
      const category = formData.get('category') as string | null;

      if (!id) {
        return NextResponse.json({ error: 'Media ID is required.' }, { status: 400 });
      }

      const existing = await getMediaItemById(id);
      if (!existing) {
        return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
      }

      const updates: any = {};
      if (originalName) updates.originalName = originalName;
      if (altText !== null) updates.altText = altText;
      if (description !== null) updates.description = description;
      if (category) updates.category = category;

      if (file && file.size > 0) {
        const storageResult = await saveUploadedFile(file);
        // Safely unlink old local file
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
        metadata: { updatedFields: Object.keys(updates) },
      });

      return NextResponse.json({
        success: true,
        item: { ...updated, references: checkMediaReferences(updated.url) },
      });
    }

    // Handle JSON metadata updates
    const body = await req.json();
    const { id, originalName, altText, description, category } = body;

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required.' }, { status: 400 });
    }

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
    console.error('[API Admin Media PUT Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to update media asset.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    const force = url.searchParams.get('force') === 'true';

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // no json body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required for deletion.' }, { status: 400 });
    }

    const item = await getMediaItemById(id);
    if (!item) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    // Check if referenced by active content
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

    // If local file, delete securely with path traversal protection
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
    console.error('[API Admin Media DELETE Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to delete media asset.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
