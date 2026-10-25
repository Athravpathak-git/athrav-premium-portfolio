import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  // Ignore placeholder values from .env.example
  if (url.includes('sample-pooler') || url.includes('user:password@')) {
    return false;
  }
  return true;
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
