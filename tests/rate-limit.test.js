import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/rate-limiter.js';

describe('Persistent Rate Limiting & Abuse Prevention', () => {
  it('should permit initial attempts and decrease remaining points', async () => {
    const key = `test:limit:key:${Date.now()}`;
    const result1 = await checkRateLimit(key, 3, 60);

    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await checkRateLimit(key, 3, 60);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = await checkRateLimit(key, 3, 60);
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);

    // 4th attempt must be blocked
    const result4 = await checkRateLimit(key, 3, 60);
    expect(result4.allowed).toBe(false);
    expect(result4.remaining).toBe(0);
  });
});
