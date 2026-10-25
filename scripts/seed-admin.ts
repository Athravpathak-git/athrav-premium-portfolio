import { isDatabaseConfigured, getPrisma } from '../lib/db';
import { hashPassword } from '../lib/auth';

async function main() {
  console.log('====================================================');
  console.log('ATHRAV PATHAK PORTFOLIO — SUPER ADMIN PROVISIONING');
  console.log('====================================================');

  const email = process.env.INITIAL_ADMIN_EMAIL;
  const username = process.env.INITIAL_ADMIN_USERNAME;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !username || !password) {
    console.error('ERROR: Missing required environment variables.');
    console.error('Please configure the following in your environment or .env.local:');
    console.error('  INITIAL_ADMIN_EMAIL');
    console.error('  INITIAL_ADMIN_USERNAME');
    console.error('  INITIAL_ADMIN_PASSWORD (min 8 chars, strong)');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ERROR: INITIAL_ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  if (!isDatabaseConfigured()) {
    console.log('[Notice] Database URL is not configured or contains placeholder credentials.');
    console.log('[Notice] In local mock development mode, the admin user is provisioned in-memory:');
    console.log(`  Username: ${username}`);
    console.log(`  Email:    ${email}`);
    console.log('  Password: [Validated from environment variable]');
    console.log('\nWhen you configure a real PostgreSQL/Neon database later, re-run this command');
    console.log('to permanently insert your super administrator into PostgreSQL.');
    process.exit(0);
  }

  const prisma = getPrisma();

  try {
    const existingSuperAdmin = await prisma.adminUser.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingSuperAdmin) {
      console.warn('SECURITY ALERT: A Super Administrator already exists in the database.');
      console.warn(`Existing administrator: "${existingSuperAdmin.username}" (${existingSuperAdmin.email}).`);
      console.warn('To prevent unauthorized takeover, initial provisioning is locked.');
      console.warn('To change credentials, log in as the super admin and use the admin dashboard or rotate manually.');
      process.exit(1);
    }

    const hashedPassword = await hashPassword(password);

    const created = await prisma.adminUser.create({
      data: {
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        mustChangePassword: true, // Prompt owner to change on first login
      },
    });

    console.log('SUCCESS: Initial Super Administrator created successfully.');
    console.log(`  ID:       ${created.id}`);
    console.log(`  Username: ${created.username}`);
    console.log(`  Email:    ${created.email}`);
    console.log(`  Role:     ${created.role}`);
    console.log('\nPlease clear or rotate INITIAL_ADMIN_PASSWORD from your environment file after first login.');
  } catch (err) {
    console.error('ERROR: Failed to provision administrator in database:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Unhandled provisioning error:', err);
  process.exit(1);
});
