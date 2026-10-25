import { describe, it, expect } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limiter';

describe('Rate Limiter Engine', () => {
  it('allows requests within limit and enforces cooldown once limit exceeded', () => {
    const key = `test-ip-${Date.now()}`;
    const maxPoints = 3;
    const windowSeconds = 60;

    // First attempt
    const res1 = checkRateLimit(key, maxPoints, windowSeconds);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    // Second attempt
    const res2 = checkRateLimit(key, maxPoints, windowSeconds);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    // Third attempt (reaches limit)
    const res3 = checkRateLimit(key, maxPoints, windowSeconds);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    // Fourth attempt (exceeds limit)
    const res4 = checkRateLimit(key, maxPoints, windowSeconds);
    expect(res4.allowed).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.resetSeconds).toBeGreaterThan(0);

    // Resetting clears the lock
    resetRateLimit(key);
    const res5 = checkRateLimit(key, maxPoints, windowSeconds);
    expect(res5.allowed).toBe(true);
  });
});
