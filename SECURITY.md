# Application Security Architecture & Governance — Athrav Pathak Portfolio

This document details the security posture, cryptographic controls, defensive engineering practices, and incident handling guidelines implemented in this portfolio.

---

## 1. Authentication & Session Architecture

### Cryptographic Password Hashing: Argon2id
- User passwords are never stored in plaintext or reversible formats.
- Passwords are encrypted using **Argon2id** (via `@node-rs/argon2`), adhering strictly to OWASP cryptographic guidelines:
  - Memory cost: `65,536 KiB` (64 MB)
  - Time iterations: `3`
  - Parallelism: `1` thread
  - Algorithm variant: `Argon2id` (resistant to both GPU side-channel and timing attacks)

### Initial Credential Lifecycle
- Initial bootstrap username: `athrav-admin`
- Temporary bootstrap password: `#Athr2007`
- The bootstrap password is read only during initial setup via `scripts/seed-admin.mjs` and is immediately stored in Argon2id hash format.
- The `must_change_password` boolean flag is set to `true` upon creation.
- The administrator is physically prevented from accessing dashboard content until a new, high-entropy password is created.
- The validator strictly blocks reuse of `#Athr2007`.

### Server-Managed Sessions
- Session tokens are generated using `crypto.randomBytes(32).toString('hex')` (256 bits of cryptographic entropy).
- Tokens are stored in PostgreSQL only after hashing with **SHA-256** to prevent database dump token theft.
- Delivered to the browser via HTTP-only cookies:
  - `HttpOnly: true` (inaccessible to JavaScript, mitigating XSS token extraction)
  - `SameSite: Lax` (protects against CSRF cross-origin state changes)
  - `Secure: true` (enforced automatically in production environments)
  - `Path: /`
  - Expiration: 7 days with automatic session rotation upon login and password change.

---

## 2. Rate Limiting & Abuse Prevention

Unlike in-memory rate limiters that reset during serverless cold starts or fail across multi-instance clusters, rate limiting in this portfolio is **persisted in PostgreSQL**:

| Target Endpoint | Threshold | Window | Identifier |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` (IP) | 5 attempts | 15 minutes | Client IP |
| `/api/auth/login` (Account) | 5 attempts | 15 minutes | Username |
| `/api/contact` | 5 submissions | 60 minutes | Client IP |
| `/api/admin/upload` | 20 uploads | 10 minutes | Admin User ID |

- When limits are exceeded, endpoints return `HTTP 429 Too Many Requests` with a `Retry-After` header.
- Upon successful authentication, failed attempt counters are reset.
- A memory fallback protects the application if database connectivity is temporarily interrupted.

---

## 3. Defense Against Common Vulnerabilities (OWASP Top 10)

### SQL Injection Prevention
- All database operations utilize parameterized queries executed through the Prisma ORM.
- No dynamic raw string concatenation or interpolation is permitted in SQL queries.

### Cross-Site Scripting (XSS)
- Strict React JSX escaping is applied for all user-generated strings.
- Content Security Policy (CSP) restricts script execution to self and trusted domains.

### Cross-Site Request Forgery (CSRF)
- Cookies use `SameSite: Lax`.
- State-changing API routes require custom headers (`X-Requested-With: XMLHttpRequest`) which cannot be forged in cross-origin simple requests.

### Open Redirects & Path Traversal
- Redirect paths are validated strictly against internal routing structures.
- Uploaded files are assigned random UUID filenames rather than user-supplied filenames.

---

## 4. File Upload Security

The `/api/admin/upload` endpoint implements defense-in-depth:
1. **Authentication Guard**: Only authenticated admins with valid sessions can reach the handler.
2. **Rate Limiting**: Throttled to 20 uploads per 10 minutes per administrator.
3. **MIME Type Allowlist**: Restricted to `image/jpeg`, `image/png`, `image/webp`, and `image/gif`.
4. **Magic Byte Signature Inspection**: The server reads the actual binary header of the file buffer to confirm that file content matches its declared MIME type (blocking disguised executables).
5. **Executable & SVG Blocking**: SVGs are disallowed by default to eliminate embedded XML/JavaScript vectors.
6. **Filename Sanitization**: Files are saved with `crypto.randomUUID()` + validated extension, defeating path traversal (`../`).
7. **Size Limits**: Hard ceiling at 5MB per upload.

---

## 5. Security Headers (next.config.mjs)

The application enforces strict HTTP response headers:
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

---

## 6. Audit Logging & Secret Redaction

Every administrative action is recorded in the `audit_logs` table:
- Actions: `SYSTEM_BOOTSTRAP`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGIN_RATE_LIMITED`, `PASSWORD_CHANGED`, `PASSWORD_CHANGE_FAILED`, `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_DELETED`, `FILE_UPLOADED`, `MESSAGE_STATUS_UPDATED`, `MESSAGE_DELETED`.
- Metadata is automatically scrubbed by `sanitizeAuditData()`: passwords, tokens, hashes, authorization headers, and cookies are replaced with `[REDACTED]`.

---

## 7. Incident Response & Secret Leak Protocol

If any administrative credential, database secret, or session token is suspected of exposure:
1. **Revoke Sessions**: Execute `DELETE FROM sessions;` in PostgreSQL to terminate all active sessions.
2. **Update Admin Password**: Use `/api/auth/change-password` or the admin console to establish a new credential.
3. **Rotate Database Password**: Generate a new secret in your cloud database provider (e.g., Neon) and update `DATABASE_URL` in hosting environment settings.
4. **Trigger Redeployment**: Trigger a clean deployment to purge cached environments.
