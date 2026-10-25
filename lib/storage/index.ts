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

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of 10MB (file is ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: "${file.type}". Allowed types are JPEG, PNG, WebP, GIF, and PDF. (SVG is rejected for security).`,
    };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}". Allowed extensions: .jpg, .jpeg, .png, .webp, .gif, .pdf`,
    };
  }

  return { valid: true };
}

export async function saveUploadedFile(file: File): Promise<StorageResult> {
  const validation = validateUploadedFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeBase = crypto.randomBytes(12).toString('hex');
  const filename = `${Date.now()}-${safeBase}${ext}`;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

export async function deleteUploadedFile(filename: string): Promise<boolean> {
  try {
    const sanitizedName = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedName);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
