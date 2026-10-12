import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  contactSchema,
  projectSchema,
  changePasswordSchema,
} from '../lib/validation.js';

describe('Schema Validation & Input Security', () => {
  it('should validate login credentials schema correctly', () => {
    const valid = loginSchema.safeParse({
      username: 'athrav-admin',
      password: 'password123',
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      username: 'a!', // invalid characters
      password: '',
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate contact submissions and enforce honeypot anti-spam', () => {
    const valid = contactSchema.safeParse({
      name: 'Elena Rostova',
      email: 'elena@example.com',
      subject: 'Architecture Discussion',
      message: 'This is a message with sufficient length for validation.',
      honeypot: '',
    });
    expect(valid.success).toBe(true);

    // Invalid email
    const invalidEmail = contactSchema.safeParse({
      name: 'Elena',
      email: 'not-an-email',
      subject: 'Inquiry',
      message: 'Valid message body length here.',
    });
    expect(invalidEmail.success).toBe(false);

    // Spam honeypot filled
    const spamTrap = contactSchema.safeParse({
      name: 'Bot',
      email: 'bot@example.com',
      subject: 'Buy Crypto',
      message: 'Spam message content here.',
      honeypot: 'http://spam-site.com',
    });
    expect(spamTrap.success).toBe(false);
  });

  it('should validate project schemas and require safe url slugs', () => {
    const valid = projectSchema.safeParse({
      title: 'Distributed Consensus Engine',
      slug: 'distributed-consensus-engine',
      summary: 'High performance Raft protocol engine in Node.',
      description: 'Comprehensive system breakdown and details.',
      category: 'Distributed Systems',
      featured: true,
      techStack: ['Node.js', 'PostgreSQL', 'Docker'],
      sortOrder: 1,
      isPublished: true,
    });
    expect(valid.success).toBe(true);

    // Malformed slug (spaces, uppercase, symbols)
    const invalidSlug = projectSchema.safeParse({
      title: 'My Project',
      slug: 'My Invalid Project Slug!',
      summary: 'Summary description here.',
      description: 'Full description.',
      category: 'Full Stack',
    });
    expect(invalidSlug.success).toBe(false);
  });

  it('should validate password change matching requirements', () => {
    const valid = changePasswordSchema.safeParse({
      currentPassword: '#Athr2007',
      newPassword: 'BrandNewSecurePass@2026',
      confirmPassword: 'BrandNewSecurePass@2026',
    });
    expect(valid.success).toBe(true);

    const mismatched = changePasswordSchema.safeParse({
      currentPassword: '#Athr2007',
      newPassword: 'BrandNewSecurePass@2026',
      confirmPassword: 'DifferentPassword@2026',
    });
    expect(mismatched.success).toBe(false);
  });
});
