import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
  invalidateAllUserSessions,
} from '@/lib/auth';

describe('Authentication & Session Engine', () => {
  it('correctly hashes and verifies passwords', async () => {
    const rawPassword = 'StrongPassword2026!';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isMismatch = await verifyPassword('WrongPassword!', hashed);
    expect(isMismatch).toBe(false);
  });

  it('generates 64-character hexadecimal session tokens', () => {
    const token = generateSessionToken();
    expect(token).toHaveLength(64);
    expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
  });

  it('creates, validates, and invalidates in-memory sessions', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId, { ipAddress: '127.0.0.1' });

    expect(token).toBeDefined();

    const sessionData = await validateSessionToken(token);
    expect(sessionData).not.toBeNull();
    expect(sessionData?.user.id).toBe(userId);
    expect(sessionData?.user.role).toBe('SUPER_ADMIN');

    // Invalidate session
    await invalidateSession(token);
    const afterInvalidation = await validateSessionToken(token);
    expect(afterInvalidation).toBeNull();
  });

  it('invalidates all active sessions for a user on password change', async () => {
    const userId = 'admin-super-1';
    const token1 = await createSession(userId);
    const token2 = await createSession(userId);

    expect(await validateSessionToken(token1)).not.toBeNull();
    expect(await validateSessionToken(token2)).not.toBeNull();

    await invalidateAllUserSessions(userId);

    expect(await validateSessionToken(token1)).toBeNull();
    expect(await validateSessionToken(token2)).toBeNull();
  });
});
