import { isDatabaseConfigured, getPrisma } from '../lib/db';
import { hashPassword, validatePasswordStrength } from '../lib/auth';

/**
 * Global signal listeners to guarantee terminal raw mode is restored
 * even if the process receives SIGINT, SIGTERM, or unhandled exit.
 */
let initialStdinRawState = false;
if (process.stdin.isTTY) {
  initialStdinRawState = Boolean(process.stdin.isRaw);
}

function restoreGlobalTerminalMode() {
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    try {
      process.stdin.setRawMode(initialStdinRawState);
      process.stdin.pause();
    } catch {
      // ignore terminal teardown errors
    }
  }
}

process.on('exit', restoreGlobalTerminalMode);
process.on('SIGINT', () => {
  restoreGlobalTerminalMode();
  process.stdout.write('\n[Aborted] Process terminated by user.\n');
  process.exit(130);
});

/**
 * Extracts a safe Prisma error code (e.g. P1001, P2025) without exposing
 * any error message strings, query contents, hostnames, or credentials.
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
 * Interactively prompts for a password in a TTY without echoing characters to stdout.
 * Strictly requires an interactive TTY; no fallback exists.
 * Guarantees that raw terminal mode is always restored on completion, error, or Ctrl+C.
 */
function promptPasswordHidden(promptText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    process.stdout.write(promptText);

    let buffer = '';
    const wasRaw = Boolean(process.stdin.isRaw);

    const restoreTerminal = () => {
      try {
        process.stdin.removeListener('data', onData);
        process.stdin.removeListener('error', onError);
        if (process.stdin.setRawMode) {
          process.stdin.setRawMode(wasRaw);
        }
        process.stdin.pause();
      } catch {
        // ignore errors during terminal restoration
      }
    };

    const onError = () => {
      restoreTerminal();
      process.stdout.write('\n');
      reject(new Error('Terminal input stream encountered an error.'));
    };

    const onData = (data: Buffer) => {
      try {
        const str = data.toString();

        for (let i = 0; i < str.length; i++) {
          const char = str[i];

          // Enter / Return (carriage return or newline)
          if (char === '\r' || char === '\n') {
            restoreTerminal();
            process.stdout.write('\n');
            resolve(buffer);
            return;
          }

          // Ctrl + C (SIGINT)
          if (char === '\u0003') {
            restoreTerminal();
            process.stdout.write('\n[Aborted] Operation canceled by user.\n');
            process.exit(130);
          }

          // Backspace / Delete
          if (char === '\u0008' || char === '\u007f') {
            if (buffer.length > 0) {
              buffer = buffer.slice(0, -1);
            }
          } else if (char.charCodeAt(0) >= 32) {
            // Printable ASCII / Unicode
            buffer += char;
          }
        }
      } catch {
        restoreTerminal();
        reject(new Error('Failed to process terminal input buffer.'));
      }
    };

    process.stdin.on('error', onError);
    process.stdin.on('data', onData);

    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
    } catch {
      restoreTerminal();
      reject(new Error('Failed to enable terminal raw mode.'));
    }
  });
}

async function main() {
  console.log('====================================================');
  console.log('ATHRAV PATHAK PORTFOLIO — ADMIN PASSWORD RESET CLI');
  console.log('====================================================');

  // Requirement 3: Enforce interactive TTY before doing any work or prompts
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error('ERROR: Non-interactive terminal (TTY) detected.');
    console.error('Aborting: To prevent credential exposure, this script strictly requires an interactive TTY.');
    console.error('Piping, redirects, and automated scripts are not permitted.');
    process.exit(1);
  }

  // 1. Verify DATABASE_URL is configured
  if (!isDatabaseConfigured()) {
    console.error('ERROR: DATABASE_URL is not configured or contains placeholder credentials.');
    console.error('This script operates strictly against a configured PostgreSQL / Neon database.');
    console.error('Please configure DATABASE_URL in your environment before running this script.');
    process.exit(1);
  }

  const prisma = getPrisma();

  try {
    // 2. Verify database connection succeeds before prompting for secrets
    process.stdout.write('Connecting to database... ');
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log('Connected successfully.');
    } catch (connErr) {
      console.log('Failed.');
      console.error('\nERROR: Failed to establish a database connection.');
      console.error('Verify that your network connection allows outbound access and SSL is enabled.');
      const code = extractSafeErrorCode(connErr);
      if (code) {
        console.error(`Database Diagnostic Code: ${code}`);
      }
      process.exit(1);
    }

    // 3. Locate existing administrator (Requirement 6: strictly never create/delete users)
    const matchingUsers = await prisma.adminUser.findMany({
      where: {
        OR: [
          { username: { equals: 'athrav_admin', mode: 'insensitive' } },
          { email: { equals: 'admin@athravpathak.dev', mode: 'insensitive' } },
        ],
      },
    });

    if (matchingUsers.length === 0) {
      console.error('\nERROR: No existing administrator found matching username "athrav_admin" or email "admin@athravpathak.dev".');
      console.error('Aborting: This script never creates a new account.');
      process.exit(1);
    }

    if (matchingUsers.length > 1) {
      console.error(`\nERROR: Multiple matching accounts (${matchingUsers.length}) found for "athrav_admin" or "admin@athravpathak.dev".`);
      console.error('Aborting: Ambiguous target. No accounts were modified.');
      process.exit(1);
    }

    const targetUser = matchingUsers[0];

    console.log('\nTarget Administrator Account Located:');
    console.log(`  ID:       ${targetUser.id}`);
    console.log(`  Username: ${targetUser.username}`);
    console.log(`  Email:    ${targetUser.email}`);
    console.log(`  Role:     ${targetUser.role}`);
    console.log(`  Status:   ${targetUser.status}`);

    // 4. Prompt interactively without echoing keystrokes
    console.log('\nEnter a new secure password for this administrator.');
    const newPassword = await promptPasswordHidden('New password: ');

    // Validate password strength using existing lib/auth function
    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.valid) {
      console.error(`\nERROR: Password validation failed: ${strengthResult.error}`);
      process.exit(1);
    }

    const confirmPassword = await promptPasswordHidden('Confirm new password: ');

    if (newPassword !== confirmPassword) {
      console.error('\nERROR: Passwords do not match. Aborting without changes.');
      process.exit(1);
    }

    // 5. Hash password with existing hashPassword function
    process.stdout.write('\nHashing password securely... ');
    const newHash = await hashPassword(newPassword);
    console.log('Done.');

    // 6. Requirements 4 & 5: Execute atomic Prisma transaction
    // Updates passwordHash, deletes all sessions, and logs audit event atomically
    process.stdout.write('Applying atomic transaction in database... ');

    let updatedUser: { username: string; email: string };
    let sessionCount = 0;

    try {
      const [uUser, sessionResult] = await prisma.$transaction([
        // Update ONLY target administrator's passwordHash and set mustChangePassword to true
        prisma.adminUser.update({
          where: { id: targetUser.id },
          data: {
            passwordHash: newHash,
            mustChangePassword: true,
          },
        }),
        // Invalidate all active sessions for this user
        prisma.session.deleteMany({
          where: { userId: targetUser.id },
        }),
        // Append audit log record
        prisma.auditLog.create({
          data: {
            userId: targetUser.id,
            action: 'ADMIN_PASSWORD_RESET_CLI',
            entityType: 'AdminUser',
            entityId: targetUser.id,
            metadata: JSON.stringify({
              username: targetUser.username,
              email: targetUser.email,
              mustChangePasswordSet: true,
              source: 'CLI_RESET_SCRIPT',
              timestamp: new Date().toISOString(),
            }),
          },
        }),
      ]);

      updatedUser = uUser;
      sessionCount = sessionResult.count;
    } catch (txErr) {
      console.log('Failed.');
      console.error('\nERROR: Database transaction failed. All changes have been rolled back.');
      const code = extractSafeErrorCode(txErr);
      if (code) {
        console.error(`Database Diagnostic Code: ${code}`);
      }
      process.exit(1);
    }

    console.log('Committed.');
    console.log(`Sessions revoked: ${sessionCount}`);

    console.log('\n====================================================');
    console.log('SUCCESS: Administrator password has been reset atomically.');
    console.log(`Account:  ${updatedUser.username} (${updatedUser.email})`);
    console.log('The administrator must change their password upon their next login.');
    console.log('All previous sessions have been invalidated.');
    console.log('====================================================');
  } catch {
    // Requirement 2: Safe generic error message; never print stack trace or credentials
    console.error('\nERROR: An unexpected error occurred. Operation aborted without modifying database state.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error('\nERROR: Critical unhandled execution error. Operation aborted.');
  process.exit(1);
});
