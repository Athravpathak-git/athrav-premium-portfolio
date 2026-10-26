import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Username or email must be at least 3 characters')
    .max(100, 'Username or email cannot exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(150, 'Email cannot exceed 150 characters'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message cannot exceed 5000 characters'),
  honeypot: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  headline: z.string().trim().min(5).max(200),
  bio: z.string().trim().min(10).max(5000),
  email: z.string().trim().email().max(150),
  location: z.string().trim().max(100).optional().nullable(),
  status: z.string().trim().max(150).optional().nullable(),
  avatarUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (val) =>
        !val ||
        val.startsWith('/') ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('data:image/'),
      { message: 'Avatar URL must be a valid path or URL' }
    )
    .optional()
    .nullable()
    .or(z.literal('')),
  githubUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  linkedinUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  twitterUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  websiteUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  resumeUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (val) =>
        !val ||
        val.startsWith('/') ||
        val.startsWith('http://') ||
        val.startsWith('https://'),
      { message: 'Resume URL must be a valid path or URL' }
    )
    .optional()
    .nullable()
    .or(z.literal('')),
  resumePublished: z.boolean().default(false),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(2).max(200),
  degree: z.string().trim().min(2).max(200),
  fieldOfStudy: z.string().trim().max(200).optional().nullable(),
  university: z.string().trim().max(200).optional().nullable(),
  status: z.string().trim().min(2).max(100),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  grade: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(100),
  category: z.enum([
    'Programming',
    'Web Development',
    'Databases',
    'Artificial Intelligence',
    'Machine Learning',
    'Tools and Platforms',
    'Other',
  ]),
  proficiency: z.string().trim().max(50).optional().nullable(),
  icon: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(250).optional().nullable(),
  summary: z.string().trim().min(10).max(1000),
  description: z.string().trim().min(20).max(10000),
  category: z.string().trim().min(2).max(100).default('Artificial Intelligence'),
  isFeatured: z.boolean().default(false),
  techStack: z.array(z.string().trim()).min(1, 'At least one technology tag is required'),
  liveUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  repoUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  imageUrl: z.string().trim().optional().nullable().or(z.literal('')),
  screenshots: z.array(z.string().trim()).default([]),
  architectureSummary: z.string().trim().max(3000).optional().nullable(),
  challenges: z.string().trim().max(3000).optional().nullable(),
  solutions: z.string().trim().max(3000).optional().nullable(),
  results: z.string().trim().max(3000).optional().nullable(),
  futureImprovements: z.string().trim().max(3000).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const certificationSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  title: z.string().trim().min(2).max(200),
  issuer: z.string().trim().min(2).max(200),
  category: z.string().trim().min(2).max(100).default('Machine Learning'),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  credentialId: z.string().trim().max(100).optional().nullable(),
  credentialUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  imageUrl: z.string().trim().optional().nullable().or(z.literal('')),
  pdfUrl: z.string().trim().optional().nullable().or(z.literal('')),
  description: z.string().trim().max(3000).optional().nullable(),
  relatedSkills: z.array(z.string().trim()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const experienceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  role: z.string().trim().min(2).max(200),
  company: z.string().trim().min(2).max(200),
  employmentType: z.string().trim().max(100).default('Internship'),
  workplaceType: z.string().trim().max(100).default('Remote'),
  location: z.string().trim().max(100).default('India'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().min(10).max(5000),
  responsibilities: z.array(z.string().trim()).default([]),
  technologies: z.array(z.string().trim()).default([]),
  certificateUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  companyUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const achievementSchema = z.object({
  title: z.string().trim().min(2).max(200),
  category: z.string().trim().min(2).max(100).default('Academic & Technical'),
  issuer: z.string().trim().max(200).optional().nullable(),
  date: z.string().optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  badgeUrl: z.string().trim().optional().nullable().or(z.literal('')),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(false),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  icon: z.string().trim().max(50).optional().nullable(),
  techStack: z.array(z.string().trim()).default([]),
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const homepageSectionSchema = z.object({
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  isEnabled: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});
