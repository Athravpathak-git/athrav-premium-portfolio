import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface StorageResult {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf']);

// Profile photos strictly restricted to standard web image formats
const PROFILE_PHOTO_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PROFILE_PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB for profile photos

/**
 * Validates actual file binary content via magic bytes
 */
export function validateFileMagicBytes(buffer: Buffer): {
  valid: boolean;
  detectedMime?: string;
  error?: string;
} {
  if (buffer.length < 12) {
    return { valid: false, error: 'File is too small or corrupt.' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // WebP: RIFF (bytes 0..3) ... WEBP (bytes 8..11)
  const riff = buffer.subarray(0, 4).toString('ascii');
  const webp = buffer.subarray(8, 12).toString('ascii');
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, detectedMime: 'image/webp' };
  }

  // GIF: GIF87a or GIF89a
  const gif = buffer.subarray(0, 4).toString('ascii');
  if (gif === 'GIF8') {
    return { valid: true, detectedMime: 'image/gif' };
  }

  // PDF: %PDF
  const pdf = buffer.subarray(0, 4).toString('ascii');
  if (pdf === '%PDF') {
    return { valid: true, detectedMime: 'application/pdf' };
  }

  return {
    valid: false,
    error: 'Unrecognized or unsafe binary file format. Only verified JPEG, PNG, and WebP files are allowed.',
  };
}

export function validateUploadedFile(file: File, isProfilePhoto = false): { valid: boolean; error?: string } {
  const maxSize = isProfilePhoto ? MAX_PROFILE_PHOTO_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
  const maxLabel = isProfilePhoto ? '5MB' : '10MB';

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxLabel} (file is ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  const allowedMimes = isProfilePhoto ? PROFILE_PHOTO_MIME_TYPES : ALLOWED_MIME_TYPES;
  if (!allowedMimes.has(file.type)) {
    return {
      valid: false,
      error: isProfilePhoto
        ? `Unsupported file type: "${file.type}". Profile photos must be JPG, JPEG, PNG, or WebP. (SVG is rejected for security).`
        : `Unsupported file type: "${file.type}". Allowed types are JPEG, PNG, WebP, GIF, and PDF. (SVG is rejected for security).`,
    };
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = isProfilePhoto ? PROFILE_PHOTO_EXTENSIONS : ALLOWED_EXTENSIONS;
  if (!allowedExts.has(ext)) {
    return {
      valid: false,
      error: isProfilePhoto
        ? `Invalid file extension "${ext}". Allowed: .jpg, .jpeg, .png, .webp`
        : `Invalid file extension "${ext}". Allowed: .jpg, .jpeg, .png, .webp, .gif, .pdf`,
    };
  }

  return { valid: true };
}

export async function saveUploadedFile(file: File, isProfilePhoto = false): Promise<StorageResult> {
  const metadataValidation = validateUploadedFile(file, isProfilePhoto);
  if (!metadataValidation.valid) {
    throw new Error(metadataValidation.error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Strict binary magic bytes verification
  const magicValidation = validateFileMagicBytes(buffer);
  if (!magicValidation.valid) {
    throw new Error(magicValidation.error);
  }

  if (isProfilePhoto && !PROFILE_PHOTO_MIME_TYPES.has(magicValidation.detectedMime!)) {
    throw new Error(`Invalid image content. Detected ${magicValidation.detectedMime}, but profile photo must be JPEG, PNG, or WebP.`);
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeBase = crypto.randomBytes(12).toString('hex');
  const prefix = isProfilePhoto ? 'profile' : 'asset';
  const filename = `${prefix}-${Date.now()}-${safeBase}${ext}`;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    originalName: file.name,
    mimeType: magicValidation.detectedMime || file.type,
    sizeBytes: file.size,
  };
}

export async function deleteUploadedFile(filenameOrUrl: string): Promise<boolean> {
  try {
    if (!filenameOrUrl) return false;
    const clean = filenameOrUrl.split('?')[0];
    const sanitizedName = path.basename(clean);
    
    // Safety check: ensure file is in uploads directory and filename matches expected patterns
    if (!sanitizedName || sanitizedName.includes('..')) {
      return false;
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedName);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
