import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  changePasswordSchema,
  contactFormSchema,
  projectSchema,
  certificationSchema,
  skillSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('contactFormSchema', () => {
    it('accepts valid contact form submissions', () => {
      const valid = {
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        subject: 'AI Internship Opportunity',
        message: 'Hello Athrav, we would love to interview you for an AI engineering internship.',
      };
      const result = contactFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const invalid = {
        name: 'John Doe',
        email: 'invalid-email-string',
        subject: 'Inquiry',
        message: 'This is a test message to verify email validation.',
      };
      const result = contactFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it('rejects short messages below minimum length', () => {
      const invalid = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hi',
        message: 'Too short',
      };
      const result = contactFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('projectSchema', () => {
    it('accepts valid project payloads', () => {
      const valid = {
        title: 'OmniMind AI Platform',
        slug: 'omnimind-ai',
        summary: 'An autonomous multi-modal reasoning prototype.',
        description: 'Detailed description of the architecture and implementation.',
        category: 'Artificial Intelligence',
        techStack: ['Python', 'TypeScript', 'Next.js'],
        sortOrder: 1,
        isPublished: true,
      };
      const result = projectSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects slugs with uppercase or special symbols', () => {
      const invalid = {
        title: 'Project Title',
        slug: 'Invalid Slug With Spaces!',
        summary: 'Summary with sufficient character length.',
        description: 'Description with sufficient character length.',
        category: 'Artificial Intelligence',
        techStack: ['Python'],
      };
      const result = projectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('requires at least one tech stack tag', () => {
      const invalid = {
        title: 'Project Title',
        slug: 'project-slug',
        summary: 'Summary with sufficient character length.',
        description: 'Description with sufficient character length.',
        category: 'Artificial Intelligence',
        techStack: [],
      };
      const result = projectSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('certificationSchema', () => {
    it('accepts valid certification payloads', () => {
      const valid = {
        title: 'Machine Learning Specialization',
        slug: 'coursera-ml-specialization',
        issuer: 'Coursera / DeepLearning.AI',
        category: 'Machine Learning',
        description: 'Comprehensive study of machine learning algorithms.',
        relatedSkills: ['Python', 'Linear Regression'],
        isPublished: false,
      };
      const result = certificationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('auth schemas', () => {
    it('validates minimum password length in login', () => {
      const invalid = { identifier: 'admin', password: 'short' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('enforces password confirmation match in changePasswordSchema', () => {
      const mismatched = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };
      const result = changePasswordSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
    });
  });
});
