# PostgreSQL Database Architecture & Setup Guide

This document provides complete instructions for provisioning, configuring, securing, and migrating the PostgreSQL database for **Athrav Pathak's Premium Portfolio**.

---

## 1. Architectural Overview

The portfolio uses **PostgreSQL exclusively** as its persistent data store. Under no circumstances does the application use MongoDB, Firebase, Supabase client SDKs, SQLite, or local JSON files for persistent state.

### Core Tables & Models
| Model Name | Table Name | Purpose |
| :--- | :--- | :--- |
| `AdminUser` | `admin_users` | Admin credentials (Argon2id hash), must-change-password flag, role |
| `Session` | `sessions` | Server-managed session tokens (SHA-256 hashed), IP, User-Agent, expiration |
| `Profile` | `profile` | Verified personal information, bio, headline, contact email, social URLs |
| `Project` | `projects` | Case studies, system architectures, tech stacks, live links, draft/published state |
| `Certification` | `certifications` | Professional credentials, issuing bodies, verification URLs, draft state |
| `Experience` | `experiences` | Career history, internships, roles, technologies, draft state |
| `Skill` | `skills` | Competencies categorized by domain and proficiency |
| `Education` | `education` | Degree programs, academic institutions, coursework, draft state |
| `Achievement` | `achievements` | Competitions, hackathons, recognitions, draft state |
| `ContactMessage` | `contact_messages` | Private incoming inquiries from contact form with IP privacy masking |
| `AuditLog` | `audit_logs` | Immutable administrative security action trails with redacted metadata |
| `RateLimit` | `rate_limits` | Atomic persistent rate limiting across multi-instance serverless deployments |

---

## 2. Environment Configuration

The application expects a server-only environment variable named `DATABASE_URL`.

Create `.env.local` (for local development) by copying `.env.example`:

```bash
cp .env.example .env.local
```

### Connection String Format
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database_name>?schema=public&sslmode=prefer"
```

### Examples:
- **Local PostgreSQL**:
  ```env
  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/athrav_portfolio?schema=public"
  ```
- **Cloud PostgreSQL (Neon / AWS RDS / Render / Railway / Tembo)**:
  ```env
  DATABASE_URL="postgresql://athrav_user:StrongSecret123@ep-bold-glitter-123.us-east-2.aws.neon.tech/athrav_db?sslmode=require"
  ```

> [!IMPORTANT]
> The database password must be a separate, unique high-entropy secret generated specifically for PostgreSQL. Never reuse the portfolio admin password `#Athr2007` as the database password.

---

## 3. Least-Privilege Database Role (Production Hardening)

Do not run the deployed web application using the PostgreSQL `postgres` superuser. Instead, provision a dedicated least-privilege application user in PostgreSQL:

```sql
-- 1. Create a dedicated database
CREATE DATABASE athrav_portfolio;

-- 2. Connect to the new database
\c athrav_portfolio

-- 3. Create dedicated application role
CREATE USER portfolio_app WITH PASSWORD 'Generate_A_Very_Strong_Password_Here';

-- 4. Grant connection and schema privileges
GRANT CONNECT ON DATABASE athrav_portfolio TO portfolio_app;
GRANT USAGE ON SCHEMA public TO portfolio_app;

-- 5. Grant CRUD and sequence permissions on public tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portfolio_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portfolio_app;

-- 6. Ensure future tables created by migrations inherit permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO portfolio_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO portfolio_app;
```

---

## 4. Applying Database Migrations

Pre-generated migration SQL files are located in `prisma/migrations/20260212000000_init/migration.sql`.

### Development Migration:
```bash
npx prisma migrate dev
```

### Production Migration Deployment:
```bash
npx prisma migrate deploy
```

### Generating Prisma Client Bindings:
```bash
npx prisma generate
```

---

## 5. Initial Admin Account Bootstrap

After applying database migrations, run the secure bootstrap script to create the initial administrative account:

```bash
npm run seed:admin
```

The script will:
1. Verify the database connection.
2. Read `SEED_ADMIN_PASSWORD` (defaulting to `#Athr2007` if set in `.env.local`).
3. Hash the credential using **Argon2id**.
4. Set the `must_change_password` flag to `true` to mandate a password change on first login.
5. Create baseline verified profile metadata for Athrav Pathak.
6. Write a `SYSTEM_BOOTSTRAP` event to the `audit_logs` table.
7. Lock the bootstrap process to prevent unauthorized re-execution.

---

## 6. Backup & Disaster Recovery Procedures

### Creating an Encrypted Logical Backup:
```bash
# Set password temporarily in environment
export PGPASSWORD="your_database_password"

# Perform backup with custom compression format
pg_dump -h localhost -U portfolio_app -d athrav_portfolio -F c -b -v -f "athrav_portfolio_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Restoring from Backup:
```bash
# Restore to database
pg_restore -h localhost -U portfolio_app -d athrav_portfolio -v -c "athrav_portfolio_backup_YYYYMMDD_HHMMSS.dump"
```

### Disaster Recovery Checklist:
1. If the database server is compromised, immediately revoke all existing sessions in the `sessions` table.
2. Rotate `DATABASE_URL` credentials in your cloud hosting provider dashboard.
3. Apply pending migrations with `npx prisma migrate deploy`.
4. Run `npm test` to verify database health and validation guards.
