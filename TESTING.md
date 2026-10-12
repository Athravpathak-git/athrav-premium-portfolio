# Automated Testing Suite & Verification Guide

This document describes the automated test architecture, coverage scopes, and verification procedures implemented for **Athrav Pathak's Premium Portfolio**.

---

## 1. Test Architecture & Runner

The project uses **Vitest** configured for Node.js App Router environments in `vitest.config.mjs`.

### Running All Automated Tests:
```bash
npm test
```
Or with watch mode for continuous development:
```bash
npm run test:watch
```

---

## 2. Test Suite Breakdown

### 1. Authentication & Password Security (`tests/auth.test.js`)
- **Argon2id Hashing**: Confirms that hashes start with `$argon2id$` and adhere to OWASP parameters (64MB memory, 3 iterations).
- **Password Verification**: Validates correct password matching and guarantees incorrect passwords return `false`.
- **Strength Validation**: Enforces length >= 10, uppercase, lowercase, numbers, and symbols.
- **Bootstrap Password Retirement**: Validates that `#Athr2007` is strictly rejected when setting a replacement password.
- **Session Tokens**: Verifies 256-bit cryptographic entropy (`crypto.randomBytes(32)`) and SHA-256 token hashing.

### 2. Schema Validation & Anti-Spam (`tests/validation.test.js`)
- **Login Schema**: Validates input formatting and character constraints.
- **Contact Form Validation**: Ensures email format verification, minimum character thresholds, and honeypot bot trap detection.
- **URL Slug Integrity**: Tests slug regex `^[a-z0-9-]+$` to prevent invalid characters and URL collision.
- **Password Match Verification**: Confirms `newPassword === confirmPassword`.

### 3. Persistent Rate Limiting (`tests/rate-limit.test.js`)
- **Quota Tracking**: Verifies point deduction and remaining balance calculation.
- **Enforcement**: Confirms requests beyond configured limits are blocked (`allowed: false, remaining: 0`).
- **Fault-Tolerance**: Confirms fallback handling when database access is in initialization mode.

### 4. Audit Log Sanitization (`tests/security-audit.test.js`)
- **Secret Redaction**: Confirms recursive redaction of sensitive keys (`password`, `passwordHash`, `token`, `sessionToken`, `secret`, `authorization`, `cookie`).
- **Data Integrity**: Guarantees non-sensitive action descriptors and entity IDs remain intact.

### 5. Public / Private Data Isolation (`tests/data-separation.test.js`)
- **Draft Shielding**: Confirms that public queries filter strictly by `isPublished: true`.
- **Unpublished Slug Protection**: Confirms that unpublished items requested by slug return `null` and do not leak content to visitors.

---

## 3. Production Build & Linting Verification

### Production Build:
```bash
npm run build
```
This executes:
1. `prisma generate` to compile Prisma client models.
2. `next build` to verify all App Router static pages, dynamic endpoints, route handlers, and CSS assets.

### Dependency Security Audit:
```bash
npm run security:audit
```
Verifies that no critical or high vulnerabilities exist in the runtime dependencies.
