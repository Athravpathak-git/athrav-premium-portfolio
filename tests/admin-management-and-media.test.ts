import { describe, it, expect, beforeEach } from 'vitest';
import {
  validatePasswordStrength,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAllAdminUsers,
} from '@/lib/auth';
import {
  getMediaList,
  getMediaItemById,
  createMediaRecord,
  updateMediaRecord,
  deleteMediaRecord,
  checkMediaReferences,
  getProfile,
} from '@/lib/data-service';

describe('Admin User Management & Security Controls', () => {
  it('validates password strength according to security standards', () => {
    // Too short
    expect(validatePasswordStrength('Short1!').valid).toBe(false);
    // Missing uppercase
    expect(validatePasswordStrength('lowercase123!').valid).toBe(false);
    // Missing lowercase
    expect(validatePasswordStrength('UPPERCASE123!').valid).toBe(false);
    // Missing number or symbol
    expect(validatePasswordStrength('NoNumbersOrSymbols').valid).toBe(false);
    // Valid passwords
    expect(validatePasswordStrength('AthravSecure2026!').valid).toBe(true);
    expect(validatePasswordStrength('Passcode99$').valid).toBe(true);
  });

  it('creates new administrator and never exposes password hash in output', async () => {
    const unique = `test_admin_${Date.now()}`;
    const newUser = await createAdminUser({
      name: 'Test Administrator',
      username: unique,
      email: `${unique}@athravpathak.dev`,
      password: 'StrongPassword123!',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    expect(newUser.username).toBe(unique);
    expect(newUser.name).toBe('Test Administrator');
    expect(newUser.role).toBe('ADMIN');
    expect(newUser.status).toBe('ACTIVE');
    expect((newUser as any).passwordHash).toBeUndefined();
    expect((newUser as any).password).toBeUndefined();

    // Verify user appears in getAllAdminUsers list without hashes
    const all = await getAllAdminUsers();
    const found = all.find((u) => u.username === unique);
    expect(found).toBeDefined();
    expect((found as any).passwordHash).toBeUndefined();

    // Clean up created user
    await deleteAdminUser(newUser.id, 'admin-super-1');
  });

  it('rejects duplicate usernames or emails when creating administrators', async () => {
    const unique = `dup_user_${Date.now()}`;
    const first = await createAdminUser({
      name: 'First Admin',
      username: unique,
      email: `${unique}@athravpathak.dev`,
      password: 'StrongPassword123!',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    // Duplicate username attempt
    await expect(
      createAdminUser({
        name: 'Another Admin',
        username: unique,
        email: `different_${unique}@athravpathak.dev`,
        password: 'StrongPassword123!',
        role: 'ADMIN',
      })
    ).rejects.toThrow(/already registered/);

    // Duplicate email attempt
    await expect(
      createAdminUser({
        name: 'Another Admin',
        username: `diff_${unique}`,
        email: `${unique}@athravpathak.dev`,
        password: 'StrongPassword123!',
        role: 'ADMIN',
      })
    ).rejects.toThrow(/already registered/);

    // Clean up
    await deleteAdminUser(first.id, 'admin-super-1');
  });

  it('enforces self-deletion lockout preventing logged-in admin from deleting self', async () => {
    await expect(deleteAdminUser('admin-super-1', 'admin-super-1')).rejects.toThrow(
      /Self-deletion lockout/
    );
  });

  it('protects last active super administrator from being deleted or demoted', async () => {
    // Attempting to delete the only super admin
    await expect(deleteAdminUser('admin-super-1', 'other-caller-id')).rejects.toThrow(
      /Cannot delete the last active administrator|Cannot delete the last active super administrator/
    );

    // Attempting to demote the only super admin
    await expect(
      updateAdminUser('admin-super-1', { role: 'ADMIN' }, 'other-caller-id')
    ).rejects.toThrow(/Safety protection: Cannot demote or suspend/);
  });
});

describe('Media Library Management & Asset Integrity', () => {
  it('detects active reference when media is used as profile photo', async () => {
    const profile = await getProfile();
    if (profile.avatarUrl) {
      const refs = checkMediaReferences(profile.avatarUrl);
      expect(refs.length).toBeGreaterThan(0);
      expect(refs.some((r) => r.type === 'profile')).toBe(true);
    }
  });

  it('returns empty reference list for unreferenced assets', () => {
    const refs = checkMediaReferences('/uploads/unreferenced-asset-999999.png');
    expect(refs).toEqual([]);
  });

  it('creates, retrieves, updates metadata, and removes media records', async () => {
    const testFilename = `test-media-${Date.now()}.png`;
    const record = await createMediaRecord({
      filename: testFilename,
      originalName: 'Original Test Name.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      url: `/uploads/${testFilename}`,
      storageProvider: 'local',
      altText: 'Original Alt Text',
      category: 'general',
    });

    expect(record.id).toBeDefined();

    // Retrieve by ID
    const fetched = await getMediaItemById(record.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.originalName).toBe('Original Test Name.png');

    // Update metadata
    const updated = await updateMediaRecord(record.id, {
      originalName: 'Updated Test Name.png',
      altText: 'Updated Alt Text',
      category: 'project',
    });

    expect(updated.originalName).toBe('Updated Test Name.png');
    expect(updated.altText).toBe('Updated Alt Text');
    expect(updated.category).toBe('project');

    // Delete record
    const result = await deleteMediaRecord(record.id);
    expect(result.success).toBe(true);

    const recheck = await getMediaItemById(record.id);
    expect(recheck).toBeNull();
  });
});
