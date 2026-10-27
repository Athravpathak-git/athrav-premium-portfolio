/**
 * Data Service & Content Persistence Layer
 * Guarantees single-source-of-truth email persistence and multi-model synchronization.
 */
import fs from 'fs';
import path from 'path';
import { isDatabaseConfigured, isDatabaseAvailable, withDbTimeout, getPrisma, recordDatabaseFailure } from './db';
import {
  initialProfile,
  initialEducation,
  initialSkills,
  initialProjects,
  initialCertifications,
  initialExperience,
  initialAchievements,
  initialServices,
  initialHomepageSections,
  initialCertificateCategories,
  initialSocialLinks,
  ProfileData,
  EducationData,
  SkillData,
  ProjectData,
  CertificationData,
  CertificateCategoryData,
  ExperienceData,
  AchievementData,
  ServiceData,
  HomepageSectionData,
  ContactMessageData,
  AuditLogData,
  SocialLinkData,
} from './mock-data';

const DEV_STORAGE_DIR = path.join(process.cwd(), '.dev-storage');
const DEV_STORE_FILE = path.join(DEV_STORAGE_DIR, 'portfolio-dev-store.json');

function ensureDevStorageDir() {
  try {
    if (!fs.existsSync(DEV_STORAGE_DIR)) {
      fs.mkdirSync(DEV_STORAGE_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

function getInitialDevStore() {
  return {
    profile: { ...initialProfile },
    education: [...initialEducation],
    skills: [...initialSkills],
    projects: [...initialProjects],
    certifications: [...initialCertifications],
    certificateCategories: [...initialCertificateCategories],
    experience: [...initialExperience],
    achievements: [...initialAchievements],
    services: [...initialServices],
    homepageSections: [...initialHomepageSections],
    socialLinks: [...initialSocialLinks],
    contactMessages: [] as ContactMessageData[],
    auditLogs: [] as AuditLogData[],
    mediaItems: [] as {
      id: string;
      filename: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
      storageProvider: string;
      altText?: string;
      description?: string;
      category: string;
      createdAt: string;
    }[],
    settings: {
      siteName: 'Athrav Pathak Portfolio',
      metaTitle: 'Athrav Pathak — Aspiring AI Engineer',
      metaDescription:
        'Personal portfolio of Athrav Pathak, Aspiring AI Engineer pursuing BCA in second year. Explore projects, machine learning credentials, and technical capabilities.',
      themeDefault: 'dark',
      allowThemeToggle: 'true',
      resumeEnabled: 'false',
      notificationEmail: 'athravpathak07@gmail.com',
    } as Record<string, string>,
  };
}

export type DevStoreType = ReturnType<typeof getInitialDevStore>;

function loadDevStore(): DevStoreType {
  try {
    if (fs.existsSync(DEV_STORE_FILE)) {
      const raw = fs.readFileSync(DEV_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.profile) {
        const profile = { ...parsed.profile };
        if (profile.email === 'athravpathak01@gmail.com') {
          profile.email = 'athravpathak07@gmail.com';
        }
        return {
          ...getInitialDevStore(),
          ...parsed,
          profile,
          certificateCategories:
            Array.isArray(parsed.certificateCategories) && parsed.certificateCategories.length > 0
              ? parsed.certificateCategories
              : [...initialCertificateCategories],
          socialLinks:
            Array.isArray(parsed.socialLinks) && parsed.socialLinks.length > 0
              ? parsed.socialLinks
              : [...initialSocialLinks],
        };
      }
    }
  } catch {
    // ignore
  }
  const initial = getInitialDevStore();
  saveDevStore(initial);
  return initial;
}

function saveDevStore(store: DevStoreType) {
  try {
    ensureDevStorageDir();
    fs.writeFileSync(DEV_STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Global persistence for Next.js hot module reloads
const globalForData = globalThis as unknown as {
  __athravDevStore?: DevStoreType;
};

const devStore = globalForData.__athravDevStore ?? loadDevStore();
globalForData.__athravDevStore = devStore;

function persistDevStore() {
  saveDevStore(devStore);
}

// ============================================================================
// PROFILE SERVICE
// ============================================================================

export async function getProfile(): Promise<ProfileData> {
  if (isDatabaseAvailable()) {
    try {
      let p = await getPrisma().profile.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
      if (!p) {
        try {
          p = await getPrisma().profile.create({
            data: {
              name: initialProfile.name,
              headline: initialProfile.headline,
              bio: initialProfile.bio,
              email: initialProfile.email,
              location: initialProfile.location,
              status: initialProfile.status,
              avatarUrl: initialProfile.avatarUrl,
              githubUrl: initialProfile.githubUrl,
              linkedinUrl: initialProfile.linkedinUrl,
              twitterUrl: initialProfile.twitterUrl,
              websiteUrl: initialProfile.websiteUrl,
              resumeUrl: initialProfile.resumeUrl,
              resumePublished: initialProfile.resumePublished,
            },
          });
        } catch (createErr) {
          console.warn('[DataService] Prisma initial profile seed skipped:', createErr);
        }
      }
      if (p) {
        // Keep in-memory dev store synchronized with database value
        if (p.email && devStore.profile.email !== p.email) {
          devStore.profile.email = p.email;
          const devEmailLink = devStore.socialLinks.find((l) => l.platform === 'email');
          if (devEmailLink) {
            devEmailLink.url = `mailto:${p.email}`;
            devEmailLink.label = p.email;
            devEmailLink.username = p.email;
          }
          devStore.settings.notificationEmail = p.email;
          persistDevStore();
        }

        return {
          id: p.id,
          name: p.name,
          headline: p.headline,
          bio: p.bio,
          email: p.email,
          location: p.location || '',
          status: p.status || '',
          avatarUrl: p.avatarUrl,
          githubUrl: p.githubUrl || 'https://github.com/Athravpathak-git',
          linkedinUrl: p.linkedinUrl,
          twitterUrl: p.twitterUrl,
          websiteUrl: p.websiteUrl,
          resumeUrl: p.resumeUrl,
          resumePublished: p.resumePublished,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma error falling back to dev store:', err);
    }
  }
  return devStore.profile;
}

export async function updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
  const cleanEmail = typeof data.email === 'string' && data.email.trim()
    ? data.email.trim().toLowerCase()
    : undefined;

  const profilePayload = {
    ...data,
    ...(cleanEmail ? { email: cleanEmail } : {}),
  };

  if (isDatabaseAvailable()) {
    try {
      const existing = await getPrisma().profile.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      let updatedRecord;
      if (existing) {
        updatedRecord = await getPrisma().profile.update({
          where: { id: existing.id },
          data: {
            ...profilePayload,
            updatedAt: new Date(),
          },
        });
      } else {
        updatedRecord = await getPrisma().profile.create({
          data: {
            name: data.name || initialProfile.name,
            headline: data.headline || initialProfile.headline,
            bio: data.bio || initialProfile.bio,
            email: cleanEmail || initialProfile.email,
            location: data.location || initialProfile.location,
            status: data.status || initialProfile.status,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : initialProfile.avatarUrl,
            githubUrl: data.githubUrl || initialProfile.githubUrl,
            linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl : initialProfile.linkedinUrl,
            twitterUrl: data.twitterUrl !== undefined ? data.twitterUrl : initialProfile.twitterUrl,
            websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl : initialProfile.websiteUrl,
            resumeUrl: data.resumeUrl !== undefined ? data.resumeUrl : initialProfile.resumeUrl,
            resumePublished: data.resumePublished !== undefined ? data.resumePublished : false,
          },
        });
      }

      // Synchronize with SocialLink (platform: 'email') & WebsiteSetting (key: 'notificationEmail')
      if (cleanEmail) {
        try {
          const emailLink = await getPrisma().socialLink.findFirst({ where: { platform: 'email' } });
          if (emailLink) {
            await getPrisma().socialLink.update({
              where: { id: emailLink.id },
              data: {
                url: `mailto:${cleanEmail}`,
                label: cleanEmail,
                username: cleanEmail,
              },
            });
          } else {
            await getPrisma().socialLink.create({
              data: {
                platform: 'email',
                label: cleanEmail,
                url: `mailto:${cleanEmail}`,
                username: cleanEmail,
                icon: 'Mail',
                isEnabled: true,
                isPublished: true,
                showInHeader: false,
                showInFooter: true,
                showInContact: true,
                showInAbout: true,
                showInHero: true,
                sortOrder: 1,
              },
            });
          }

          await getPrisma().websiteSetting.upsert({
            where: { key: 'notificationEmail' },
            update: { value: cleanEmail },
            create: { key: 'notificationEmail', value: cleanEmail },
          });
        } catch (syncErr) {
          console.warn('[DataService] Email synchronization warning:', syncErr);
        }
      }

      // Also synchronize devStore in memory and disk
      devStore.profile = {
        ...devStore.profile,
        ...profilePayload,
        updatedAt: updatedRecord.updatedAt.toISOString(),
      };
      if (cleanEmail) {
        const devLink = devStore.socialLinks.find((l) => l.platform === 'email');
        if (devLink) {
          devLink.url = `mailto:${cleanEmail}`;
          devLink.label = cleanEmail;
          devLink.username = cleanEmail;
        }
        devStore.settings.notificationEmail = cleanEmail;
      }
      persistDevStore();

      return {
        id: updatedRecord.id,
        name: updatedRecord.name,
        headline: updatedRecord.headline,
        bio: updatedRecord.bio,
        email: updatedRecord.email,
        location: updatedRecord.location || '',
        status: updatedRecord.status || '',
        avatarUrl: updatedRecord.avatarUrl,
        githubUrl: updatedRecord.githubUrl || '',
        linkedinUrl: updatedRecord.linkedinUrl,
        twitterUrl: updatedRecord.twitterUrl,
        websiteUrl: updatedRecord.websiteUrl,
        resumeUrl: updatedRecord.resumeUrl,
        resumePublished: updatedRecord.resumePublished,
        createdAt: updatedRecord.createdAt.toISOString(),
        updatedAt: updatedRecord.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('[DataService] Prisma profile update failed:', err);
      recordDatabaseFailure(err);
      throw new Error('Database operation failed while persisting profile update.');
    }
  }

  // Fallback for local development / mock mode
  devStore.profile = {
    ...devStore.profile,
    ...profilePayload,
    updatedAt: new Date().toISOString(),
  };
  if (cleanEmail) {
    const devLink = devStore.socialLinks.find((l) => l.platform === 'email');
    if (devLink) {
      devLink.url = `mailto:${cleanEmail}`;
      devLink.label = cleanEmail;
      devLink.username = cleanEmail;
    }
    devStore.settings.notificationEmail = cleanEmail;
  }
  persistDevStore();
  return devStore.profile;
}

// ============================================================================
// EDUCATION SERVICE
// ============================================================================

export async function getEducationList(publishedOnly = false): Promise<EducationData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().education.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((i) => ({
        id: i.id,
        institution: i.institution,
        degree: i.degree,
        fieldOfStudy: i.fieldOfStudy || '',
        university: i.university || undefined,
        status: i.status,
        startDate: i.startDate?.toISOString(),
        endDate: i.endDate?.toISOString(),
        grade: i.grade || undefined,
        description: i.description || '',
        sortOrder: i.sortOrder,
        isPublished: i.isPublished,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma education query error:', err);
    }
  }
  const list = publishedOnly
    ? devStore.education.filter((e) => e.isPublished)
    : devStore.education;
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createEducation(data: Omit<EducationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EducationData> {
  const newItem: EducationData = {
    ...data,
    id: `edu-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().education.create({
        data: {
          institution: data.institution,
          degree: data.degree,
          fieldOfStudy: data.fieldOfStudy,
          status: data.status,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          grade: data.grade,
          description: data.description,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create error:', err);
    }
  }
  devStore.education.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateEducation(id: string, data: Partial<EducationData>): Promise<EducationData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().education.update({
        where: { id },
        data: {
          institution: data.institution,
          degree: data.degree,
          fieldOfStudy: data.fieldOfStudy,
          status: data.status,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          grade: data.grade,
          description: data.description,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        id: updated.id,
        institution: updated.institution,
        degree: updated.degree,
        fieldOfStudy: updated.fieldOfStudy || '',
        status: updated.status,
        description: updated.description || '',
        sortOrder: updated.sortOrder,
        isPublished: updated.isPublished,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update education error:', err);
    }
  }
  const idx = devStore.education.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  devStore.education[idx] = {
    ...devStore.education[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.education[idx];
}

export async function deleteEducation(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().education.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete education error:', err);
    }
  }
  const idx = devStore.education.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  devStore.education.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// SKILLS SERVICE
// ============================================================================

export async function getSkillsList(publishedOnly = false): Promise<SkillData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().skill.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency || undefined,
        icon: s.icon || undefined,
        description: s.description || undefined,
        isFeatured: s.isFeatured,
        sortOrder: s.sortOrder,
        isPublished: s.isPublished,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma skills query error:', err);
    }
  }
  const list = publishedOnly
    ? devStore.skills.filter((s) => s.isPublished)
    : devStore.skills;
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createSkill(data: Omit<SkillData, 'id' | 'createdAt' | 'updatedAt'>): Promise<SkillData> {
  const newItem: SkillData = {
    ...data,
    id: `skill-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().skill.create({
        data: {
          name: data.name,
          category: data.category,
          proficiency: data.proficiency,
          icon: data.icon,
          description: data.description,
          isFeatured: data.isFeatured,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create skill error:', err);
    }
  }
  devStore.skills.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateSkill(id: string, data: Partial<SkillData>): Promise<SkillData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().skill.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category,
          proficiency: data.proficiency,
          icon: data.icon,
          description: data.description,
          isFeatured: data.isFeatured,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        category: updated.category,
        proficiency: updated.proficiency || undefined,
        icon: updated.icon || undefined,
        description: updated.description || undefined,
        isFeatured: updated.isFeatured,
        sortOrder: updated.sortOrder,
        isPublished: updated.isPublished,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update skill error:', err);
    }
  }
  const idx = devStore.skills.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  devStore.skills[idx] = {
    ...devStore.skills[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.skills[idx];
}

export async function deleteSkill(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().skill.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete skill error:', err);
    }
  }
  const idx = devStore.skills.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  devStore.skills.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// PROJECTS SERVICE
// ============================================================================

export async function getProjectsList(options?: {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
}): Promise<ProjectData[]> {
  const publishedOnly = options?.publishedOnly ?? false;
  const featuredOnly = options?.featuredOnly ?? false;

  if (isDatabaseAvailable()) {
    try {
      const whereClause: { isPublished?: boolean; isFeatured?: boolean } = {};
      if (publishedOnly) whereClause.isPublished = true;
      if (featuredOnly) whereClause.isFeatured = true;

      const items = await getPrisma().project.findMany({
        where: whereClause,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle || undefined,
        summary: p.summary,
        description: p.description,
        category: p.category,
        isFeatured: p.isFeatured,
        techStack: p.techStack,
        liveUrl: p.liveUrl,
        repoUrl: p.repoUrl,
        imageUrl: p.imageUrl,
        screenshots: p.screenshots,
        architectureSummary: p.architectureSummary || undefined,
        challenges: p.challenges || undefined,
        solutions: p.solutions || undefined,
        results: p.results || undefined,
        futureImprovements: p.futureImprovements || undefined,
        sortOrder: p.sortOrder,
        isPublished: p.isPublished,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma projects query error:', err);
    }
  }

  let list = [...devStore.projects];
  if (publishedOnly) list = list.filter((p) => p.isPublished);
  if (featuredOnly) list = list.filter((p) => p.isFeatured);
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProjectBySlug(slug: string, publishedOnly = false): Promise<ProjectData | null> {
  if (isDatabaseAvailable()) {
    try {
      const p = await getPrisma().project.findUnique({ where: { slug } });
      if (p) {
        if (publishedOnly && !p.isPublished) return null;
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle || undefined,
          summary: p.summary,
          description: p.description,
          category: p.category,
          isFeatured: p.isFeatured,
          techStack: p.techStack,
          liveUrl: p.liveUrl,
          repoUrl: p.repoUrl,
          imageUrl: p.imageUrl,
          screenshots: p.screenshots,
          architectureSummary: p.architectureSummary || undefined,
          challenges: p.challenges || undefined,
          solutions: p.solutions || undefined,
          results: p.results || undefined,
          futureImprovements: p.futureImprovements || undefined,
          sortOrder: p.sortOrder,
          isPublished: p.isPublished,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma project slug query error:', err);
    }
  }

  const found = devStore.projects.find((p) => p.slug === slug);
  if (!found) return null;
  if (publishedOnly && !found.isPublished) return null;
  return found;
}

export async function createProject(data: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectData> {
  const newItem: ProjectData = {
    ...data,
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().project.create({
        data: {
          slug: data.slug,
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          description: data.description,
          category: data.category,
          isFeatured: data.isFeatured,
          techStack: data.techStack,
          liveUrl: data.liveUrl,
          repoUrl: data.repoUrl,
          imageUrl: data.imageUrl,
          screenshots: data.screenshots,
          architectureSummary: data.architectureSummary,
          challenges: data.challenges,
          solutions: data.solutions,
          results: data.results,
          futureImprovements: data.futureImprovements,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create project error:', err);
    }
  }
  devStore.projects.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().project.update({
        where: { id },
        data: {
          slug: data.slug,
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          description: data.description,
          category: data.category,
          isFeatured: data.isFeatured,
          techStack: data.techStack,
          liveUrl: data.liveUrl,
          repoUrl: data.repoUrl,
          imageUrl: data.imageUrl,
          screenshots: data.screenshots,
          architectureSummary: data.architectureSummary,
          challenges: data.challenges,
          solutions: data.solutions,
          results: data.results,
          futureImprovements: data.futureImprovements,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        subtitle: updated.subtitle || undefined,
        summary: updated.summary,
        description: updated.description,
        category: updated.category,
        isFeatured: updated.isFeatured,
        techStack: updated.techStack,
        liveUrl: updated.liveUrl,
        repoUrl: updated.repoUrl,
        imageUrl: updated.imageUrl,
        screenshots: updated.screenshots,
        architectureSummary: updated.architectureSummary || undefined,
        challenges: updated.challenges || undefined,
        solutions: updated.solutions || undefined,
        results: updated.results || undefined,
        futureImprovements: updated.futureImprovements || undefined,
        sortOrder: updated.sortOrder,
        isPublished: updated.isPublished,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update project error:', err);
    }
  }
  const idx = devStore.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  devStore.projects[idx] = {
    ...devStore.projects[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.projects[idx];
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().project.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete project error:', err);
    }
  }
  const idx = devStore.projects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  devStore.projects.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// CERTIFICATIONS SERVICE
// ============================================================================

export async function getCertificationsList(options?: {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
}): Promise<CertificationData[]> {
  const publishedOnly = options?.publishedOnly ?? false;
  const featuredOnly = options?.featuredOnly ?? false;

  if (isDatabaseAvailable()) {
    try {
      const whereClause: { isPublished?: boolean; isFeatured?: boolean } = {};
      if (publishedOnly) whereClause.isPublished = true;
      if (featuredOnly) whereClause.isFeatured = true;

      const items = await getPrisma().certification.findMany({
        where: whereClause,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        issuer: c.issuer,
        category: c.category,
        issueDate: c.issueDate?.toISOString() || null,
        expiryDate: c.expiryDate?.toISOString() || null,
        credentialId: c.credentialId,
        credentialUrl: c.credentialUrl,
        imageUrl: c.imageUrl,
        pdfUrl: c.pdfUrl,
        description: c.description || undefined,
        relatedSkills: c.relatedSkills,
        isFeatured: c.isFeatured,
        isPublished: c.isPublished,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma certifications query error:', err);
    }
  }

  let list = [...devStore.certifications];
  if (publishedOnly) list = list.filter((c) => c.isPublished);
  if (featuredOnly) list = list.filter((c) => c.isFeatured);
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCertificationBySlug(slug: string, publishedOnly = false): Promise<CertificationData | null> {
  if (isDatabaseAvailable()) {
    try {
      const c = await getPrisma().certification.findUnique({ where: { slug } });
      if (c) {
        if (publishedOnly && !c.isPublished) return null;
        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          issuer: c.issuer,
          category: c.category,
          issueDate: c.issueDate?.toISOString() || null,
          expiryDate: c.expiryDate?.toISOString() || null,
          credentialId: c.credentialId,
          credentialUrl: c.credentialUrl,
          imageUrl: c.imageUrl,
          pdfUrl: c.pdfUrl,
          description: c.description || undefined,
          relatedSkills: c.relatedSkills,
          isFeatured: c.isFeatured,
          isPublished: c.isPublished,
          sortOrder: c.sortOrder,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma cert slug error:', err);
    }
  }

  const found = devStore.certifications.find((c) => c.slug === slug);
  if (!found) return null;
  if (publishedOnly && !found.isPublished) return null;
  return found;
}

export async function getCertificationById(id: string): Promise<CertificationData | null> {
  if (isDatabaseAvailable()) {
    try {
      const c = await getPrisma().certification.findUnique({ where: { id } });
      if (c) {
        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          issuer: c.issuer,
          category: c.category,
          issueDate: c.issueDate?.toISOString() || null,
          expiryDate: c.expiryDate?.toISOString() || null,
          credentialId: c.credentialId,
          credentialUrl: c.credentialUrl,
          imageUrl: c.imageUrl,
          pdfUrl: c.pdfUrl,
          description: c.description || undefined,
          relatedSkills: c.relatedSkills,
          isFeatured: c.isFeatured,
          isPublished: c.isPublished,
          sortOrder: c.sortOrder,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma cert id error:', err);
    }
  }

  const found = devStore.certifications.find((c) => c.id === id);
  return found || null;
}

export async function createCertification(
  data: Omit<CertificationData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CertificationData> {
  const newItem: CertificationData = {
    ...data,
    id: `cert-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().certification.create({
        data: {
          slug: data.slug,
          title: data.title,
          issuer: data.issuer,
          category: data.category,
          issueDate: data.issueDate ? new Date(data.issueDate) : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          credentialId: data.credentialId,
          credentialUrl: data.credentialUrl,
          imageUrl: data.imageUrl,
          pdfUrl: data.pdfUrl,
          description: data.description,
          relatedSkills: data.relatedSkills,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
          sortOrder: data.sortOrder,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create cert error:', err);
    }
  }
  devStore.certifications.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateCertification(
  id: string,
  data: Partial<CertificationData>
): Promise<CertificationData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().certification.update({
        where: { id },
        data: {
          slug: data.slug,
          title: data.title,
          issuer: data.issuer,
          category: data.category,
          issueDate: data.issueDate ? new Date(data.issueDate) : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          credentialId: data.credentialId,
          credentialUrl: data.credentialUrl,
          imageUrl: data.imageUrl,
          pdfUrl: data.pdfUrl,
          description: data.description,
          relatedSkills: data.relatedSkills,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
          sortOrder: data.sortOrder,
        },
      });
      return {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        issuer: updated.issuer,
        category: updated.category,
        issueDate: updated.issueDate?.toISOString() || null,
        expiryDate: updated.expiryDate?.toISOString() || null,
        credentialId: updated.credentialId,
        credentialUrl: updated.credentialUrl,
        imageUrl: updated.imageUrl,
        pdfUrl: updated.pdfUrl,
        description: updated.description || undefined,
        relatedSkills: updated.relatedSkills,
        isFeatured: updated.isFeatured,
        isPublished: updated.isPublished,
        sortOrder: updated.sortOrder,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update cert error:', err);
    }
  }
  const idx = devStore.certifications.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  devStore.certifications[idx] = {
    ...devStore.certifications[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.certifications[idx];
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().certification.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete cert error:', err);
    }
  }
  const idx = devStore.certifications.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  devStore.certifications.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// CERTIFICATE CATEGORIES SERVICE
// ============================================================================

function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
}

export async function getCertificateCategoriesList(): Promise<CertificateCategoryData[]> {
  if (isDatabaseAvailable()) {
    try {
      let categories = await getPrisma().certificateCategory.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      // Auto-seed initial default categories if the table is empty
      if (categories.length === 0) {
        try {
          await getPrisma().certificateCategory.createMany({
            data: initialCertificateCategories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              sortOrder: c.sortOrder,
            })),
            skipDuplicates: true,
          });
          categories = await getPrisma().certificateCategory.findMany({
            orderBy: { sortOrder: 'asc' },
          });
        } catch (seedErr) {
          console.warn('[DataService] Auto-seed certificate categories skipped:', seedErr);
        }
      }

      if (categories.length > 0) {
        return categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          sortOrder: c.sortOrder,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn('[DataService] Prisma getCertificateCategories error:', err);
    }
  }

  return [...devStore.certificateCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCertificateCategoryUsageCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  if (isDatabaseAvailable()) {
    try {
      const certs = await getPrisma().certification.findMany({
        select: { category: true },
      });
      for (const cert of certs) {
        const cat = cert.category || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
      }
      return counts;
    } catch (err) {
      console.warn('[DataService] Prisma cert category counts error:', err);
    }
  }

  for (const cert of devStore.certifications) {
    const cat = cert.category || 'Uncategorized';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

export async function createCertificateCategory(data: {
  name: string;
  sortOrder?: number;
}): Promise<CertificateCategoryData> {
  const trimmedName = data.name ? data.name.trim() : '';
  if (!trimmedName) {
    throw new Error('Category name cannot be empty.');
  }

  const slug = generateCategorySlug(trimmedName);

  if (isDatabaseAvailable()) {
    try {
      const existing = await getPrisma().certificateCategory.findFirst({
        where: {
          OR: [
            { name: { equals: trimmedName, mode: 'insensitive' } },
            { slug: { equals: slug, mode: 'insensitive' } },
          ],
        },
      });

      if (existing) {
        throw new Error(`A category with name "${trimmedName}" already exists.`);
      }

      const count = await getPrisma().certificateCategory.count();
      const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : count + 1;

      const created = await getPrisma().certificateCategory.create({
        data: {
          name: trimmedName,
          slug,
          sortOrder,
        },
      });

      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        sortOrder: created.sortOrder,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err: any) {
      if (err.message?.includes('already exists')) throw err;
      console.warn('[DataService] Prisma createCertificateCategory error:', err);
    }
  }

  // DevStore fallback
  const existingDev = devStore.certificateCategories.find(
    (c) => c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug.toLowerCase() === slug.toLowerCase()
  );
  if (existingDev) {
    throw new Error(`A category with name "${trimmedName}" already exists.`);
  }

  const sortOrder =
    typeof data.sortOrder === 'number' ? data.sortOrder : devStore.certificateCategories.length + 1;

  const newItem: CertificateCategoryData = {
    id: `cat-${Date.now()}`,
    name: trimmedName,
    slug,
    sortOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  devStore.certificateCategories.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateCertificateCategory(
  id: string,
  data: { name?: string; sortOrder?: number }
): Promise<CertificateCategoryData> {
  const trimmedName = data.name !== undefined ? data.name.trim() : undefined;
  if (trimmedName !== undefined && !trimmedName) {
    throw new Error('Category name cannot be empty.');
  }

  const slug = trimmedName ? generateCategorySlug(trimmedName) : undefined;

  if (isDatabaseAvailable()) {
    try {
      const current = await getPrisma().certificateCategory.findUnique({ where: { id } });
      if (!current) {
        throw new Error('Category not found.');
      }

      if (trimmedName && trimmedName.toLowerCase() !== current.name.toLowerCase()) {
        const existing = await getPrisma().certificateCategory.findFirst({
          where: {
            id: { not: id },
            OR: [
              { name: { equals: trimmedName, mode: 'insensitive' } },
              { slug: { equals: slug, mode: 'insensitive' } },
            ],
          },
        });
        if (existing) {
          throw new Error(`A category with name "${trimmedName}" already exists.`);
        }
      }

      const updated = await getPrisma().certificateCategory.update({
        where: { id },
        data: {
          name: trimmedName !== undefined ? trimmedName : undefined,
          slug: slug !== undefined ? slug : undefined,
          sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
        },
      });

      // If category name was renamed, cascade update to all certifications referencing old name
      if (trimmedName && current.name !== trimmedName) {
        try {
          await getPrisma().certification.updateMany({
            where: { category: current.name },
            data: { category: trimmedName },
          });
        } catch (cascadeErr) {
          console.warn('[DataService] Cascade category rename error:', cascadeErr);
        }
      }

      return {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        sortOrder: updated.sortOrder,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err: any) {
      if (err.message?.includes('already exists') || err.message?.includes('not found')) throw err;
      console.warn('[DataService] Prisma updateCertificateCategory error:', err);
    }
  }

  // DevStore fallback
  const idx = devStore.certificateCategories.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error('Category not found.');
  }

  const current = devStore.certificateCategories[idx];
  if (trimmedName && trimmedName.toLowerCase() !== current.name.toLowerCase()) {
    const existing = devStore.certificateCategories.find(
      (c) =>
        c.id !== id &&
        (c.name.toLowerCase() === trimmedName.toLowerCase() ||
          (slug && c.slug.toLowerCase() === slug.toLowerCase()))
    );
    if (existing) {
      throw new Error(`A category with name "${trimmedName}" already exists.`);
    }
  }

  const updatedCat: CertificateCategoryData = {
    ...current,
    name: trimmedName !== undefined ? trimmedName : current.name,
    slug: slug !== undefined ? slug : current.slug,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : current.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  if (trimmedName && current.name !== trimmedName) {
    for (const cert of devStore.certifications) {
      if (cert.category === current.name) {
        cert.category = trimmedName;
        cert.updatedAt = new Date().toISOString();
      }
    }
  }

  devStore.certificateCategories[idx] = updatedCat;
  persistDevStore();
  return updatedCat;
}

export async function deleteCertificateCategory(
  id: string,
  reassignToId?: string
): Promise<{ success: boolean; reassignedCount: number }> {
  if (isDatabaseAvailable()) {
    try {
      const categoryToDelete = await getPrisma().certificateCategory.findUnique({ where: { id } });
      if (!categoryToDelete) {
        throw new Error('Category not found.');
      }

      const assignedCertCount = await getPrisma().certification.count({
        where: { category: categoryToDelete.name },
      });

      let reassignedCount = 0;

      if (assignedCertCount > 0) {
        if (!reassignToId) {
          throw new Error(
            `Cannot delete category "${categoryToDelete.name}" because it is currently assigned to ${assignedCertCount} certificate(s). Please choose another category to reassign them to before deleting.`
          );
        }

        if (reassignToId === id) {
          throw new Error('Cannot reassign certificates to the category being deleted.');
        }

        const targetCategory = await getPrisma().certificateCategory.findUnique({
          where: { id: reassignToId },
        });

        if (!targetCategory) {
          throw new Error('The target category for reassignment was not found.');
        }

        const updateResult = await getPrisma().certification.updateMany({
          where: { category: categoryToDelete.name },
          data: { category: targetCategory.name },
        });
        reassignedCount = updateResult.count;
      }

      await getPrisma().certificateCategory.delete({ where: { id } });
      return { success: true, reassignedCount };
    } catch (err: any) {
      if (err.message?.includes('Cannot delete') || err.message?.includes('not found') || err.message?.includes('Cannot reassign')) {
        throw err;
      }
      console.warn('[DataService] Prisma deleteCertificateCategory error:', err);
    }
  }

  // DevStore fallback
  const idx = devStore.certificateCategories.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error('Category not found.');
  }

  const categoryToDelete = devStore.certificateCategories[idx];
  const assignedCerts = devStore.certifications.filter((c) => c.category === categoryToDelete.name);
  let reassignedCount = 0;

  if (assignedCerts.length > 0) {
    if (!reassignToId) {
      throw new Error(
        `Cannot delete category "${categoryToDelete.name}" because it is currently assigned to ${assignedCerts.length} certificate(s). Please choose another category to reassign them to before deleting.`
      );
    }

    if (reassignToId === id) {
      throw new Error('Cannot reassign certificates to the category being deleted.');
    }

    const targetCategory = devStore.certificateCategories.find((c) => c.id === reassignToId);
    if (!targetCategory) {
      throw new Error('The target category for reassignment was not found.');
    }

    for (const cert of assignedCerts) {
      cert.category = targetCategory.name;
      cert.updatedAt = new Date().toISOString();
      reassignedCount++;
    }
  }

  devStore.certificateCategories.splice(idx, 1);
  persistDevStore();
  return { success: true, reassignedCount };
}

// ============================================================================
// EXPERIENCE SERVICE
// ============================================================================

export async function getExperienceList(publishedOnly = false): Promise<ExperienceData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().experience.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((e) => ({
        id: e.id,
        slug: e.slug,
        role: e.role,
        company: e.company,
        employmentType: e.employmentType || 'Internship',
        workplaceType: e.workplaceType || 'Remote',
        location: e.location || 'India',
        startDate: e.startDate?.toISOString(),
        endDate: e.endDate?.toISOString(),
        isCurrent: e.isCurrent,
        description: e.description,
        responsibilities: e.responsibilities,
        technologies: e.technologies,
        certificateUrl: e.certificateUrl,
        companyUrl: e.companyUrl,
        sortOrder: e.sortOrder,
        isPublished: e.isPublished,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma experience query error:', err);
    }
  }
  const list = publishedOnly
    ? devStore.experience.filter((e) => e.isPublished)
    : devStore.experience;
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getExperienceBySlug(slug: string, publishedOnly = false): Promise<ExperienceData | null> {
  if (isDatabaseAvailable()) {
    try {
      const e = await getPrisma().experience.findUnique({ where: { slug } });
      if (e) {
        if (publishedOnly && !e.isPublished) return null;
        return {
          id: e.id,
          slug: e.slug,
          role: e.role,
          company: e.company,
          employmentType: e.employmentType || 'Internship',
          workplaceType: e.workplaceType || 'Remote',
          location: e.location || 'India',
          startDate: e.startDate?.toISOString(),
          endDate: e.endDate?.toISOString(),
          isCurrent: e.isCurrent,
          description: e.description,
          responsibilities: e.responsibilities,
          technologies: e.technologies,
          certificateUrl: e.certificateUrl,
          companyUrl: e.companyUrl,
          sortOrder: e.sortOrder,
          isPublished: e.isPublished,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma experience slug query error:', err);
    }
  }
  const found = devStore.experience.find((e) => e.slug === slug);
  if (!found) return null;
  if (publishedOnly && !found.isPublished) return null;
  return found;
}

export async function createExperience(
  data: Omit<ExperienceData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExperienceData> {
  const newItem: ExperienceData = {
    ...data,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().experience.create({
        data: {
          slug: data.slug,
          role: data.role,
          company: data.company,
          employmentType: data.employmentType,
          workplaceType: data.workplaceType,
          location: data.location,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          isCurrent: data.isCurrent,
          description: data.description,
          responsibilities: data.responsibilities,
          technologies: data.technologies,
          certificateUrl: data.certificateUrl,
          companyUrl: data.companyUrl,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create experience error:', err);
    }
  }
  devStore.experience.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateExperience(
  id: string,
  data: Partial<ExperienceData>
): Promise<ExperienceData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().experience.update({
        where: { id },
        data: {
          slug: data.slug,
          role: data.role,
          company: data.company,
          employmentType: data.employmentType,
          workplaceType: data.workplaceType,
          location: data.location,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          isCurrent: data.isCurrent,
          description: data.description,
          responsibilities: data.responsibilities,
          technologies: data.technologies,
          certificateUrl: data.certificateUrl,
          companyUrl: data.companyUrl,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        id: updated.id,
        slug: updated.slug,
        role: updated.role,
        company: updated.company,
        employmentType: updated.employmentType || '',
        workplaceType: updated.workplaceType || '',
        location: updated.location || '',
        startDate: updated.startDate?.toISOString(),
        endDate: updated.endDate?.toISOString(),
        isCurrent: updated.isCurrent,
        description: updated.description,
        responsibilities: updated.responsibilities,
        technologies: updated.technologies,
        certificateUrl: updated.certificateUrl,
        companyUrl: updated.companyUrl,
        sortOrder: updated.sortOrder,
        isPublished: updated.isPublished,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update experience error:', err);
    }
  }
  const idx = devStore.experience.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  devStore.experience[idx] = {
    ...devStore.experience[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.experience[idx];
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().experience.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete experience error:', err);
    }
  }
  const idx = devStore.experience.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  devStore.experience.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// ACHIEVEMENTS SERVICE
// ============================================================================

export async function getAchievementsList(publishedOnly = false): Promise<AchievementData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().achievement.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        issuer: a.issuer || undefined,
        date: a.date?.toISOString(),
        description: a.description || '',
        badgeUrl: a.badgeUrl,
        sortOrder: a.sortOrder,
        isPublished: a.isPublished,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma achievements error:', err);
    }
  }
  const list = publishedOnly
    ? devStore.achievements.filter((a) => a.isPublished)
    : devStore.achievements;
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createAchievement(
  data: Omit<AchievementData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AchievementData> {
  const newItem: AchievementData = {
    ...data,
    id: `ach-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().achievement.create({
        data: {
          title: data.title,
          category: data.category,
          issuer: data.issuer,
          date: data.date ? new Date(data.date) : null,
          description: data.description,
          badgeUrl: data.badgeUrl,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create achievement error:', err);
    }
  }
  devStore.achievements.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateAchievement(
  id: string,
  data: Partial<AchievementData>
): Promise<AchievementData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().achievement.update({
        where: { id },
        data: {
          title: data.title,
          category: data.category,
          issuer: data.issuer,
          date: data.date ? new Date(data.date) : null,
          description: data.description,
          badgeUrl: data.badgeUrl,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        issuer: updated.issuer || undefined,
        date: updated.date?.toISOString(),
        description: updated.description || '',
        badgeUrl: updated.badgeUrl,
        sortOrder: updated.sortOrder,
        isPublished: updated.isPublished,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update achievement error:', err);
    }
  }
  const idx = devStore.achievements.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  devStore.achievements[idx] = {
    ...devStore.achievements[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.achievements[idx];
}

export async function deleteAchievement(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().achievement.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete achievement error:', err);
    }
  }
  const idx = devStore.achievements.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  devStore.achievements.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// SERVICES SERVICE
// ============================================================================

export async function getServicesList(publishedOnly = false): Promise<ServiceData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().service.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        orderBy: { sortOrder: 'asc' },
      });
      return items.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        icon: s.icon || undefined,
        techStack: s.techStack,
        sortOrder: s.sortOrder,
        isPublished: s.isPublished,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma services query error:', err);
    }
  }
  const list = publishedOnly
    ? devStore.services.filter((s) => s.isPublished)
    : devStore.services;
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createService(
  data: Omit<ServiceData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceData> {
  const newItem: ServiceData = {
    ...data,
    id: `srv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().service.create({
        data: {
          title: data.title,
          description: data.description,
          icon: data.icon,
          techStack: data.techStack,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        ...newItem,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create service error:', err);
    }
  }
  devStore.services.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateService(id: string, data: Partial<ServiceData>): Promise<ServiceData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().service.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          icon: data.icon,
          techStack: data.techStack,
          sortOrder: data.sortOrder,
          isPublished: data.isPublished,
        },
      });
      return {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        icon: updated.icon || undefined,
        techStack: updated.techStack,
        sortOrder: updated.sortOrder,
        isPublished: updated.isPublished,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update service error:', err);
    }
  }
  const idx = devStore.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  devStore.services[idx] = {
    ...devStore.services[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  persistDevStore();
  return devStore.services[idx];
}

export async function deleteService(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().service.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete service error:', err);
    }
  }
  const idx = devStore.services.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  devStore.services.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// HOMEPAGE SECTIONS SERVICE
// ============================================================================

export async function getHomepageSections(): Promise<HomepageSectionData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().homepageSection.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      if (items.length > 0) {
        return items.map((sec) => ({
          id: sec.id,
          sectionKey: sec.sectionKey,
          title: sec.title,
          subtitle: sec.subtitle || undefined,
          description: sec.description || undefined,
          isEnabled: sec.isEnabled,
          sortOrder: sec.sortOrder,
        }));
      }
    } catch (err) {
      console.warn('[DataService] Prisma homepage sections error:', err);
    }
  }
  return [...devStore.homepageSections].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updateHomepageSection(
  sectionKey: string,
  data: Partial<HomepageSectionData>
): Promise<HomepageSectionData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().homepageSection.upsert({
        where: { sectionKey },
        update: {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          isEnabled: data.isEnabled,
          sortOrder: data.sortOrder,
        },
        create: {
          sectionKey,
          title: data.title || sectionKey,
          subtitle: data.subtitle,
          description: data.description,
          isEnabled: data.isEnabled ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });
      return {
        id: updated.id,
        sectionKey: updated.sectionKey,
        title: updated.title,
        subtitle: updated.subtitle || undefined,
        description: updated.description || undefined,
        isEnabled: updated.isEnabled,
        sortOrder: updated.sortOrder,
      };
    } catch (err) {
      console.warn('[DataService] Prisma update section error:', err);
    }
  }
  const idx = devStore.homepageSections.findIndex((s) => s.sectionKey === sectionKey);
  if (idx === -1) return null;
  devStore.homepageSections[idx] = {
    ...devStore.homepageSections[idx],
    ...data,
  };
  persistDevStore();
  return devStore.homepageSections[idx];
}

// ============================================================================
// CONTACT MESSAGES SERVICE
// ============================================================================

export async function getContactMessages(): Promise<ContactMessageData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return items.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        isRead: m.isRead,
        isResolved: m.isResolved,
        isArchived: m.isArchived,
        ipAddress: m.ipAddress || undefined,
        createdAt: m.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma contact messages query error:', err);
    }
  }
  return [...devStore.contactMessages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createContactMessage(
  data: Omit<ContactMessageData, 'id' | 'isRead' | 'isResolved' | 'isArchived' | 'createdAt'>
): Promise<ContactMessageData> {
  const newItem: ContactMessageData = {
    ...data,
    id: `msg-${Date.now()}`,
    isRead: false,
    isResolved: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          ipAddress: data.ipAddress,
        },
      });
      return {
        id: created.id,
        name: created.name,
        email: created.email,
        subject: created.subject,
        message: created.message,
        isRead: created.isRead,
        isResolved: created.isResolved,
        isArchived: created.isArchived,
        ipAddress: created.ipAddress || undefined,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma create contact message error:', err);
    }
  }
  devStore.contactMessages.unshift(newItem);
  persistDevStore();
  return newItem;
}

export async function updateContactMessageStatus(
  id: string,
  status: { isRead?: boolean; isResolved?: boolean; isArchived?: boolean }
): Promise<ContactMessageData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().contactMessage.update({
        where: { id },
        data: status,
      });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        subject: updated.subject,
        message: updated.message,
        isRead: updated.isRead,
        isResolved: updated.isResolved,
        isArchived: updated.isArchived,
        ipAddress: updated.ipAddress || undefined,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma update msg error:', err);
    }
  }
  const idx = devStore.contactMessages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  devStore.contactMessages[idx] = {
    ...devStore.contactMessages[idx],
    ...status,
  };
  persistDevStore();
  return devStore.contactMessages[idx];
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().contactMessage.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma delete message error:', err);
    }
  }
  const idx = devStore.contactMessages.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  devStore.contactMessages.splice(idx, 1);
  persistDevStore();
  return true;
}

// ============================================================================
// MEDIA & SETTINGS SERVICE
// ============================================================================

export async function getMediaList() {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().mediaItem.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return items.map((m) => ({
        id: m.id,
        filename: m.filename,
        originalName: m.originalName,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        url: m.url,
        storageProvider: m.storageProvider,
        altText: m.altText || undefined,
        category: m.category,
        createdAt: m.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma media query error:', err);
    }
  }
  return devStore.mediaItems;
}

export async function createMediaRecord(data: {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  storageProvider?: string;
  altText?: string;
  description?: string;
  category?: string;
}) {
  const item = {
    id: `media-${Date.now()}`,
    filename: data.filename,
    originalName: data.originalName,
    mimeType: data.mimeType,
    sizeBytes: data.sizeBytes,
    url: data.url,
    storageProvider: data.storageProvider || 'local',
    altText: data.altText,
    description: data.description,
    category: data.category || 'general',
    createdAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().mediaItem.create({
        data: {
          filename: item.filename,
          originalName: item.originalName,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          url: item.url,
          storageProvider: item.storageProvider,
          altText: item.altText,
          category: item.category,
        },
      });
      return {
        ...item,
        id: created.id,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma media create error:', err);
    }
  }
  devStore.mediaItems.unshift(item);
  persistDevStore();
  return item;
}

export async function getMediaItemById(id: string) {
  if (isDatabaseAvailable()) {
    try {
      const item = await getPrisma().mediaItem.findUnique({ where: { id } });
      if (item) {
        return {
          id: item.id,
          filename: item.filename,
          originalName: item.originalName,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          url: item.url,
          storageProvider: item.storageProvider,
          altText: item.altText || undefined,
          category: item.category,
          createdAt: item.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma getMediaItemById error:', err);
    }
  }
  return devStore.mediaItems.find((m) => m.id === id) || null;
}

export async function updateMediaRecord(
  id: string,
  updates: {
    originalName?: string;
    altText?: string;
    description?: string;
    category?: string;
    url?: string;
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
  }
) {
  if (isDatabaseAvailable()) {
    try {
      const dataToUpdate: any = {};
      if (updates.originalName !== undefined) dataToUpdate.originalName = updates.originalName;
      if (updates.altText !== undefined) dataToUpdate.altText = updates.altText;
      if (updates.category !== undefined) dataToUpdate.category = updates.category;
      if (updates.url !== undefined) dataToUpdate.url = updates.url;
      if (updates.filename !== undefined) dataToUpdate.filename = updates.filename;
      if (updates.mimeType !== undefined) dataToUpdate.mimeType = updates.mimeType;
      if (updates.sizeBytes !== undefined) dataToUpdate.sizeBytes = updates.sizeBytes;

      const updated = await getPrisma().mediaItem.update({
        where: { id },
        data: dataToUpdate,
      });
      return {
        id: updated.id,
        filename: updated.filename,
        originalName: updated.originalName,
        mimeType: updated.mimeType,
        sizeBytes: updated.sizeBytes,
        url: updated.url,
        storageProvider: updated.storageProvider,
        altText: updated.altText || undefined,
        category: updated.category,
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('[DataService] Prisma updateMediaRecord error:', err);
    }
  }

  const idx = devStore.mediaItems.findIndex((m) => m.id === id);
  if (idx === -1) {
    throw new Error('Media asset not found.');
  }

  const current = devStore.mediaItems[idx];
  const updated = {
    ...current,
    originalName: updates.originalName !== undefined ? updates.originalName : current.originalName,
    altText: updates.altText !== undefined ? updates.altText : current.altText,
    description: updates.description !== undefined ? updates.description : current.description,
    category: updates.category !== undefined ? updates.category : current.category,
    url: updates.url !== undefined ? updates.url : current.url,
    filename: updates.filename !== undefined ? updates.filename : current.filename,
    mimeType: updates.mimeType !== undefined ? updates.mimeType : current.mimeType,
    sizeBytes: updates.sizeBytes !== undefined ? updates.sizeBytes : current.sizeBytes,
  };

  devStore.mediaItems[idx] = updated;
  persistDevStore();
  return updated;
}

export async function deleteMediaRecord(id: string) {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().mediaItem.delete({ where: { id } });
    } catch (err) {
      console.warn('[DataService] Prisma deleteMediaRecord error:', err);
    }
  }

  const idx = devStore.mediaItems.findIndex((m) => m.id === id);
  if (idx !== -1) {
    const deleted = devStore.mediaItems.splice(idx, 1)[0];
    persistDevStore();
    return { success: true, item: deleted };
  }
  return { success: true };
}

export interface MediaReference {
  type: 'profile' | 'project' | 'certification';
  title: string;
  location: string;
}

export function checkMediaReferences(urlOrFilename: string): MediaReference[] {
  if (!urlOrFilename) return [];

  const clean = urlOrFilename.split('?')[0];
  const filename = clean.split('/').pop() || clean;
  const references: MediaReference[] = [];

  // Check Profile
  const avatar = devStore.profile.avatarUrl;
  if (avatar && (avatar === clean || avatar.includes(filename))) {
    references.push({
      type: 'profile',
      title: devStore.profile.name || 'Author Profile',
      location: 'Primary Profile Photo / Avatar',
    });
  }

  // Check Projects
  for (const proj of devStore.projects) {
    if (proj.imageUrl && (proj.imageUrl === clean || proj.imageUrl.includes(filename))) {
      references.push({
        type: 'project',
        title: proj.title,
        location: 'Project Featured Image',
      });
    }
    if (Array.isArray(proj.screenshots)) {
      for (const img of proj.screenshots) {
        if (img === clean || img.includes(filename)) {
          references.push({
            type: 'project',
            title: proj.title,
            location: 'Project Screenshot Gallery',
          });
          break;
        }
      }
    }
  }

  // Check Certifications
  for (const cert of devStore.certifications) {
    if (cert.imageUrl && (cert.imageUrl === clean || cert.imageUrl.includes(filename))) {
      references.push({
        type: 'certification',
        title: cert.title,
        location: 'Certificate Badge Image',
      });
    }
    if (cert.pdfUrl && (cert.pdfUrl === clean || cert.pdfUrl.includes(filename))) {
      references.push({
        type: 'certification',
        title: cert.title,
        location: 'Certificate PDF Document',
      });
    }
    if (cert.credentialUrl && (cert.credentialUrl === clean || cert.credentialUrl.includes(filename))) {
      references.push({
        type: 'certification',
        title: cert.title,
        location: 'Credential Verification URL',
      });
    }
  }

  return references;
}

export async function getSettings(): Promise<Record<string, string>> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().websiteSetting.findMany();
      if (items.length > 0) {
        const result: Record<string, string> = { ...devStore.settings };
        for (const item of items) {
          result[item.key] = item.value;
        }
        return result;
      }
    } catch (err) {
      console.warn('[DataService] Prisma settings error:', err);
    }
  }
  return devStore.settings;
}

export async function updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
  if (isDatabaseAvailable()) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await getPrisma().websiteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
      if (settings.notificationEmail) {
        const cleanEmail = settings.notificationEmail.trim().toLowerCase();
        await updateProfile({ email: cleanEmail }).catch(() => {});
      }
    } catch (err) {
      console.error('[DataService] Prisma update settings error:', err);
      recordDatabaseFailure(err);
      throw new Error('Database operation failed while saving settings.');
    }
  }
  devStore.settings = { ...devStore.settings, ...settings };
  if (settings.notificationEmail) {
    const cleanEmail = settings.notificationEmail.trim().toLowerCase();
    devStore.profile.email = cleanEmail;
    const emailLink = devStore.socialLinks.find((l) => l.platform === 'email');
    if (emailLink) {
      emailLink.url = `mailto:${cleanEmail}`;
      emailLink.label = cleanEmail;
      emailLink.username = cleanEmail;
    }
  }
  persistDevStore();
  return devStore.settings;
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogsList(limit = 100): Promise<AuditLogData[]> {
  if (isDatabaseAvailable()) {
    try {
      const items = await getPrisma().auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return items.map((l) => ({
        id: l.id,
        userId: l.userId,
        action: l.action,
        entityType: l.entityType || undefined,
        entityId: l.entityId || undefined,
        ipAddress: l.ipAddress || undefined,
        userAgent: l.userAgent || undefined,
        metadata: l.metadata || undefined,
        createdAt: l.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[DataService] Prisma audit logs query error:', err);
    }
  }
  return devStore.auditLogs.slice(0, limit);
}

export async function recordAuditEntry(entry: Omit<AuditLogData, 'id' | 'createdAt'>): Promise<AuditLogData> {
  const item: AuditLogData = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().auditLog.create({
        data: {
          userId: entry.userId || null,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata,
        },
      });
    } catch (err) {
      console.warn('[DataService] Prisma record audit error:', err);
    }
  }
  devStore.auditLogs.unshift(item);
  persistDevStore();
  return item;
}

// ============================================================================
// ANALYTICS SUMMARY
// ============================================================================

export async function getAnalyticsSummary() {
  const isMock = !isDatabaseConfigured();
  const contactMessages = await getContactMessages();
  const projects = await getProjectsList();
  const certs = await getCertificationsList();

  return {
    isMock,
    totalProjects: projects.length,
    publishedProjects: projects.filter((p) => p.isPublished).length,
    totalCertifications: certs.length,
    publishedCertifications: certs.filter((c) => c.isPublished).length,
    totalMessages: contactMessages.length,
    unreadMessages: contactMessages.filter((m) => !m.isRead).length,
    pageViewsSummary: [
      { path: '/', views: 0, description: 'Homepage' },
      { path: '/projects', views: 0, description: 'Projects' },
      { path: '/certifications', views: 0, description: 'Certifications' },
      { path: '/skills', views: 0, description: 'Skills' },
      { path: '/education', views: 0, description: 'Education' },
      { path: '/experience', views: 0, description: 'Experience' },
      { path: '/contact', views: 0, description: 'Contact' },
    ],
    note: isMock
      ? 'Database is currently unconfigured. Production visitor tracking and project click persistence will automatically activate upon PostgreSQL connection.'
      : 'Live PostgreSQL database connected.',
  };
}

// ============================================================================
// SOCIAL LINKS & CONTACT CHANNELS SERVICE
// ============================================================================

export interface SocialLinksFilter {
  publishedOnly?: boolean;
  placement?: 'header' | 'footer' | 'contact' | 'about' | 'hero';
}

export async function getSocialLinksList(filter?: SocialLinksFilter): Promise<SocialLinkData[]> {
  if (isDatabaseAvailable()) {
    try {
      let items = await getPrisma().socialLink.findMany({
        orderBy: { sortOrder: 'asc' },
      });

      // If empty, auto-seed with initialSocialLinks
      if (items.length === 0) {
        try {
          await getPrisma().socialLink.createMany({
            data: initialSocialLinks.map((s) => ({
              id: s.id,
              platform: s.platform,
              label: s.label,
              url: s.url,
              username: s.username || null,
              icon: s.icon,
              isEnabled: s.isEnabled,
              isPublished: s.isPublished,
              showInHeader: s.showInHeader,
              showInFooter: s.showInFooter,
              showInContact: s.showInContact,
              showInAbout: s.showInAbout,
              showInHero: s.showInHero,
              sortOrder: s.sortOrder,
            })),
            skipDuplicates: true,
          });
          items = await getPrisma().socialLink.findMany({
            orderBy: { sortOrder: 'asc' },
          });
        } catch (seedErr) {
          console.warn('[DataService] Prisma initial social links seed skipped:', seedErr);
        }
      }

      let mapped: SocialLinkData[] = items.map((s) => ({
        id: s.id,
        platform: s.platform,
        label: s.label,
        url: s.url,
        username: s.username,
        icon: s.icon,
        isEnabled: s.isEnabled,
        isPublished: s.isPublished,
        showInHeader: s.showInHeader,
        showInFooter: s.showInFooter,
        showInContact: s.showInContact,
        showInAbout: s.showInAbout,
        showInHero: s.showInHero,
        sortOrder: s.sortOrder,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      }));

      // In case the DB has legacy email link with old address, auto-upgrade it:
      const emailLink = mapped.find((l) => l.platform === 'email');
      if (emailLink && (emailLink.url.includes('athravpathak01@gmail.com') || emailLink.label.includes('athravpathak01@gmail.com'))) {
        const newUrl = emailLink.url.replace('athravpathak01@gmail.com', 'athravpathak07@gmail.com');
        emailLink.url = newUrl;
        emailLink.label = 'athravpathak07@gmail.com';
        emailLink.username = 'athravpathak07@gmail.com';
        getPrisma().socialLink.update({
          where: { id: emailLink.id },
          data: { url: newUrl, label: 'athravpathak07@gmail.com', username: 'athravpathak07@gmail.com' },
        }).catch(() => {});
      }

      if (filter?.publishedOnly) {
        mapped = mapped.filter((item) => item.isEnabled && item.isPublished && item.url.trim().length > 0);
      }
      if (filter?.placement) {
        switch (filter.placement) {
          case 'header':
            mapped = mapped.filter((item) => item.showInHeader);
            break;
          case 'footer':
            mapped = mapped.filter((item) => item.showInFooter);
            break;
          case 'contact':
            mapped = mapped.filter((item) => item.showInContact);
            break;
          case 'about':
            mapped = mapped.filter((item) => item.showInAbout);
            break;
          case 'hero':
            mapped = mapped.filter((item) => item.showInHero);
            break;
        }
      }
      return mapped;
    } catch (err) {
      console.warn('[DataService] Prisma social links query error:', err);
    }
  }

  let list = [...devStore.socialLinks];
  if (filter?.publishedOnly) {
    list = list.filter((item) => item.isEnabled && item.isPublished && item.url.trim().length > 0);
  }
  if (filter?.placement) {
    switch (filter.placement) {
      case 'header':
        list = list.filter((item) => item.showInHeader);
        break;
      case 'footer':
        list = list.filter((item) => item.showInFooter);
        break;
      case 'contact':
        list = list.filter((item) => item.showInContact);
        break;
      case 'about':
        list = list.filter((item) => item.showInAbout);
        break;
      case 'hero':
        list = list.filter((item) => item.showInHero);
        break;
    }
  }
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSocialLinkById(id: string): Promise<SocialLinkData | null> {
  if (isDatabaseAvailable()) {
    try {
      const s = await getPrisma().socialLink.findUnique({ where: { id } });
      if (s) {
        return {
          id: s.id,
          platform: s.platform,
          label: s.label,
          url: s.url,
          username: s.username,
          icon: s.icon,
          isEnabled: s.isEnabled,
          isPublished: s.isPublished,
          showInHeader: s.showInHeader,
          showInFooter: s.showInFooter,
          showInContact: s.showInContact,
          showInAbout: s.showInAbout,
          showInHero: s.showInHero,
          sortOrder: s.sortOrder,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma getSocialLinkById error:', err);
    }
  }
  return devStore.socialLinks.find((l) => l.id === id) || null;
}

export async function createSocialLink(data: Omit<SocialLinkData, 'id' | 'createdAt' | 'updatedAt'>): Promise<SocialLinkData> {
  const newItem: SocialLinkData = {
    ...data,
    id: `social-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDatabaseAvailable()) {
    try {
      const created = await getPrisma().socialLink.create({
        data: {
          platform: data.platform,
          label: data.label,
          url: data.url,
          username: data.username || null,
          icon: data.icon,
          isEnabled: data.isEnabled ?? true,
          isPublished: data.isPublished ?? false,
          showInHeader: data.showInHeader ?? false,
          showInFooter: data.showInFooter ?? true,
          showInContact: data.showInContact ?? true,
          showInAbout: data.showInAbout ?? true,
          showInHero: data.showInHero ?? false,
          sortOrder: data.sortOrder ?? devStore.socialLinks.length,
        },
      });
      return {
        id: created.id,
        platform: created.platform,
        label: created.label,
        url: created.url,
        username: created.username,
        icon: created.icon,
        isEnabled: created.isEnabled,
        isPublished: created.isPublished,
        showInHeader: created.showInHeader,
        showInFooter: created.showInFooter,
        showInContact: created.showInContact,
        showInAbout: created.showInAbout,
        showInHero: created.showInHero,
        sortOrder: created.sortOrder,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('[DataService] Prisma createSocialLink error:', err);
      recordDatabaseFailure(err);
      throw new Error('Database operation failed while creating social link.');
    }
  }

  if (data.platform === 'email' && data.url) {
    const cleanEmail = data.url.replace(/^mailto:/i, '').trim().toLowerCase();
    devStore.profile.email = cleanEmail;
    devStore.settings.notificationEmail = cleanEmail;
  }
  devStore.socialLinks.push(newItem);
  persistDevStore();
  return newItem;
}

export async function updateSocialLink(id: string, data: Partial<SocialLinkData>): Promise<SocialLinkData | null> {
  if (isDatabaseAvailable()) {
    try {
      const updated = await getPrisma().socialLink.update({
        where: { id },
        data: {
          platform: data.platform,
          label: data.label,
          url: data.url,
          username: data.username !== undefined ? data.username : undefined,
          icon: data.icon,
          isEnabled: data.isEnabled,
          isPublished: data.isPublished,
          showInHeader: data.showInHeader,
          showInFooter: data.showInFooter,
          showInContact: data.showInContact,
          showInAbout: data.showInAbout,
          showInHero: data.showInHero,
          sortOrder: data.sortOrder,
        },
      });

      // Synchronize with Profile if matching platform
      if (updated.platform === 'email' && updated.url) {
        const cleanEmail = updated.url.replace(/^mailto:/i, '').trim().toLowerCase();
        await updateProfile({ email: cleanEmail }).catch(() => {});
      } else if (updated.platform === 'github' && updated.url) {
        await updateProfile({ githubUrl: updated.url }).catch(() => {});
      } else if (updated.platform === 'linkedin') {
        await updateProfile({ linkedinUrl: updated.url || null }).catch(() => {});
      }

      // Keep devStore in sync
      const idx = devStore.socialLinks.findIndex((l) => l.id === id);
      if (idx !== -1) {
        devStore.socialLinks[idx] = {
          ...devStore.socialLinks[idx],
          ...data,
          updatedAt: updated.updatedAt.toISOString(),
        };
        persistDevStore();
      }

      return {
        id: updated.id,
        platform: updated.platform,
        label: updated.label,
        url: updated.url,
        username: updated.username,
        icon: updated.icon,
        isEnabled: updated.isEnabled,
        isPublished: updated.isPublished,
        showInHeader: updated.showInHeader,
        showInFooter: updated.showInFooter,
        showInContact: updated.showInContact,
        showInAbout: updated.showInAbout,
        showInHero: updated.showInHero,
        sortOrder: updated.sortOrder,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('[DataService] Prisma updateSocialLink error:', err);
      recordDatabaseFailure(err);
      throw new Error('Database operation failed while updating social link.');
    }
  }

  const idx = devStore.socialLinks.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  devStore.socialLinks[idx] = {
    ...devStore.socialLinks[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Synchronize with Profile in devStore
  const current = devStore.socialLinks[idx];
  if (current.platform === 'email' && current.url) {
    const cleanEmail = current.url.replace(/^mailto:/i, '').trim().toLowerCase();
    devStore.profile.email = cleanEmail;
    devStore.settings.notificationEmail = cleanEmail;
  } else if (current.platform === 'github' && current.url) {
    devStore.profile.githubUrl = current.url;
  } else if (current.platform === 'linkedin') {
    devStore.profile.linkedinUrl = current.url || null;
  }

  persistDevStore();
  return devStore.socialLinks[idx];
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await getPrisma().socialLink.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma deleteSocialLink error:', err);
    }
  }

  const idx = devStore.socialLinks.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  devStore.socialLinks.splice(idx, 1);
  persistDevStore();
  return true;
}

export async function reorderSocialLinks(orderedIds: string[]): Promise<boolean> {
  if (isDatabaseAvailable()) {
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          getPrisma().socialLink.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
      return true;
    } catch (err) {
      console.warn('[DataService] Prisma reorderSocialLinks error:', err);
    }
  }

  orderedIds.forEach((id, index) => {
    const item = devStore.socialLinks.find((l) => l.id === id);
    if (item) {
      item.sortOrder = index;
    }
  });
  devStore.socialLinks.sort((a, b) => a.sortOrder - b.sortOrder);
  persistDevStore();
  return true;
}
