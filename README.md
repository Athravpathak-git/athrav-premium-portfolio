# Athrav Pathak — Premium Production Portfolio

A secure, high-performance personal portfolio and administrative system engineered for **Athrav Pathak**. Built with **Next.js App Router (JavaScript/JSX)**, **Tailwind CSS**, **Three.js**, **PostgreSQL**, **Prisma ORM**, and **Argon2id**.

![Design Aesthetic](https://img.shields.io/badge/Design-Apple%20Dark%20Obsidian-111118?style=flat-square)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20Only-336791?style=flat-square&logo=postgresql)
![Security](https://img.shields.io/badge/Security-Argon2id%20%7C%20Rate%20Limited-emerald?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-Vitest%2013%2F13%20Passing-brightgreen?style=flat-square)

---

## 1. Architectural Highlights

- **Visual Experience**: Apple-inspired dark aesthetic with deep obsidian surfaces (`#050508`), silver typography, subtle glassmorphism, responsive layouts, accessible focus states, and reduced-motion support.
- **3D Cinematic Hero**: Interactive Three.js metallic sphere and orbital rings with cursor-tracking parallax, optimized performance, and an accessible CSS/canvas fallback for devices without WebGL.
- **Database Architecture**: **PostgreSQL exclusively** via Prisma ORM with committed migration files, parameterized queries, indexes, and ACID transaction support.
- **Private Admin Dashboard**: Private control center for creating, editing, reordering, publishing, and deleting portfolio content with preview support and confirmation dialogs.
- **Defense in Depth**:
  - Passwords hashed with **Argon2id** (64MB memory, 3 iterations).
  - Mandatory password rotation on first login for temporary bootstrap credentials.
  - Server-managed sessions stored hashed in PostgreSQL with HTTP-only SameSite cookies.
  - Persistent PostgreSQL rate limiting across serverless and multi-instance environments.
  - Image upload security with MIME checking, magic byte signature inspection, and UUID filenames.
  - Strict Content Security Policy (CSP), HSTS, frame-ancestors: 'none', and immutable audit logging.
- **Draft Isolation**: Public queries strictly enforce `isPublished: true`. Draft content never appears on public pages.
- **Verified Data Only**: No fake ratings, invented achievements, or placeholder resumes.

---

## 2. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16+ (App Router, JavaScript, JSX) |
| **Styling** | Tailwind CSS v4, PostCSS, Glassmorphism |
| **3D Graphics** | Three.js (WebGL with accessible CSS fallback) |
| **Database** | PostgreSQL 17 / Cloud PostgreSQL |
| **ORM** | Prisma ORM with versioned migrations |
| **Validation** | Zod Schema Validation |
| **Password Hashing** | Argon2id (`@node-rs/argon2`) |
| **Icons** | Lucide React |
| **Testing** | Vitest (unit, integration, and security tests) |

---

## 3. Route Structure

### Public Pages
- `/` — Home (Hero with 3D metallic sphere, engineering principles, featured work preview)
- `/about` — About Athrav Pathak (Philosophy, systems mindset, core competencies)
- `/skills` — Technical stack categorized by engineering domain
- `/projects` — Searchable, filterable project case studies
- `/projects/[slug]` — Deep-dive architecture and metrics for individual projects
- `/certifications` — Verified professional credentials and verification links
- `/experience` — Engineering positions and internships timeline
- `/education` — Academic history, coursework, and honors
- `/achievements` — Competitions, hackathons, and honors
- `/contact` — Secure contact form with honeypot anti-spam and IP masking
- `/privacy` — Privacy policy and data retention disclosures
- `/terms` — Terms of use
- `not-found.jsx` — Luxury 404 page

### Private Admin Dashboard
- `/admin/login` — Administrator authentication with persistent rate limiting
- `/admin` — System overview, content counts, live metrics, and recent inquiries
- `/admin/profile` — Name, headline, bio, and social links manager
- `/admin/projects` — Projects CRUD, publish toggles, and live previews
- `/admin/certifications` — Certifications manager
- `/admin/experience` — Career timeline manager
- `/admin/skills` — Categorized skills manager
- `/admin/education` — Academic history manager
- `/admin/achievements` — Achievements manager
- `/admin/messages` — Private contact inquiries viewer with email reply links
- `/admin/audit-logs` — Immutable administrative security action trails

---

## 4. Documentation Index

Detailed engineering documentation is organized across specialized guides:

- [DATABASE_SETUP.md](file:///C:/Users/Shree/Desktop/ATHRAV-PREMIUM-PORTFOLIO/DATABASE_SETUP.md) — PostgreSQL provisioning, schema, migrations, least-privilege roles, and backups.
- [SECURITY.md](file:///C:/Users/Shree/Desktop/ATHRAV-PREMIUM-PORTFOLIO/SECURITY.md) — Argon2id implementation, session cookies, rate limiting, and upload protection.
- [DEPLOYMENT.md](file:///C:/Users/Shree/Desktop/ATHRAV-PREMIUM-PORTFOLIO/DEPLOYMENT.md) — Free-tier cloud deployment on Vercel and Neon PostgreSQL.
- [ADMIN_GUIDE.md](file:///C:/Users/Shree/Desktop/ATHRAV-PREMIUM-PORTFOLIO/ADMIN_GUIDE.md) — Operational instructions for updating content via the admin portal.
- [TESTING.md](file:///C:/Users/Shree/Desktop/ATHRAV-PREMIUM-PORTFOLIO/TESTING.md) — Test suites, coverage scopes, and verification instructions.

---

## 5. Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v24)
- PostgreSQL (Local PostgreSQL 17 or Cloud PostgreSQL like Neon)

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `DATABASE_URL` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/athrav_portfolio?schema=public"
```

### 3. Run Migrations & Bootstrap Admin
```bash
# Apply PostgreSQL migrations
npx prisma migrate deploy

# Bootstrap initial admin (athrav-admin with temporary credential #Athr2007)
npm run seed:admin
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portfolio.  
Access the admin portal at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 6. Verification Commands

```bash
# Run automated tests
npm test

# Run Next.js production build
npm run build

# Run security vulnerability audit
npm run security:audit
```

---

## 7. License
Proprietary portfolio implementation for **Athrav Pathak**. All rights reserved.
