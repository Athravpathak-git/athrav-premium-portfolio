import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { saveCertificateImage } from '@/lib/storage';
import { createMediaRecord } from '@/lib/data-service';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid request: Expected multipart/form-data with image file.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const certTitle = (formData.get('title') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    // Save with certificate image validation (JPEG, PNG, WebP + magic bytes + 10MB limit)
    const storageResult = await saveCertificateImage(file);

    // Register in Media Library
    let mediaRecordId: string | undefined;
    try {
      const media = await createMediaRecord({
        filename: storageResult.filename,
        originalName: storageResult.originalName,
        mimeType: storageResult.mimeType,
        sizeBytes: storageResult.sizeBytes,
        url: storageResult.url,
        storageProvider: 'local',
        altText: certTitle ? `${certTitle} Certificate` : storageResult.originalName,
        category: 'certification',
      });
      mediaRecordId = media.id;
    } catch (mediaErr) {
      console.warn('[Certificate Upload] Media record creation skipped:', mediaErr);
    }

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'CERTIFICATE_IMAGE_UPLOADED',
      entityType: 'Certification',
      entityId: mediaRecordId || storageResult.filename,
      req,
      metadata: {
        url: storageResult.url,
        filename: storageResult.filename,
        sizeBytes: storageResult.sizeBytes,
        certTitle,
      },
    });

    return NextResponse.json({
      success: true,
      url: storageResult.url,
      filename: storageResult.filename,
      originalName: storageResult.originalName,
      sizeBytes: storageResult.sizeBytes,
      mimeType: storageResult.mimeType,
      message: 'Certificate image successfully uploaded.',
    });
  } catch (err: unknown) {
    console.error('[API Certificate Upload POST Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload certificate image.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
