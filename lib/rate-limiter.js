import prisma from './prisma.js';

// Fallback in-memory map in case DB is unreachable
const memoryStore = new Map();

/**
 * Clean up expired rate limits in memory store.
 */
function cleanupMemoryStore() {
  const now = Date.now();
  for (const [k, v] of memoryStore.entries()) {
    if (v.expireAt <= now) {
      memoryStore.delete(k);
    }
  }
}

/**
 * Check and record a rate limit attempt.
 * Backed by PostgreSQL for multi-instance durability with fallback to in-memory store.
 * 
 * @param {string} key - Unique rate-limit identifier (e.g. `login:ip:127.0.0.1` or `contact:ip:...`)
 * @param {number} limit - Maximum allowed points in window
 * @param {number} windowSeconds - Window duration in seconds
 * @param {boolean} increment - Whether to increment points (default true). If false, peeks without recording.
 * @returns {Promise<{ allowed: boolean, remaining: number, resetAt: Date }>}
 */
export async function checkRateLimit(key, limit = 5, windowSeconds = 60, increment = true) {
  const now = new Date();
  const expireAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expireAt < now) {
      if (!increment) {
        return {
          allowed: true,
          remaining: limit,
          resetAt: expireAt,
        };
      }

      // First attempt in new window
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          points: 1,
          expireAt,
        },
        update: {
          points: 1,
          expireAt,
        },
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: expireAt,
      };
    }

    if (existing.points >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.expireAt,
      };
    }

    if (!increment) {
      return {
        allowed: true,
        remaining: Math.max(0, limit - existing.points),
        resetAt: existing.expireAt,
      };
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        points: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.points),
      resetAt: existing.expireAt,
    };
  } catch (dbError) {
    // Graceful fallback to memory store
    cleanupMemoryStore();
    const memEntry = memoryStore.get(key);
    const nowMs = Date.now();

    if (!memEntry || memEntry.expireAt <= nowMs) {
      if (!increment) {
        return { allowed: true, remaining: limit, resetAt: expireAt };
      }
      memoryStore.set(key, { points: 1, expireAt: nowMs + windowSeconds * 1000 });
      return { allowed: true, remaining: limit - 1, resetAt: expireAt };
    }

    if (memEntry.points >= limit) {
      return { allowed: false, remaining: 0, resetAt: new Date(memEntry.expireAt) };
    }

    if (!increment) {
      return {
        allowed: true,
        remaining: Math.max(0, limit - memEntry.points),
        resetAt: new Date(memEntry.expireAt),
      };
    }

    memEntry.points += 1;
    return {
      allowed: true,
      remaining: Math.max(0, limit - memEntry.points),
      resetAt: new Date(memEntry.expireAt),
    };
  }
}

/**
 * Reset a rate limit key (e.g. after a successful login).
 * @param {string} key
 */
export async function resetRateLimit(key) {
  try {
    await prisma.rateLimit.deleteMany({
      where: { key },
    });
  } catch (e) {
    // ignore
  }
  memoryStore.delete(key);
}
