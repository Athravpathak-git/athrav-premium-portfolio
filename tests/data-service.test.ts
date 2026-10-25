import { describe, it, expect } from 'vitest';
import {
  getProjectsList,
  getProjectBySlug,
  createProject,
  getCertificationsList,
  createCertification,
  createContactMessage,
  getContactMessages,
  getEducationList,
} from '@/lib/data-service';

describe('Data Service & Content Publishing Workflows', () => {
  it('strictly isolates unpublished draft projects from public listings', async () => {
    // Create an explicit draft project
    const draftSlug = `test-draft-project-${Date.now()}`;
    await createProject({
      title: 'Secret Draft AI Experiment',
      slug: draftSlug,
      summary: 'Confidential unpublished model experiment.',
      description: 'Detailed description.',
      category: 'Artificial Intelligence',
      isFeatured: false,
      techStack: ['Python', 'PyTorch'],
      sortOrder: 99,
      isPublished: false, // DRAFT
      screenshots: [],
    });

    // Public call with publishedOnly = true
    const publicProjects = await getProjectsList({ publishedOnly: true });
    const foundInPublic = publicProjects.find((p) => p.slug === draftSlug);
    expect(foundInPublic).toBeUndefined();

    // Direct slug lookup with publishedOnly = true
    const publicSlugLookup = await getProjectBySlug(draftSlug, true);
    expect(publicSlugLookup).toBeNull();

    // Admin call with publishedOnly = false
    const adminProjects = await getProjectsList({ publishedOnly: false });
    const foundInAdmin = adminProjects.find((p) => p.slug === draftSlug);
    expect(foundInAdmin).toBeDefined();
    expect(foundInAdmin?.isPublished).toBe(false);
  });

  it('strictly isolates unpublished draft certifications from public listings', async () => {
    const draftCertSlug = `test-draft-cert-${Date.now()}`;
    await createCertification({
      title: 'Unpublished Draft Certificate',
      slug: draftCertSlug,
      issuer: 'Test Academy',
      category: 'Machine Learning',
      relatedSkills: ['Python'],
      isFeatured: false,
      isPublished: false, // DRAFT
      sortOrder: 99,
    });

    const publicCerts = await getCertificationsList({ publishedOnly: true });
    const foundInPublic = publicCerts.find((c) => c.slug === draftCertSlug);
    expect(foundInPublic).toBeUndefined();

    const adminCerts = await getCertificationsList({ publishedOnly: false });
    const foundInAdmin = adminCerts.find((c) => c.slug === draftCertSlug);
    expect(foundInAdmin).toBeDefined();
  });

  it('stores and retrieves incoming contact messages correctly', async () => {
    const testSubject = `Inquiry-${Date.now()}`;
    const createdMsg = await createContactMessage({
      name: 'Engineering Recruiter',
      email: 'recruiter@tech.corp',
      subject: testSubject,
      message: 'We are interested in discussing an AI internship opportunity.',
    });

    expect(createdMsg.id).toBeDefined();
    expect(createdMsg.isRead).toBe(false);

    const messages = await getContactMessages();
    const found = messages.find((m) => m.subject === testSubject);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Engineering Recruiter');
  });

  it('returns valid initial BCA education record', async () => {
    const eduList = await getEducationList(true);
    expect(eduList.length).toBeGreaterThan(0);
    expect(eduList[0].degree).toContain('Bachelor of Computer Applications');
    expect(eduList[0].status).toContain('Second Year');
  });

  it('persists store updates to local dev-storage JSON file in mock mode', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const storePath = path.join(process.cwd(), '.dev-storage', 'portfolio-dev-store.json');
    
    // File must exist
    expect(fs.existsSync(storePath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    expect(content.profile).toBeDefined();
    expect(content.profile.name).toBe('Athrav Pathak');
    expect(Array.isArray(content.projects)).toBe(true);
  });
});
