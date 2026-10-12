import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { requireAdmin } from '@/lib/auth-guard.js';
import { checkRateLimit } from '@/lib/rate-limiter.js';
import { logAuditEvent } from '@/lib/audit.js';

const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

// Magic bytes validation for image signatures
function verifyMagicBytes(buffer, mimeType) {
  if (buffer.length < 4) return false;

  // JPEG starts with FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG starts with 89 50 4E 47
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // GIF starts with GIF87a or GIF89a
  if (mimeType === 'image/gif') {
    const header = buffer.subarray(0, 6).toString('ascii');
    return header === 'GIF87a' || header === 'GIF89a';
  }

  // WebP starts with RIFF and contains WEBP at byte 8
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    const riff = buffer.subarray(0, 4).toString('ascii');
    const webp = buffer.subarray(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }

  return false;
}

export async function POST(req) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    // Rate limit: max 20 uploads per 10 minutes
    const limit = await checkRateLimit(`upload:user:${admin.id}`, 20, 600);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum permitted limit (5MB).' },
        { status: 400 }
      );
    }

    const mimeType = file.type?.toLowerCase();
    if (!ALLOWED_MIME_TYPES[mimeType]) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic byte signature check
    if (!verifyMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        { error: 'File signature does not match its claimed image type.' },
        { status: 400 }
      );
    }

    const extension = ALLOWED_MIME_TYPES[mimeType][0];
    const safeFilename = `${crypto.randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await fs.mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, safeFilename);

    await fs.writeFile(targetPath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    await logAuditEvent({
      userId: admin.id,
      action: 'FILE_UPLOADED',
      req,
      metadata: { filename: safeFilename, mimeType, size: file.size },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during file upload.' },
      { status: 500 }
    );
  }
}
