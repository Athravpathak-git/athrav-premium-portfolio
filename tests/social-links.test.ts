import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GET as adminGetHandler,
  POST as adminPostHandler,
  PUT as adminPutHandler,
  DELETE as adminDeleteHandler,
} from '@/app/api/admin/social-links/route';
import { GET as publicGetHandler } from '@/app/api/social-links/route';
import {
  getSocialLinksList,
  updateSocialLink,
  getProfile,
} from '@/lib/data-service';
import { createSession } from '@/lib/auth';

let mockCookieStore: Record<string, string> = {};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => (mockCookieStore[name] ? { name, value: mockCookieStore[name] } : undefined),
    set: (name: string, value: string) => {
      mockCookieStore[name] = value;
    },
  })),
}));

describe('Social Media & Contact Channels API & Persistence', () => {
  beforeEach(() => {
    mockCookieStore = {};
  });

  describe('1. Authentication and Authorization Guard', () => {
    it('strictly rejects unauthenticated GET requests with 401', async () => {
      const res = await adminGetHandler();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized: Administrative authentication required.');
    });

    it('strictly rejects unauthenticated PUT requests with 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'social-linkedin', url: 'https://linkedin.com/in/test' }),
      });
      const res = await adminPutHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized: Administrative authentication required.');
    });

    it('strictly rejects unauthenticated POST requests with 401', async () => {
      const req = new Request('http://localhost:3000/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'custom-link', label: 'Custom' }),
      });
      const res = await adminPostHandler(req);
      expect(res.status).toBe(401);
    });

    it('allows authenticated admin sessions to retrieve and modify social settings', async () => {
      const token = await createSession('admin-super-1');
      mockCookieStore['athrav_admin_session'] = token;

      const getRes = await adminGetHandler();
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.success).toBe(true);
      expect(Array.isArray(getData.links)).toBe(true);
    });
  });

  describe('2. LinkedIn Configuration and Public Filtering', () => {
    it('keeps LinkedIn strictly hidden from public endpoints when unpublished or url is empty', async () => {
      // Ensure LinkedIn is unpublished or reset
      await updateSocialLink('social-linkedin', {
        platform: 'linkedin',
        url: '',
        isPublished: false,
        isEnabled: true,
      });

      const publicReq = new Request('http://localhost:3000/api/social-links');
      const publicRes = await publicGetHandler(publicReq);
      expect(publicRes.status).toBe(200);
      const publicData = await publicRes.json();

      const publicLinkedIn = publicData.links.find((l: any) => l.platform === 'linkedin');
      expect(publicLinkedIn).toBeUndefined();
    });

    it('publishes LinkedIn to public endpoint only when valid URL is saved and published', async () => {
      const token = await createSession('admin-super-1');
      mockCookieStore['athrav_admin_session'] = token;

      const testLinkedInUrl = 'https://www.linkedin.com/in/athrav-pathak-verified';

      // Update LinkedIn via Admin PUT
      const putReq = new Request('http://localhost:3000/api/admin/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'social-linkedin',
          platform: 'linkedin',
          label: 'LinkedIn Profile',
          url: testLinkedInUrl,
          isEnabled: true,
          isPublished: true,
          showInFooter: true,
          showInHeader: true,
          showInContact: true,
        }),
      });

      const putRes = await adminPutHandler(putReq);
      expect(putRes.status).toBe(200);
      const putData = await putRes.json();
      expect(putData.success).toBe(true);
      expect(putData.link.url).toBe(testLinkedInUrl);
      expect(putData.link.isPublished).toBe(true);

      // Now query public API
      const publicReq = new Request('http://localhost:3000/api/social-links');
      const publicRes = await publicGetHandler(publicReq);
      const publicData = await publicRes.json();

      const foundLinkedIn = publicData.links.find((l: any) => l.platform === 'linkedin');
      expect(foundLinkedIn).toBeDefined();
      expect(foundLinkedIn.url).toBe(testLinkedInUrl);

      // Synchronized to Profile
      const profile = await getProfile();
      expect(profile.linkedinUrl).toBe(testLinkedInUrl);

      // Reset LinkedIn back to unpublished
      await updateSocialLink('social-linkedin', {
        platform: 'linkedin',
        url: '',
        isPublished: false,
      });
    });

    it('handles resilient upsert if updating a social link that has platform fallback', async () => {
      const result = await updateSocialLink('nonexistent-uuid-1234', {
        platform: 'linkedin',
        label: 'LinkedIn Profile',
        url: 'https://www.linkedin.com/in/athrav-fallback-test',
        isEnabled: true,
        isPublished: true,
      });

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('linkedin');
      expect(result?.url).toBe('https://www.linkedin.com/in/athrav-fallback-test');

      // Revert back
      await updateSocialLink('social-linkedin', {
        platform: 'linkedin',
        url: '',
        isPublished: false,
      });
    });
  });
});
