import prisma from '../lib/prisma.js';

async function main() {
  const deleted = await prisma.rateLimit.deleteMany({
    where: {
      key: {
        startsWith: 'login:',
      },
    },
  });
  console.log(`Cleared ${deleted.count} stale login rate limit records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
