# ATHRAV PATHAK — PREMIUM 3D PORTFOLIO & CMS

> **"ATHRAV PATHAK — An Aspiring AI Engineer Building Intelligent Digital Experiences."**

A luxury-grade, high-performance personal portfolio and content management system built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Three.js / React Three Fiber / Drei, and Prisma ORM.

Designed with an obsidian, metallic silver, and frosted-glass visual aesthetic inspired by modern luxury industrial design.

---

## 🌟 Key Highlights & Capabilities

- **3D Spatial Hero Experience**: Interactive WebGL scene featuring a metallic core sphere, 3 concentric orbital rings, dynamic particle field, and floating geometric polyhedra responding to user cursor physics.
- **Graceful 3D Degradation & Fallback**: Automatic detection of WebGL capability and `prefers-reduced-motion`. Includes a high-fidelity pure CSS fallback so the interface remains 100% accessible on low-end devices and screen readers.
- **Dedicated Public Pages (No Single-Page Clutter)**:
  - `/` — Homepage featuring 11 configurable sections (Hero, About preview, Education, Skills, Projects, 3D Showcase, Certifications, Experience, Achievements, Services, and Contact CTA).
  - `/about` — Professional philosophy, technical vision, and academic foundations.
  - `/education` — Verified Bachelor of Computer Applications (BCA 2nd Year) curriculum and coursework.
  - `/skills` — 16+ categorized skills across Programming, AI & ML, Frameworks, and Tools with live category filtering.
  - `/projects` & `/projects/[slug]` — High-impact project showcase with deep architectural breakdowns, challenges, solutions, and live/repo links.
  - `/certifications` & `/certifications/[slug]` — Official certifications (Coursera Machine Learning Specialization, Infosys Springboard, Tata GenAI Simulation).
  - `/experience` — Software engineering internship journey and contributions.
  - `/achievements` — Competitions, hackathons, and academic milestones.
  - `/services` — Prototyping, ML model training, and web development capabilities.
  - `/contact` — Secure contact form with honeypot anti-spam, sliding-window rate limiting, and email notification dispatch.
- **Dual-Mode Data Architecture (Local Mock Fixture Mode + Neon PostgreSQL)**:
  - Runs **out of the box** in development mode using type-safe in-memory fixtures. No local database or Docker setup required to preview, build, or test.
  - Fully pre-configured for **PostgreSQL on Neon** via Prisma ORM when `DATABASE_URL` is provided.
- **Full-Featured Admin Management Dashboard (`/admin`)**:
  - Secure session authentication with Argon2id + scrypt fallback, 64-character tokens, and HttpOnly cookies.
  - Comprehensive content management for Profile, Education, Skills, Projects, Certifications, Experience, Achievements, Services, Homepage Sections, Media Assets, and Contact Messages.
  - Draft, Preview, and Publish lifecycle controls (unpublished records remain isolated from public routes).
  - Built-in audit logging, session management, and system health analytics.
- **Security Engineering**:
  - Content Security Policy (CSP), HSTS, X-Content-Type-Options, X-Frame-Options, and Referrer-Policy headers.
  - Honeypot form field + sliding-window in-memory IP rate limiting.
  - Strict input sanitization via Zod schemas.
  - Safe file upload handling with MIME validation, 10MB limits, and automatic SVG rejection to prevent XSS.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS 3, Lucide React icons, Custom CSS animations |
| **3D & Animation** | Three.js, React Three Fiber (R3F) v9, `@react-three/drei` v10, Framer Motion |
| **Persistence** | Dual-Mode Data Service (In-Memory Fixtures + Prisma ORM 6 for PostgreSQL) |
| **Validation** | Zod v3 |
| **Authentication** | Argon2id (`@node-rs/argon2`) with Node.js `crypto.scrypt` fallback, HttpOnly Secure Cookies |
| **Testing** | Vitest v3, `@testing-library/react` |

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- Node.js 18.18+ or 20.x+
- npm 9+ or pnpm 8+

### 2. Installation
```bash
# Clone or navigate to the project directory
cd ATHRAV-PREMIUM-PORTFOLIO

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory by copying the provided example:
```bash
cp .env.example .env
```

The application runs in **Mock Development Mode** by default whenever `DATABASE_URL` is empty. A discreet badge in the navigation bar will inform you that mock mode is active.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the portfolio.

---

## 🔐 Admin Panel & CLI Provisioning

### Default Mock Admin Credentials
In local development mode (without a database configured), you can log into the Admin Dashboard at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) using:

- **Username / Email**: `athrav_admin` or `admin@athravpathak.dev`
- **Password**: `ReplaceWithStrongPassword123!`

### CLI Super Admin Provisioning (When Database is Connected)
When you connect PostgreSQL, run the interactive seeding script to securely provision your administrator account:
```bash
npm run seed:admin
```
This utility hashes the password using Argon2id/scrypt and creates a `SUPER_ADMIN` record with immediate access.

---

## 🧪 Testing & Verification

The project includes unit and integration tests covering the dual-mode data service, Zod schema validation, Argon2id/scrypt authentication, rate limiting, and file upload security.

```bash
# Run unit and integration tests
npm test

# Run tests with UI watcher
npm run test:watch

# Verify strict TypeScript type checking
npm run typecheck

# Build for production
npm run build
```

---

## 🐘 Connecting Neon PostgreSQL (Manual Steps for User)

When you are ready to connect your production PostgreSQL database:

1. **Create a Neon Project**:
   - Go to [console.neon.tech](https://console.neon.tech) and create a project (e.g., `athrav-portfolio`).
   - Copy your connection string from the Neon dashboard. Ensure you use the pooled connection string (`-pooler` endpoint) for serverless environments.

2. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"
   ```

3. **Apply Database Migrations**:
   Run the pre-generated migration to create all tables and indexes:
   ```bash
   npx prisma migrate deploy
   ```
   *(Or run `npx prisma db push` if initializing without existing migration logs).*

4. **Seed the Initial Administrator**:
   ```bash
   npm run seed:admin
   ```

Once `DATABASE_URL` is set, the application will automatically transition from in-memory mode to live PostgreSQL persistence.

---

## ☁️ Deploying to Vercel (Manual Steps for User)

1. **Push your repository** to your GitHub account (`Athravpathak-git`).
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your repository.
3. **Configure Environment Variables** in the Vercel project settings:
   - `DATABASE_URL`: Your Neon pooled connection string.
   - `SESSION_SECRET`: A 64-character random hexadecimal string (generate via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - `NEXT_PUBLIC_SITE_URL`: `https://athravpathak.dev` (or your assigned Vercel URL).
   - `NODE_ENV`: `production`.
   - `STORAGE_DRIVER`: `local` (or `s3` / `blob` if external object storage is configured).
4. **Deploy**:
   - Click **Deploy**. Next.js will build all pages, optimize assets, and deploy to the global Edge Network.

---

## 📂 Project Structure

```
├── app/
│   ├── (public)/                 # Public portfolio pages
│   │   ├── about/page.tsx
│   │   ├── education/page.tsx
│   │   ├── skills/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── projects/[slug]/page.tsx
│   │   ├── certifications/page.tsx
│   │   ├── certifications/[slug]/page.tsx
│   │   ├── experience/page.tsx
│   │   ├── achievements/page.tsx
│   │   ├── services/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx              # 11-section master homepage
│   ├── admin/                    # Admin Management Dashboard
│   │   ├── login/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── education/page.tsx
│   │   ├── skills/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── certifications/page.tsx
│   │   ├── experience/page.tsx
│   │   ├── achievements/page.tsx
│   │   ├── services/page.tsx
│   │   ├── homepage/page.tsx
│   │   ├── media/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── users/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── security/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx              # Admin overview metrics
│   ├── api/                      # REST API endpoints & route handlers
│   │   ├── auth/                 # Login, logout, session verification
│   │   ├── contact/              # Contact form submission with honeypot
│   │   └── admin/                # Admin CMS CRUD endpoints
│   ├── globals.css               # Obsidian & silver styling tokens
│   ├── robots.ts                 # Dynamic robots.txt
│   └── sitemap.ts                # Dynamic XML sitemap
├── components/
│   ├── public/                   # Public components (Navbar, Footer, 3D, Cards)
│   │   ├── Hero3DClient.tsx      # Client-side 3D hero loader
│   │   ├── Hero3DScene.tsx       # Three.js / R3F Canvas & Orbital Rings
│   │   ├── HeroFallback.tsx      # Pure CSS high-fidelity metallic fallback
│   │   ├── Showcase3DClient.tsx  # Client-side 3D showcase loader
│   │   ├── Showcase3D.tsx        # Interactive WebGL geometry & shader viewer
│   │   ├── Navbar.tsx            # Transparent glassmorphic navbar
│   │   ├── Footer.tsx            # Minimalist Apple-inspired footer
│   │   ├── ThemeProvider.tsx     # Dark/Light theme manager
│   │   ├── ThemeToggle.tsx       # Theme switcher button
│   │   ├── DevModeBanner.tsx     # Mock database indicator badge
│   │   ├── ProjectCard.tsx       # Project card with technology tags
│   │   ├── CertificateCard.tsx   # Verified credential display card
│   │   ├── SkillBadge.tsx        # Interactive skill pill with level indicator
│   │   └── ContactForm.tsx       # Protected contact submission form
│   └── admin/
│       └── AdminSidebar.tsx      # Navigation sidebar for CMS
├── lib/
│   ├── auth.ts                   # Password hashing & session token engine
│   ├── auth-guard.ts             # Server-side route protection
│   ├── audit.ts                  # Security event logging
│   ├── data-service.ts           # Dual-mode repository layer (Draft/Publish)
│   ├── db.ts                     # Prisma client singleton
│   ├── mock-data.ts              # Athrav Pathak verified baseline fixtures
│   ├── rate-limiter.ts           # Sliding-window in-memory rate limiter
│   ├── seo.ts                    # Dynamic OpenGraph & JSON-LD schema builder
│   ├── storage/                  # Safe file upload adapter
│   ├── email/                    # Notification dispatch abstraction
│   ├── utils.ts                  # Formatters, URL sanitation, cn helper
│   └── validation/schemas.ts     # Zod data schemas
├── prisma/
│   ├── schema.prisma             # 13 relational models + enums
│   └── migrations/               # Ready-to-apply PostgreSQL migration SQL
├── scripts/
│   └── seed-admin.ts             # CLI administrator provisioning script
├── tests/                        # Vitest unit & integration test suite
└── public/                       # Static public assets and uploads
```

---

## 🔒 Security & Privacy Practices

- **Zero Fabricated Claims**: Content strictly adheres to Athrav Pathak's verified educational background as a 2nd-year BCA student and aspiring AI engineer. Résumé links remain unpublished by default until verified.
- **Credential Protection**: Passwords are protected with memory-hard Argon2id hashing. Session tokens are 256-bit cryptographically secure strings stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **CSRF & Rate Protection**: State-changing API routes validate Origin and Referer headers against trusted hosts. Contact and authentication endpoints enforce strict sliding-window request quotas.

---

## 📄 License

Proprietary © 2026 Athrav Pathak. All rights reserved.
