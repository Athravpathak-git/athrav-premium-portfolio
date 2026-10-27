import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSession,
  validateSessionToken,
  touchSession,
  invalidateSession,
  INACTIVITY_TIMEOUT_SECONDS,
  hashPassword,
} from '@/lib/auth';
import { POST as heartbeatHandler } from '@/app/api/auth/heartbeat/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { requireAdminApi } from '@/lib/auth-guard';

// Mock cookies for API route handler tests
let mockCookieStore: Record<string, string> = {};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => (mockCookieStore[name] ? { name, value: mockCookieStore[name] } : undefined),
    set: (name: string, value: string, options?: any) => {
      if (options?.maxAge === 0) {
        delete mockCookieStore[name];
      } else {
        mockCookieStore[name] = value;
      }
    },
  })),
}));

describe('Admin Inactivity Timeout & Heartbeat Subsystem', () => {
  beforeEach(() => {
    mockCookieStore = {};
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('strictly enforces 300-second (5-minute) timeout limit', () => {
    expect(INACTIVITY_TIMEOUT_SECONDS).toBe(300);
  });

  it('rejects /api/auth/heartbeat when no session is present', async () => {
    const req = new Request('http://localhost:3000/api/auth/heartbeat', { method: 'POST' });
    const res = await heartbeatHandler(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  it('accepts /api/auth/heartbeat and extends expiration when active session is present', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId);
    mockCookieStore['athrav_admin_session'] = token;

    const req = new Request('http://localhost:3000/api/auth/heartbeat', { method: 'POST' });
    const res = await heartbeatHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.authenticated).toBe(true);
    expect(body.expiresInSeconds).toBe(300);

    await invalidateSession(token);
  });

  it('automatically invalidates session on server after 300 seconds of zero activity', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId);
    mockCookieStore['athrav_admin_session'] = token;

    // Verify session is initially valid
    const initialCheck = await validateSessionToken(token, { touch: false });
    expect(initialCheck).not.toBeNull();

    // Fast-forward system time past the 300-second threshold (301 seconds)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 301 * 1000));

    // Direct token validation must reject
    const expiredCheck = await validateSessionToken(token, { touch: false });
    expect(expiredCheck).toBeNull();

    // Heartbeat endpoint must return 401 and clear cookie in response
    const req = new Request('http://localhost:3000/api/auth/heartbeat', { method: 'POST' });
    const res = await heartbeatHandler(req);
    expect(res.status).toBe(401);
    expect(res.cookies.get('athrav_admin_session')?.maxAge).toBe(0);

    // Direct protected API guard must reject expired session
    const apiGuardResult = await requireAdminApi();
    expect(apiGuardResult.authorized).toBe(false);
    if (!apiGuardResult.authorized) {
      expect(apiGuardResult.response.status).toBe(401);
    }
  });

  it('resets the inactivity timer when meaningful activity occurs before 300 seconds', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId);
    mockCookieStore['athrav_admin_session'] = token;

    vi.useFakeTimers();
    const startTime = Date.now();

    // User is active at t = 200 seconds (meaningful interaction: touch / heartbeat)
    vi.setSystemTime(new Date(startTime + 200 * 1000));

    const req = new Request('http://localhost:3000/api/auth/heartbeat', { method: 'POST' });
    const res = await heartbeatHandler(req);
    expect(res.status).toBe(200);

    // At t = 400 seconds (400s > 300s initial deadline, but only 200s since last activity):
    // Session MUST STILL BE VALID because meaningful activity reset the 300s sliding window!
    vi.setSystemTime(new Date(startTime + 400 * 1000));

    const validCheck = await validateSessionToken(token, { touch: false });
    expect(validCheck).not.toBeNull();
    expect(validCheck?.user.id).toBe(userId);

    // Now advance 301 seconds past the last activity (t = 200 + 301 = 501s)
    vi.setSystemTime(new Date(startTime + 501 * 1000));

    const finalExpired = await validateSessionToken(token, { touch: false });
    expect(finalExpired).toBeNull();
  });

  it('allows normal manual logout and prevents reuse of terminated session', async () => {
    const userId = 'admin-super-1';
    const token = await createSession(userId);
    mockCookieStore['athrav_admin_session'] = token;

    // Call logout endpoint
    const req = new Request('http://localhost:3000/api/auth/logout', { method: 'POST' });
    const res = await logoutHandler(req);
    expect(res.status).toBe(200);

    // Session is immediately invalid
    const check = await validateSessionToken(token);
    expect(check).toBeNull();
    expect(mockCookieStore['athrav_admin_session']).toBeUndefined();
  });

  it('allows logging in normally after timeout to obtain a fresh session', async () => {
    const userId = 'admin-super-1';
    const oldToken = await createSession(userId);

    // Expire the old session
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 350 * 1000));
    expect(await validateSessionToken(oldToken)).toBeNull();

    // Authenticate again
    vi.useRealTimers();
    const newToken = await createSession(userId);
    expect(newToken).not.toBe(oldToken);

    const freshSession = await validateSessionToken(newToken);
    expect(freshSession).not.toBeNull();
    expect(freshSession?.user.id).toBe(userId);
    expect(freshSession!.session.expiresAt.getTime()).toBeGreaterThan(Date.now() + 290 * 1000);

    await invalidateSession(newToken);
  });
});
