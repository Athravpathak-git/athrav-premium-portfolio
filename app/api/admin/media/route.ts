import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getMediaList, createMediaRecord } from '@/lib/data-service';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/storage';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const items = await getMediaList();
  return NextResponse.json({ items });
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
        category,
      });

      await logAuditEvent({
        userId: auth.admin.id,
        action: 'MEDIA_FILE_UPLOADED',
        entityType: 'MediaItem',
        entityId: record.id,
        req,
        metadata: { filename: record.filename, sizeBytes: record.sizeBytes },
      });

      return NextResponse.json({ success: true, item: record });
    }

    // Handle JSON URL-based media registration
    const body = await req.json();
    const { url, name, altText, category } = body;

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
      category: category || 'general',
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'MEDIA_URL_REGISTERED',
      entityType: 'MediaItem',
      entityId: record.id,
      req,
      metadata: { url },
    });

    return NextResponse.json({ success: true, item: record });
  } catch (err: unknown) {
    console.error('[API Admin Media POST Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to process media file.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
