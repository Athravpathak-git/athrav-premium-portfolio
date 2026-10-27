import { describe, it, expect, vi } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
  invalidateAllUserSessions,
  touchSession,
  INACTIVITY_TIMEOUT_SECONDS,
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

  it('configures inactivity timeout strictly to 300 seconds (5 minutes)', () => {
    expect(INACTIVITY_TIMEOUT_SECONDS).toBe(300);
  });

  it('creates, validates, and invalidates in-memory sessions with 300s window', async () => {
    const userId = 'admin-super-1';
    const before = Date.now();
    const token = await createSession(userId, { ipAddress: '127.0.0.1' });

    expect(token).toBeDefined();

    const sessionData = await validateSessionToken(token);
    expect(sessionData).not.toBeNull();
    expect(sessionData?.user.id).toBe(userId);
    expect(sessionData?.user.role).toBe('SUPER_ADMIN');

    // Verify session expiration is ~300 seconds into the future
    const expiresMs = sessionData!.session.expiresAt.getTime();
    expect(expiresMs).toBeGreaterThanOrEqual(before + 295 * 1000);
    expect(expiresMs).toBeLessThanOrEqual(before + 305 * 1000);

    // Invalidate session
    await invalidateSession(token);
    const afterInvalidation = await validateSessionToken(token);
    expect(afterInvalidation).toBeNull();
  });

  it('strictly rejects expired sessions on the server after 300 seconds of inactivity', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId);

    // Validate active session
    const active = await validateSessionToken(token);
    expect(active).not.toBeNull();

    // Advance system time past the 300-second inactivity timeout (e.g. +301 seconds)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 301 * 1000));

    // Server-side check must immediately reject the session
    const expired = await validateSessionToken(token);
    expect(expired).toBeNull();

    // Expired sessions must not be revivable via touchSession
    const touchResult = await touchSession(token);
    expect(touchResult).toBe(false);

    vi.useRealTimers();
  });

  it('resets inactivity timer when meaningful activity extends session', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId);

    vi.useFakeTimers();
    const startTime = Date.now();

    // Advance time by 200 seconds of activity
    vi.setSystemTime(new Date(startTime + 200 * 1000));

    // Touch session (activity occurred)
    const touched = await touchSession(token);
    expect(touched).toBe(true);

    // Verify the session has received a fresh 300s expiration from current time
    const validated = await validateSessionToken(token);
    expect(validated).not.toBeNull();
    const newExpiresMs = validated!.session.expiresAt.getTime();
    expect(newExpiresMs).toBe(startTime + 200 * 1000 + 300 * 1000);

    vi.useRealTimers();
    await invalidateSession(token);
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
