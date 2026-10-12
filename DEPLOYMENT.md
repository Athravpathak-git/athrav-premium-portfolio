# Production Deployment Architecture & Playbook

This guide covers deploying **Athrav Pathak's Premium Portfolio** to production on free-tier-friendly hosting infrastructure while maintaining strict separation between the Next.js application runtime and the PostgreSQL database.

---

## 1. Hosting Architecture Overview

The recommended and battle-tested production topology:
- **Application Frontend & Backend**: Vercel (Hobby Tier) or Render / Railway / Netlify
- **Database**: Separate Hosted PostgreSQL on **Neon** (Free Tier) or Tembo / Supabase (database only) / Render PostgreSQL
- **Domain & DNS**: Custom domain or free provider subdomain with automated TLS certificates

```
[ Browser / Client ]
       │ HTTPS / TLS
       ▼
[ Next.js Application on Vercel / Render ]
       │ Secure Parameterized Query over Encrypted TLS (sslmode=require)
       ▼
[ Cloud PostgreSQL Database (Neon / AWS RDS) ]
```

---

## 2. Step 1: Provisioning Hosted PostgreSQL

### Option A: Neon Serverless PostgreSQL (Recommended)
1. Sign up at [neon.tech](https://neon.tech).
2. Create a new project: `athrav-portfolio-db`.
3. In the project dashboard, locate the **Connection Details** box.
4. Select **Prisma** or **PostgreSQL** connection string.
5. Copy the pooled connection URL, which looks like:
   ```
   postgresql://athrav_owner:AbC123XyZ@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Free-Tier Considerations & Limitations:
- **Neon Free Tier**:
  - 0.5 GiB storage included.
  - Auto-suspends compute after 5 minutes of inactivity (first query after inactivity may experience a 1-2 second cold start).
  - Point-in-time recovery available within 24 hours.
  - Generous bandwidth and query quotas suitable for personal and showcase traffic.
  - *Action*: Monitor storage usage in the Neon console.

---

## 3. Step 2: Configuring Secrets in the Hosting Provider

In your hosting provider dashboard (e.g. Vercel Project Settings → Environment Variables):

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Database connection |
| `SESSION_SECRET` | `64-character random hex string` | Session encryption |
| `SEED_ADMIN_PASSWORD` | `#Athr2007` | Temporary bootstrap credential |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Canonical site origin |
| `NODE_ENV` | `production` | Enables Secure cookies and optimizations |

> [!WARNING]
> Never commit `.env` or `.env.local` to Git. Only `.env.example` should exist in the repository.

---

## 4. Step 3: Running Production Migrations

Do not run `prisma migrate dev` in production. Execute the deployment migration command:

### In Local Terminal (pointing to remote DATABASE_URL):
```bash
# Set remote database URL temporarily in your local shell
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"

# Apply committed migrations
npx prisma migrate deploy
```

### Alternatively, in Vercel / Deployment Build Script:
In `package.json`, the build script is configured as:
```json
"build": "prisma generate && next build"
```
You can also run migrations during CI/CD or via a one-time deployment release command:
```bash
npx prisma migrate deploy
```

---

## 5. Step 4: Bootstrapping the Initial Administrator

Since there is **no public registration page**, run the bootstrap script from your secure local terminal with the production `DATABASE_URL` set:

```bash
# In local shell
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
$env:SEED_ADMIN_PASSWORD="#Athr2007"
node scripts/seed-admin.mjs
```

The output will confirm:
```
✓ Database connection established.
Creating initial administrator "athrav-admin"...
✓ Initial profile metadata created for Athrav Pathak.
✓ Administrator account successfully bootstrapped!
  Username: athrav-admin
  Must change password on first login: YES (Enforced)
```

---

## 6. Step 5: First Login & Mandatory Password Change

1. Navigate to your deployed URL: `https://your-domain.vercel.app/admin/login`.
2. Enter the initial bootstrap credentials:
   - **Username**: `athrav-admin`
   - **Password**: `#Athr2007`
3. Upon authentication, the dashboard will immediately display the **Mandatory Password Update** modal.
4. Enter `#Athr2007` as the current password, and choose a new, strong private password (minimum 10 characters with upper, lower, digit, and symbol).
5. Once saved, `#Athr2007` is retired and cannot be reused.

---

## 7. Step 6: Post-Deployment Verification Checklist

- [ ] **HTTPS & TLS**: Confirm SSL padlocks in browser without certificate warnings.
- [ ] **Security Headers**: Inspect response headers using `curl -I https://your-domain.com` or browser DevTools:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy` active
- [ ] **Cookie Flags**: Check `athrav_admin_session` cookie has `HttpOnly`, `SameSite=Lax`, and `Secure` attributes.
- [ ] **Draft Isolation**: Verify draft projects in `/admin/projects` do NOT appear on `/projects` or `/`.
- [ ] **Contact Form**: Submit a test message at `/contact` and verify receipt in `/admin/messages`.
- [ ] **Rate Limiting**: Submit 6 rapid failed logins at `/admin/login` and verify HTTP 429 rate limit engagement.
