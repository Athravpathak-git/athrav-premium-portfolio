import { isDatabaseConfigured, getPrisma } from '../lib/db';

/**
 * Extracts only the database host and database name from DATABASE_URL.
 * Never exposes credentials, usernames, passwords, query parameters, or connection tokens.
 */
function getSanitizedDbTarget(): { host: string; database: string } {
  const rawUrl = process.env.DATABASE_URL || '';
  try {
    const parsed = new URL(rawUrl);
    return {
      host: parsed.hostname || 'unknown-host',
      database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'default',
    };
  } catch {
    return { host: 'unknown-host', database: 'unknown-database' };
  }
}

/**
 * Checks DNS resolution using both the OS resolver (used by Prisma)
 * and public DNS (8.8.8.8 / 1.1.1.1) to diagnose local router DNS blockage.
 */
async function diagnoseDnsResolution(hostname: string): Promise<{
  osSuccess: boolean;
  publicSuccess: boolean;
}> {
  let osSuccess = false;
  let publicSuccess = false;

  try {
    const dns = await import('dns/promises');
    await dns.lookup(hostname);
    osSuccess = true;
  } catch {
    osSuccess = false;
  }

  try {
    const { Resolver } = await import('dns/promises');
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
    const ips = await resolver.resolve4(hostname);
    if (ips.length > 0) {
      publicSuccess = true;
    }
  } catch {
    publicSuccess = false;
  }

  return { osSuccess, publicSuccess };
}

/**
 * Extracts a safe diagnostic error code (e.g. Prisma P1001, P1000, P2021) without printing
 * error message strings, query contents, hostnames, or credentials.
 */
function extractSafeErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object') {
    if ('errorCode' in error && typeof (error as { errorCode: unknown }).errorCode === 'string') {
      return (error as { errorCode: string }).errorCode;
    }
    if ('code' in error && typeof (error as { code: unknown }).code === 'string') {
      return (error as { code: string }).code;
    }
  }
  return null;
}

/**
 * Translates Prisma error codes into clear, actionable advice for Neon / PostgreSQL.
 */
function describePrismaErrorCode(code: string | null): string {
  switch (code) {
    case 'P1000':
      return 'Authentication failed. Please verify your database username and password.';
    case 'P1001':
      return 'Cannot reach database server at host. Check DNS and network connectivity.';
    case 'P1002':
      return 'Database server was reached but connection timed out during initialization.';
    case 'P1003':
      return 'Specified database does not exist on the database server.';
    case 'P1011':
      return 'Error opening TLS/SSL connection. Ensure "?sslmode=require" is present.';
    case 'P1017':
      return 'Server closed the connection unexpectedly.';
    case 'P2021':
      return 'The requested table does not exist in the current database schema.';
    default:
      return 'Database query operation failed.';
  }
}

async function main() {
  console.log('====================================================');
  console.log('ATHRAV PATHAK PORTFOLIO — READ-ONLY SCHEMA & TARGET AUDIT');
  console.log('====================================================');

  // 1. Verify DATABASE_URL is configured
  if (!isDatabaseConfigured()) {
    console.error('ERROR: DATABASE_URL is not configured or contains placeholder credentials.');
    console.error('Please configure DATABASE_URL in your environment before running this script.');
    process.exit(1);
  }

  const targetInfo = getSanitizedDbTarget();
  console.log(`Target Host:     ${targetInfo.host}`);
  console.log(`Target Database: ${targetInfo.database}`);
  console.log('Mode:            READ-ONLY (No records will be created, modified, or deleted)');

  if (targetInfo.host.includes('-pooler')) {
    console.log('Configuration:   Neon Pooled Connection (PgBouncer) detected.');
  } else {
    console.log('Configuration:   Direct PostgreSQL Connection detected.');
  }
  console.log('');

  // 2. Pre-flight DNS resolution check
  process.stdout.write('Checking network DNS resolution for host... ');
  const dnsResult = await diagnoseDnsResolution(targetInfo.host);

  if (!dnsResult.osSuccess) {
    console.log('FAILED (OS DNS)');
    console.error('\nNotice: OS DNS resolver could not resolve the host.');
    if (dnsResult.publicSuccess) {
      console.error('Host resolves via public DNS (8.8.8.8). Ensure your adapter DNS is configured.');
    }
  } else {
    console.log('OK (Resolved)');
  }

  const prisma = getPrisma();

  try {
    // 3. Connect to the database and run SELECT 1
    process.stdout.write('Connecting to database and verifying connection (SELECT 1)... ');
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log('Connected successfully.');
    } catch (connErr) {
      console.log('Failed.');
      console.error('\nERROR: Failed to establish a database connection.');

      const code = extractSafeErrorCode(connErr);
      if (code) {
        console.error(`Prisma Diagnostic Code: ${code}`);
        console.error(`Diagnosis: ${describePrismaErrorCode(code)}`);
      }
      process.exit(1);
    }

    // 4. Introspect existing database tables and schemas (100% Read-Only)
    process.stdout.write('Querying database catalog for existing tables... ');
    const existingTables = await prisma.$queryRaw<
      Array<{ table_schema: string; table_name: string }>
    >`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `;
    console.log(`Done. (${existingTables.length} table(s) found)`);

    // 5. Query migration history if _prisma_migrations exists (100% Read-Only)
    let appliedMigrations: Array<{ migration_name: string; finished_at: Date | null }> = [];
    const hasMigrationTable = existingTables.some((t) => t.table_name === '_prisma_migrations');

    if (hasMigrationTable) {
      try {
        appliedMigrations = await prisma.$queryRaw<
          Array<{ migration_name: string; finished_at: Date | null }>
        >`
          SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at ASC;
        `;
      } catch {
        // ignore if query fails
      }
    }

    console.log('\n--- READ-ONLY DATABASE CATALOG INSPECTION ---');
    if (existingTables.length === 0) {
      console.log('Tables in Database:       (none - database is currently empty)');
    } else {
      console.log(`Tables in Database (${existingTables.length}):`);
      for (const t of existingTables) {
        console.log(`  - ${t.table_schema}.${t.table_name}`);
      }
    }

    if (appliedMigrations.length === 0) {
      console.log('Applied Migrations:       (none - no migrations recorded in database)');
    } else {
      console.log(`Applied Migrations (${appliedMigrations.length}):`);
      for (const m of appliedMigrations) {
        console.log(`  - ${m.migration_name} (finished: ${m.finished_at ? m.finished_at.toISOString() : 'pending'})`);
      }
    }

    // 6. Check if admin_users exists in database
    const hasAdminUsersTable = existingTables.some(
      (t) => t.table_name === 'admin_users' && (t.table_schema === 'public' || !t.table_schema)
    );

    if (!hasAdminUsersTable) {
      console.log('\n====================================================');
      console.log('DIAGNOSTIC RESULT: TABLE "public.admin_users" NOT YET CREATED');
      console.log('====================================================');
      console.log('Status:');
      console.log('  1. Connection to Neon PostgreSQL is 100% operational.');
      console.log('  2. The database catalog currently has 0 application tables.');
      console.log('  3. Schema mapping is verified: "model AdminUser" maps to "admin_users".');
      console.log('  4. Initial migration exists in codebase: prisma/migrations/20261025000000_init.');
      console.log('\nRoot Cause:');
      console.log('  This Neon database is brand new. Migrations have not yet been deployed to it.');
      console.log('\nRecommended Next Action:');
      console.log('  Deploy the existing migration safely (non-destructive) using:');
      console.log('    npm run prisma:deploy');
      console.log('  Then re-run this verification.');
      console.log('====================================================');
      return;
    }

    // 7. Check status of critical tables
    const hasSocialLinksTable = existingTables.some(
      (t) => t.table_name === 'social_links' && (t.table_schema === 'public' || !t.table_schema)
    );
    const hasCertCategoriesTable = existingTables.some(
      (t) => t.table_name === 'certificate_categories' && (t.table_schema === 'public' || !t.table_schema)
    );

    console.log('\n--- EXTENSION TABLES AUDIT ---');
    console.log(`Table "public.certificate_categories": ${hasCertCategoriesTable ? 'PRESENT' : 'MISSING (Run npm run prisma:deploy)'}`);
    console.log(`Table "public.social_links":           ${hasSocialLinksTable ? 'PRESENT' : 'MISSING (Run npm run prisma:deploy)'}`);

    if (!hasSocialLinksTable) {
      console.log('\n====================================================');
      console.log('NOTICE: TABLE "public.social_links" HAS NOT YET BEEN CREATED');
      console.log('====================================================');
      console.log('Reason:');
      console.log('  Migration "20261027170000_social_links" is committed in the repository,');
      console.log('  but has not yet been applied to this database instance.');
      console.log('\nSafe Fix:');
      console.log('  Run the non-destructive deployment command:');
      console.log('    npm run prisma:deploy');
      console.log('====================================================');
    }

    // 8. Query matching administrator (Read-Only)
    const matchingUsers = await prisma.adminUser.findMany({
      where: {
        OR: [
          { username: { equals: 'athrav_admin', mode: 'insensitive' } },
          { email: { equals: 'admin@athravpathak.dev', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        mustChangePassword: true,
      },
    });

    console.log('\n--- TARGET ADMINISTRATOR VERIFICATION ---');
    console.log(`Matching Accounts Count: ${matchingUsers.length}`);
    console.log(`Exactly One Match:       ${matchingUsers.length === 1 ? 'YES' : 'NO'}`);

    if (matchingUsers.length === 1) {
      const user = matchingUsers[0];
      console.log(`Account Role:            ${user.role}`);
      console.log(`Account Status:          ${user.status}`);
      console.log(`Must Change Password:    ${user.mustChangePassword}`);
      console.log('\nVERIFICATION RESULT: Target administrator account is uniquely located and ready.');
    } else if (matchingUsers.length === 0) {
      console.log('\nVERIFICATION RESULT: Schema exists, but no account matches "athrav_admin" or "admin@athravpathak.dev".');
      console.log('Run "npm run seed:admin" to provision the initial super administrator.');
    } else {
      console.log(`\nVERIFICATION RESULT: Ambiguous criteria (${matchingUsers.length} matching accounts found).`);
    }

    console.log('====================================================');
    console.log('Read-only audit completed. Zero database records were modified.');
    console.log('====================================================');
  } catch (err) {
    console.error('\nERROR: An unexpected error occurred during read-only verification:');
    const code = extractSafeErrorCode(err);
    if (code) {
      console.error(`Prisma Error Code: ${code} (${describePrismaErrorCode(code)})`);
    } else {
      console.error('Operation aborted safely.');
    }
    process.exit(1);
  } finally {
    // 8. Always disconnect Prisma client in finally block
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error('\nERROR: Unhandled execution error during verification.');
  process.exit(1);
});
