import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  contactSchema,
  projectSchema,
  changePasswordSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
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

  it('should enforce conditional validation on education records based on status', () => {
    // Valid Pursuing education
    const validPursuing = educationSchema.safeParse({
      institution: 'Pune Institute of Computer Technology',
      degree: 'BCA',
      status: 'Pursuing',
      startDate: '2023-08-01',
      expectedGradYear: 2026,
    });
    expect(validPursuing.success).toBe(true);

    // Invalid Pursuing: expectedGradYear earlier than start year
    const invalidPursuing = educationSchema.safeParse({
      institution: 'Pune Institute of Computer Technology',
      degree: 'BCA',
      status: 'Pursuing',
      startDate: '2025-08-01',
      expectedGradYear: 2023,
    });
    expect(invalidPursuing.success).toBe(false);

    // Valid Completed education
    const validCompleted = educationSchema.safeParse({
      institution: 'Pune University',
      degree: 'B.Tech',
      status: 'Completed',
      startDate: '2020-08-01',
      endDate: '2024-06-01',
    });
    expect(validCompleted.success).toBe(true);

    // Invalid Completed: completion earlier than start year
    const invalidCompleted = educationSchema.safeParse({
      institution: 'Pune University',
      degree: 'B.Tech',
      status: 'Completed',
      startDate: '2024-08-01',
      endDate: '2020-06-01',
    });
    expect(invalidCompleted.success).toBe(false);
  });

  it('should validate experience schema with employment and workplace types', () => {
    const validExp = experienceSchema.safeParse({
      role: 'Full-Stack Software Engineer Intern',
      company: 'Infosys',
      employmentType: 'Internship',
      workplaceType: 'Hybrid',
      location: 'Pune, India',
      startDate: '2025-01-01',
      isCurrent: true,
      description: 'Engineered backend APIs and integrated PostgreSQL databases.',
      technologies: ['Next.js', 'PostgreSQL', 'Prisma'],
    });
    expect(validExp.success).toBe(true);
  });

  it('should validate profile social links and allow empty strings or valid URLs', () => {
    const validProfile = profileSchema.safeParse({
      name: 'Athrav Pathak',
      headline: 'Full-Stack Software Engineer',
      bio: 'Engineering high performance systems.',
      email: 'contact@athravpathak.com',
      githubUrl: 'https://github.com/athravpathak',
      linkedinUrl: 'https://linkedin.com/in/athravpathak',
      websiteUrl: 'https://athravpathak.com',
      twitterUrl: '',
    });
    expect(validProfile.success).toBe(true);

    const invalidProfile = profileSchema.safeParse({
      name: 'Athrav Pathak',
      headline: 'Engineer',
      bio: 'Too short',
      email: 'not-an-email',
      githubUrl: 'not-a-url',
    });
    expect(invalidProfile.success).toBe(false);
  });
});
