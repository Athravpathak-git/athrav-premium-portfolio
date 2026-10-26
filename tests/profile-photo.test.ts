import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { saveUploadedFile, deleteUploadedFile, validateFileMagicBytes } from '@/lib/storage';
import { getProfile, updateProfile } from '@/lib/data-service';
import { profileSchema } from '@/lib/validation/schemas';

describe('Profile Photo Upload, Security & Persistence', () => {
  let createdFiles: string[] = [];

  afterEach(async () => {
    // Clean up any test uploaded files
    for (const url of createdFiles) {
      await deleteUploadedFile(url);
    }
    createdFiles = [];
  });

  it('validates binary magic bytes for JPEG, PNG, and WebP', () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    expect(validateFileMagicBytes(validJpeg).valid).toBe(true);

    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    expect(validateFileMagicBytes(validPng).valid).toBe(true);

    const validWebp = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x00, 0x00, 0x00, 0x00,
      0x57, 0x45, 0x42, 0x50, // WEBP
    ]);
    expect(validateFileMagicBytes(validWebp).valid).toBe(true);

    // Disguised HTML file renamed as image
    const fakeFile = Buffer.from('<!DOCTYPE html><html><body>malicious payload</body></html>');
    expect(validateFileMagicBytes(fakeFile).valid).toBe(false);
  });

  it('saves an authentic PNG profile photo to disk and returns accessible url', async () => {
    const pngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]);
    const mockFile = new File([pngBytes], 'athrav_portrait.png', { type: 'image/png' });

    const result = await saveUploadedFile(mockFile, true);
    createdFiles.push(result.url);

    expect(result.url).toMatch(/^\/uploads\/profile-\d+-[a-f0-9]+\.png$/);
    expect(result.mimeType).toBe('image/png');

    // Verify file exists on local filesystem
    const diskPath = path.join(process.cwd(), 'public', result.url.replace(/^\//, ''));
    expect(fs.existsSync(diskPath)).toBe(true);
  });

  it('rejects disguised files with invalid magic bytes even if extension is .jpg', async () => {
    const fakeBytes = Buffer.from('not an actual image file content');
    const mockFile = new File([fakeBytes], 'fake_portrait.jpg', { type: 'image/jpeg' });

    await expect(saveUploadedFile(mockFile, true)).rejects.toThrow(
      /Unrecognized or unsafe binary file format/
    );
  });

  it('allows relative /uploads/ avatarUrl in profileSchema without failing url validation', () => {
    const validProfilePayload = {
      name: 'Athrav Pathak',
      headline: 'Aspiring AI Engineer',
      bio: 'Second year BCA student focusing on AI.',
      email: 'athravpathak07@gmail.com',
      avatarUrl: '/uploads/profile-174000-abcd.jpg',
      resumePublished: false,
    };

    const parsed = profileSchema.safeParse(validProfilePayload);
    expect(parsed.success).toBe(true);
  });

  it('persists avatarUrl update to dataService and dev-store on disk', async () => {
    const initial = await getProfile();
    const originalAvatar = initial.avatarUrl;

    const testAvatarUrl = '/uploads/profile-test-persistence.png';
    const updated = await updateProfile({ ...initial, avatarUrl: testAvatarUrl });
    expect(updated.avatarUrl).toBe(testAvatarUrl);

    // Verify persisted profile in getProfile
    const refreshed = await getProfile();
    expect(refreshed.avatarUrl).toBe(testAvatarUrl);

    // Verify .dev-storage/portfolio-dev-store.json contains the new avatarUrl
    const devStorePath = path.join(process.cwd(), '.dev-storage', 'portfolio-dev-store.json');
    if (fs.existsSync(devStorePath)) {
      const stored = JSON.parse(fs.readFileSync(devStorePath, 'utf8'));
      expect(stored.profile.avatarUrl).toBe(testAvatarUrl);
    }

    // Restore original avatar
    await updateProfile({ ...initial, avatarUrl: originalAvatar });
  });

  it('deletes uploaded file safely from public/uploads', async () => {
    const pngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    const mockFile = new File([pngBytes], 'temp_delete.png', { type: 'image/png' });

    const result = await saveUploadedFile(mockFile, true);
    const diskPath = path.join(process.cwd(), 'public', result.url.replace(/^\//, ''));
    expect(fs.existsSync(diskPath)).toBe(true);

    const deleted = await deleteUploadedFile(result.url);
    expect(deleted).toBe(true);
    expect(fs.existsSync(diskPath)).toBe(false);
  });
});
