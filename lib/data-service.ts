import fs from 'fs';
import path from 'path';
import { isDatabaseConfigured, isDatabaseAvailable, withDbTimeout, getPrisma } from './db';
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
  ProfileData,
  EducationData,
  SkillData,
  ProjectData,
  CertificationData,
  ExperienceData,
  AchievementData,
  ServiceData,
  HomepageSectionData,
  ContactMessageData,
  AuditLogData,
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
    experience: [...initialExperience],
    achievements: [...initialAchievements],
    services: [...initialServices],
    homepageSections: [...initialHomepageSections],
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
        return {
          ...getInitialDevStore(),
          ...parsed,
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
      const p = await getPrisma().profile.findFirst();
      if (p) {
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
  if (isDatabaseAvailable()) {
    try {
      const existing = await getPrisma().profile.findFirst();
      if (existing) {
        const updated = await getPrisma().profile.update({
          where: { id: existing.id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
        return {
          ...updated,
          location: updated.location || '',
          status: updated.status || '',
          githubUrl: updated.githubUrl || '',
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DataService] Prisma update failed:', err);
    }
  }
  devStore.profile = {
    ...devStore.profile,
    ...data,
    updatedAt: new Date().toISOString(),
  };
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
    } catch (err) {
      console.warn('[DataService] Prisma update settings error:', err);
    }
  }
  devStore.settings = { ...devStore.settings, ...settings };
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
