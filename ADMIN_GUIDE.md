# Administrator Guide — Athrav Pathak Portfolio Dashboard

Welcome to the private administrative console for managing your portfolio. This guide explains all dashboard functions, content workflows, and operational procedures.

---

## 1. Accessing the Dashboard

1. Navigate to `/admin/login` in your browser.
2. Enter your credentials.
3. If logging in for the very first time with the bootstrap password `#Athr2007`, the system will mandate that you update your password before accessing other features.

---

## 2. Managing Content

### Draft vs. Published States
Every content item (Project, Certification, Experience, Skill, Education, Achievement) possesses a **Publication Status**:
- **Published**: The item is visible on public portfolio pages (`/`, `/projects`, `/about`, etc.).
- **Draft**: The item is stored securely in PostgreSQL but is **completely invisible** on public pages.
- You can toggle publication status with a single click in the management tables or inside the edit forms.

### Sort Order
All listable items include a `Sort Priority` integer:
- Items with lower sort numbers (e.g. `0`, `1`, `2`) appear first.
- Use this field to highlight your most impressive case studies or recent experiences.

---

## 3. Section by Section Reference

### 1. Profile (`/admin/profile`)
- Update your legal name, headline, bio, contact email, and location.
- Upload an optional profile avatar image.
- Configure public social URLs (GitHub, LinkedIn, etc.).

### 2. Projects (`/admin/projects`)
- Click **New Project** to create a project case study.
- **Slug**: A unique URL identifier (e.g., `high-throughput-raft-engine`). The system automatically suggests one based on the project title.
- **Featured**: Check this box to display the project directly on the home page hero work grid.
- **Tech Stack**: Enter comma-separated technologies (e.g. `Next.js, PostgreSQL, Docker`).
- **Live Demo & Repo URLs**: Links to public deployments and code repositories.
- **Preview**: Click the eye icon to preview the project card before publishing.

### 3. Certifications (`/admin/certifications`)
- Record verified credentials, issuing bodies, issue and expiration dates.
- Add credential IDs and direct verification URLs.

### 4. Experience (`/admin/experience`)
- Document software engineering positions, internships, and research roles.
- Check **Present** for your ongoing positions.
- Outline key contributions, system metrics, and applied technologies.

### 5. Skills (`/admin/skills`)
- Group technical proficiencies into distinct domains (e.g. Languages, Databases, Cloud & DevOps).
- Set proficiency indicators (e.g. Advanced, Proficient).

### 6. Education (`/admin/education`)
- Record academic degrees, universities, coursework, honors, and activities.

### 7. Achievements (`/admin/achievements`)
- Add competitive programming honors, hackathon awards, and recognitions.

### 8. Contact Inquiries (`/admin/messages`)
- Inquiries submitted via `/contact` appear here in real-time.
- Unread messages are marked with a blue indicator dot.
- Click any message to read its full body and view the sender's details.
- Click **Reply via Email** to launch your email client with pre-filled recipient and subject.
- Click the trash icon to permanently purge a message (with confirmation).

### 9. Security Audit Logs (`/admin/audit-logs`)
- Review an immutable, paginated trail of every administrative action.
- Filter by action types (`LOGIN_SUCCESS`, `PROJECT_CREATED`, etc.).
- All sensitive credentials are automatically redacted before logging.

---

## 4. Password Rotation & Account Security

You can update your administrator password at any time:
1. Click **Update Password** at the bottom of the admin sidebar.
2. Enter your current password and your new password.
3. The password must be at least 10 characters long and include uppercase, lowercase, numbers, and symbols.
4. The system will rehash the password using Argon2id and automatically rotate your session token.
