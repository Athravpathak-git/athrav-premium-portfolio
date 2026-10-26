import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __athravDbCircuitBreaker: { isHealthy: boolean; lastFailureTime: number; failureReason: string } | undefined;
}

if (!globalThis.__athravDbCircuitBreaker) {
  globalThis.__athravDbCircuitBreaker = {
    isHealthy: true,
    lastFailureTime: 0,
    failureReason: '',
  };
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || !url.trim()) return false;
  
  // Ignore placeholder or unconfigured values
  const placeholders = [
    'sample-pooler',
    'user:password@',
    'dummy',
    'example.com',
    'your-neon',
    'ep-sample',
    'your-database-host',
    'placeholder',
  ];

  if (placeholders.some((p) => url.includes(p))) {
    return false;
  }
  return true;
}

const CIRCUIT_BREAKER_COOLDOWN_MS = 30000; // 30 seconds cooldown after a connection failure

export function isDatabaseAvailable(): boolean {
  if (!isDatabaseConfigured()) return false;
  
  const cb = globalThis.__athravDbCircuitBreaker;
  if (cb && !cb.isHealthy) {
    const elapsed = Date.now() - cb.lastFailureTime;
    if (elapsed < CIRCUIT_BREAKER_COOLDOWN_MS) {
      return false; // Still in cooldown period, fail-fast to local mock
    }
    // Cooldown elapsed, allow retry
    cb.isHealthy = true;
  }
  return true;
}

export function recordDatabaseFailure(err: unknown) {
  const reason = err instanceof Error ? err.message : String(err);
  console.warn(`[Database CircuitBreaker] Recorded DB failure, deferring to mock mode for 30s: ${reason}`);
  if (globalThis.__athravDbCircuitBreaker) {
    globalThis.__athravDbCircuitBreaker.isHealthy = false;
    globalThis.__athravDbCircuitBreaker.lastFailureTime = Date.now();
    globalThis.__athravDbCircuitBreaker.failureReason = reason;
  }
}

export async function withDbTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Database operation timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    recordDatabaseFailure(err);
    throw err;
  }
}

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!isDatabaseConfigured()) {
    throw new Error(
      'DATABASE_UNCONFIGURED: DATABASE_URL is not configured or contains placeholder credentials. The application is running in local mock/fixture mode.'
    );
  }

  if (process.env.NODE_ENV === 'production') {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient();
    }
    return prismaInstance;
  }

  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return global.prismaGlobal;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    // @ts-expect-error dynamic proxy delegate
    return client[prop];
  },
});
