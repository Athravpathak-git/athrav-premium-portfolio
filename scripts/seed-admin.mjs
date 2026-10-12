import 'dotenv/config';
import prisma from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';

async function seedAdmin() {
  console.log('--- ATHRAV PATHAK PORTFOLIO BOOTSTRAP ---');

  // Verify database connection
  try {
    await prisma.$connect();
    console.log('✓ Database connection established.');
  } catch (err) {
    console.error('✗ Unable to connect to PostgreSQL database.');
    console.error('  Please ensure DATABASE_URL is set in your .env / .env.local file.');
    console.error('  Error:', err.message);
    process.exit(1);
  }

  const existingAdmin = await prisma.adminUser.findFirst();
  if (existingAdmin) {
    console.log('! An administrator account already exists.');
    console.log('  Bootstrap script is disabled to prevent credential override.');
    console.log('  To rotate passwords, log in to the dashboard at /admin or use the password reset flow.');
    await prisma.$disconnect();
    return;
  }

  const username = process.env.SEED_ADMIN_USERNAME || 'athrav-admin';
  const initialPassword = process.env.SEED_ADMIN_PASSWORD || '#Athr2007';

  if (!initialPassword || initialPassword.length < 8) {
    console.error('✗ SEED_ADMIN_PASSWORD must be configured and at least 8 characters long.');
    process.exit(1);
  }

  console.log(`Creating initial administrator "${username}"...`);

  // Hash temporary credential with Argon2id
  const passwordHash = await hashPassword(initialPassword);

  const admin = await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
      mustChangePassword: true, // Forces immediate password change upon first login
      role: 'ADMIN',
    },
  });

  // Create initial profile for Athrav Pathak if not exists
  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        name: 'Athrav Pathak',
        headline: 'Full-Stack Software Engineer & Systems Architect',
        bio: 'Designing and engineering resilient, high-performance distributed systems, modern web architectures, and elegant user interfaces.',
        email: 'contact@athravpathak.com',
        location: 'India',
        status: 'Available for high-impact engineering opportunities',
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com',
      },
    });
    console.log('✓ Initial profile metadata created for Athrav Pathak.');
  }

  // Record safe audit entry
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_BOOTSTRAP',
      entityType: 'AdminUser',
      entityId: admin.id,
      metadata: JSON.stringify({
        username,
        message: 'Initial administrator account bootstrapped with temporary credentials.',
      }),
    },
  });

  console.log('✓ Administrator account successfully bootstrapped!');
  console.log('  Username: ' + username);
  console.log('  Must change password on first login: YES (Enforced)');
  console.log('  Note: Bootstrap is now locked. No further seed runs can overwrite this user.');

  await prisma.$disconnect();
}

seedAdmin().catch(async (e) => {
  console.error('Bootstrap failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
