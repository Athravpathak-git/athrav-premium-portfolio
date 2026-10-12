import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username cannot exceed 50 characters.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .max(128, 'Password too long.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(10, 'New password must be at least 10 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  headline: z.string().trim().min(2, 'Headline is required.').max(200),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters.').max(5000),
  email: z.string().trim().email('Invalid email address.'),
  location: z.string().trim().max(100).optional().nullable(),
  status: z.string().trim().max(150).optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  githubUrl: z.string().trim().url('Invalid GitHub URL').optional().or(z.literal('')).nullable(),
  linkedinUrl: z.string().trim().url('Invalid LinkedIn URL').optional().or(z.literal('')).nullable(),
  twitterUrl: z.string().trim().url('Invalid Twitter/X URL').optional().or(z.literal('')).nullable(),
  websiteUrl: z.string().trim().url('Invalid Website URL').optional().or(z.literal('')).nullable(),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2, 'Title is required.').max(200),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required.')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.'),
  subtitle: z.string().trim().max(200).optional().nullable(),
  summary: z.string().trim().min(5, 'Summary must be at least 5 characters.').max(500),
  description: z.string().trim().min(10, 'Full description is required.'),
  category: z.string().trim().min(2, 'Category is required.').max(50),
  featured: z.boolean().default(false),
  techStack: z.array(z.string().trim()).default([]),
  liveUrl: z.string().trim().url('Invalid Live Demo URL').optional().or(z.literal('')).nullable(),
  repoUrl: z.string().trim().url('Invalid Repository URL').optional().or(z.literal('')).nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const certificationSchema = z.object({
  title: z.string().trim().min(2, 'Certification title is required.').max(200),
  issuer: z.string().trim().min(2, 'Issuing authority is required.').max(150),
  issueDate: z.string().trim().optional().nullable(),
  expiryDate: z.string().trim().optional().nullable(),
  credentialId: z.string().trim().max(100).optional().nullable(),
  credentialUrl: z.string().trim().url('Invalid credential URL').optional().or(z.literal('')).nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const experienceSchema = z.object({
  role: z.string().trim().min(2, 'Role / Title is required.').max(150),
  company: z.string().trim().min(2, 'Company / Organization is required.').max(150),
  location: z.string().trim().max(100).optional().nullable(),
  startDate: z.string().trim().min(4, 'Start date is required.'),
  endDate: z.string().trim().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().min(10, 'Description is required.'),
  technologies: z.array(z.string().trim()).default([]),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required.').max(100),
  category: z.string().trim().min(2, 'Category is required.').max(50),
  proficiency: z.string().trim().max(50).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(2, 'Institution name is required.').max(150),
  degree: z.string().trim().min(2, 'Degree is required.').max(150),
  fieldOfStudy: z.string().trim().max(150).optional().nullable(),
  startDate: z.string().trim().optional().nullable(),
  endDate: z.string().trim().optional().nullable(),
  grade: z.string().trim().max(50).optional().nullable(),
  activities: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const achievementSchema = z.object({
  title: z.string().trim().min(2, 'Title is required.').max(200),
  issuer: z.string().trim().max(150).optional().nullable(),
  date: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  badgeUrl: z.string().trim().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Please enter a valid email address.').max(150),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(3000),
  honeypot: z.string().max(0, 'Spam detected.').optional().or(z.literal('')),
});
