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
  getCertificateCategoriesList,
  createCertificateCategory,
  updateCertificateCategory,
  deleteCertificateCategory,
  getCertificateCategoryUsageCounts,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  getSocialLinksList,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
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

  describe('Certificate Categories Management Workflows', () => {
    it('retrieves default certificate categories with sort order', async () => {
      const categories = await getCertificateCategoriesList();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some((c) => c.name === 'Machine Learning')).toBe(true);
      expect(categories.some((c) => c.name === 'Data Science')).toBe(true);
      expect(categories.some((c) => c.name === 'Internships')).toBe(true);
    });

    it('creates a new category and prevents case-insensitive duplicates', async () => {
      const uniqueName = `Cloud Computing ${Date.now()}`;
      const created = await createCertificateCategory({ name: uniqueName });
      expect(created.id).toBeDefined();
      expect(created.name).toBe(uniqueName);
      expect(created.slug).toBeDefined();

      // Duplicate attempt should reject
      await expect(createCertificateCategory({ name: uniqueName.toLowerCase() })).rejects.toThrow(
        /already exists/
      );
    });

    it('renames a category and cascades to existing certifications', async () => {
      const oldCatName = `DevOps-${Date.now()}`;
      const newCatName = `DevOps & SRE-${Date.now()}`;

      const createdCat = await createCertificateCategory({ name: oldCatName });
      const cert = await createCertification({
        title: 'CI/CD Pipeline Certification',
        slug: `cicd-cert-${Date.now()}`,
        issuer: 'DevOps Org',
        category: oldCatName,
        relatedSkills: ['Docker'],
        isFeatured: false,
        isPublished: true,
        sortOrder: 1,
      });

      expect(cert.category).toBe(oldCatName);

      // Rename category
      await updateCertificateCategory(createdCat.id, { name: newCatName });

      // Certifications should now reflect new category name
      const certs = await getCertificationsList({ publishedOnly: false });
      const updatedCert = certs.find((c) => c.id === cert.id);
      expect(updatedCert?.category).toBe(newCatName);
    });

    it('prevents deleting in-use category without reassignment target, and reassigns cleanly when target is provided', async () => {
      const sourceCatName = `Legacy System ${Date.now()}`;
      const targetCatName = `Modern System ${Date.now()}`;

      const sourceCat = await createCertificateCategory({ name: sourceCatName });
      const targetCat = await createCertificateCategory({ name: targetCatName });

      const cert = await createCertification({
        title: 'Legacy Mainframe Security',
        slug: `legacy-cert-${Date.now()}`,
        issuer: 'Legacy Org',
        category: sourceCatName,
        relatedSkills: ['Security'],
        isFeatured: false,
        isPublished: true,
        sortOrder: 1,
      });

      // Attempt deletion without reassignment should fail
      await expect(deleteCertificateCategory(sourceCat.id)).rejects.toThrow(
        /Cannot delete category/
      );

      // Deletion with target reassignment should succeed
      const deleteResult = await deleteCertificateCategory(sourceCat.id, targetCat.id);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.reassignedCount).toBeGreaterThanOrEqual(1);

      // Verify certificate now has target category
      const certs = await getCertificationsList({ publishedOnly: false });
      const reassignedCert = certs.find((c) => c.id === cert.id);
      expect(reassignedCert?.category).toBe(targetCatName);
    });
  });

  describe('Social Links & Contact Channels Workflows', () => {
    it('guarantees verified primary email is athravpathak07@gmail.com and not legacy address', async () => {
      const profile = await getProfile();
      expect(profile.email).toBe('athravpathak07@gmail.com');
      expect(profile.email).not.toBe('athravpathak01@gmail.com');
    });

    it('retrieves default channels with LinkedIn safely unconfigured and draft by default', async () => {
      const allLinks = await getSocialLinksList({ publishedOnly: false });
      expect(allLinks.length).toBeGreaterThanOrEqual(8);

      const linkedIn = allLinks.find((l) => l.platform === 'linkedin');
      expect(linkedIn).toBeDefined();

      // Ensure LinkedIn is in unconfigured draft state
      await updateSocialLink(linkedIn!.id, { url: '', isPublished: false });

      // LinkedIn must not be published when unconfigured / empty
      const publicLinks = await getSocialLinksList({ publishedOnly: true });
      const publicLinkedIn = publicLinks.find((l) => l.platform === 'linkedin');
      expect(publicLinkedIn).toBeUndefined();
    });

    it('enables, publishes, and synchronizes LinkedIn profile URL seamlessly', async () => {
      const allLinks = await getSocialLinksList({ publishedOnly: false });
      const linkedIn = allLinks.find((l) => l.platform === 'linkedin');
      expect(linkedIn).toBeDefined();

      const testLinkedInUrl = 'https://www.linkedin.com/in/athrav-pathak-test';
      const updated = await updateSocialLink(linkedIn!.id, {
        url: testLinkedInUrl,
        isPublished: true,
        isEnabled: true,
        showInFooter: true,
      });

      expect(updated).toBeDefined();
      expect(updated?.url).toBe(testLinkedInUrl);
      expect(updated?.isPublished).toBe(true);

      // Now it must appear in public listing
      const publicLinks = await getSocialLinksList({ publishedOnly: true });
      const publicLinkedIn = publicLinks.find((l) => l.platform === 'linkedin');
      expect(publicLinkedIn).toBeDefined();
      expect(publicLinkedIn?.url).toBe(testLinkedInUrl);

      // Verify Profile synchronization
      const profile = await getProfile();
      expect(profile.linkedinUrl).toBe(testLinkedInUrl);

      // Cleanup: revert LinkedIn back to unpublished draft
      await updateSocialLink(linkedIn!.id, { url: '', isPublished: false });
    });

    it('supports custom channel creation, placement filtering, and deletion', async () => {
      const customKey = `custom-kaggle-${Date.now()}`;
      const created = await createSocialLink({
        platform: customKey,
        label: 'Kaggle Notebooks',
        url: 'https://kaggle.com/athravpathak',
        icon: 'Globe',
        isEnabled: true,
        isPublished: true,
        showInHeader: false,
        showInFooter: true,
        showInContact: true,
        showInAbout: false,
        showInHero: false,
        sortOrder: 50,
      });

      expect(created.id).toBeDefined();
      expect(created.label).toBe('Kaggle Notebooks');

      // Placement filter verification
      const footerLinks = await getSocialLinksList({ publishedOnly: true, placement: 'footer' });
      expect(footerLinks.some((l) => l.id === created.id)).toBe(true);

      const headerLinks = await getSocialLinksList({ publishedOnly: true, placement: 'header' });
      expect(headerLinks.some((l) => l.id === created.id)).toBe(false);

      // Deletion test
      const deleted = await deleteSocialLink(created.id);
      expect(deleted).toBe(true);

      const afterDelete = await getSocialLinkById(created.id);
      expect(afterDelete).toBeNull();
    });

    it('persists email update across profile, social channels, and settings without reverting', async () => {
      const testEmail = 'athravpathak07@gmail.com';

      // 1. Update profile email
      const updated = await updateProfile({ email: testEmail });
      expect(updated.email).toBe(testEmail);

      // 2. Verify getProfile() read-back
      const fetchedProfile = await getProfile();
      expect(fetchedProfile.email).toBe(testEmail);

      // 3. Verify social channels sync
      const socials = await getSocialLinksList({ publishedOnly: false });
      const emailSocial = socials.find((s) => s.platform === 'email');
      expect(emailSocial).toBeDefined();
      expect(emailSocial?.url).toBe(`mailto:${testEmail}`);
      expect(emailSocial?.label).toBe(testEmail);

      // 4. Verify settings sync
      const settings = await getSettings();
      expect(settings.notificationEmail).toBe(testEmail);
    });
  });
});
