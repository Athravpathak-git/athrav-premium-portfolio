import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guard';
import { getProfile, updateProfile, createMediaRecord } from '@/lib/data-service';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/storage';
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

    if (!file) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    // Save with strict profile photo validation (JPEG, PNG, WebP + magic bytes check + 5MB limit)
    const storageResult = await saveUploadedFile(file, true);

    // Retrieve current profile to clean up old uploaded photo if exists
    const currentProfile = await getProfile();
    if (currentProfile?.avatarUrl && currentProfile.avatarUrl.startsWith('/uploads/')) {
      await deleteUploadedFile(currentProfile.avatarUrl);
    }

    // Persist new avatarUrl to profile
    const updatedProfile = await updateProfile({
      ...currentProfile,
      avatarUrl: storageResult.url,
    });

    // Also register in Media Library
    try {
      await createMediaRecord({
        filename: storageResult.filename,
        originalName: storageResult.originalName,
        mimeType: storageResult.mimeType,
        sizeBytes: storageResult.sizeBytes,
        url: storageResult.url,
        storageProvider: 'local',
        altText: 'Athrav Pathak Profile Photo',
        category: 'profile',
      });
    } catch (mediaErr) {
      console.warn('[Avatar Upload] Media record creation skipped:', mediaErr);
    }

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'PROFILE_PHOTO_UPDATED',
      entityType: 'Profile',
      entityId: updatedProfile.id,
      req,
      metadata: { url: storageResult.url, sizeBytes: storageResult.sizeBytes },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: storageResult.url,
      profile: updatedProfile,
      message: 'Profile photo successfully uploaded and saved.',
    });
  } catch (err: unknown) {
    console.error('[API Profile Avatar POST Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload profile photo.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const currentProfile = await getProfile();
    if (currentProfile?.avatarUrl && currentProfile.avatarUrl.startsWith('/uploads/')) {
      await deleteUploadedFile(currentProfile.avatarUrl);
    }

    const updatedProfile = await updateProfile({
      ...currentProfile,
      avatarUrl: null,
    });

    await logAuditEvent({
      userId: auth.admin.id,
      action: 'PROFILE_PHOTO_REMOVED',
      entityType: 'Profile',
      entityId: updatedProfile.id,
      req,
    });

    return NextResponse.json({
      success: true,
      avatarUrl: null,
      profile: updatedProfile,
      message: 'Profile photo successfully removed.',
    });
  } catch (err: unknown) {
    console.error('[API Profile Avatar DELETE Error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to remove profile photo.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
