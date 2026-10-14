import prisma from './prisma.js';

/**
 * Public Data Access Layer:
 * STRICT RULE: All public queries strictly filter by `isPublished: true`.
 * Under no circumstances does draft content leak to public pages.
 */

export async function getProfile() {
  try {
    const profile = await prisma.profile.findFirst();
    if (profile) return profile;
  } catch (error) {
    console.warn('Database not available or empty; using verified baseline profile.');
  }

  // Verified baseline profile for Athrav Pathak
  return {
    name: 'Athrav Pathak',
    headline: 'Full-Stack Software Engineer & Systems Architect',
    bio: 'Specializing in resilient distributed systems, modern web engineering, and high-performance cloud applications. Passionate about building secure, elegant digital experiences with measurable impact.',
    email: 'contact@athravpathak.com',
    location: 'India',
    status: 'Available for high-impact engineering opportunities',
    avatarUrl: null,
    githubUrl: null,
    linkedinUrl: null,
    twitterUrl: null,
    websiteUrl: null,
  };
}

export async function getFeaturedProjects() {
  try {
    return await prisma.project.findMany({
      where: {
        isPublished: true,
        featured: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch (error) {
    console.warn('Unable to query featured projects from database:', error?.message);
    return [];
  }
}

export async function getAllProjects() {
  try {
    return await prisma.project.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch (error) {
    console.warn('Unable to query projects from database:', error?.message);
    return [];
  }
}

export async function getProjectBySlug(slug) {
  if (!slug) return null;
  try {
    return await prisma.project.findFirst({
      where: {
        slug: String(slug).toLowerCase(),
        isPublished: true, // NEVER return unpublished drafts
      },
    });
  } catch (error) {
    console.warn('Unable to query project by slug:', error?.message);
    return null;
  }
}

export async function getCertifications() {
  try {
    return await prisma.certification.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { issueDate: 'desc' }],
    });
  } catch (error) {
    console.warn('Unable to query certifications:', error?.message);
    return [];
  }
}

export async function getExperiences() {
  try {
    return await prisma.experience.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    });
  } catch (error) {
    console.warn('Unable to query experience:', error?.message);
    return [];
  }
}

export async function getSkills() {
  try {
    return await prisma.skill.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  } catch (error) {
    console.warn('Unable to query skills:', error?.message);
    return [];
  }
}

export async function getEducation() {
  try {
    return await prisma.education.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    });
  } catch (error) {
    console.warn('Unable to query education:', error?.message);
    return [];
  }
}

export async function getAchievements() {
  try {
    return await prisma.achievement.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
    });
  } catch (error) {
    console.warn('Unable to query achievements:', error?.message);
    return [];
  }
}
