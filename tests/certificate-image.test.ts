import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  saveCertificateImage,
  validateCertificateFile,
  deleteUploadedFile,
} from '@/lib/storage';
import {
  createCertification,
  getCertificationById,
  updateCertification,
  deleteCertification,
  checkMediaReferences,
} from '@/lib/data-service';
import { certificationSchema } from '@/lib/validation/schemas';

describe('Certificate Image Upload, Validation, and Storage', () => {
  const createdFiles: string[] = [];
  const createdCertIds: string[] = [];

  afterEach(async () => {
    // Clean up created files on disk
    for (const url of createdFiles) {
      await deleteUploadedFile(url);
    }
    createdFiles.length = 0;

    // Clean up created cert records
    for (const id of createdCertIds) {
      await deleteCertification(id);
    }
    createdCertIds.length = 0;
  });

  describe('Storage & Magic Bytes Validation', () => {
    it('accepts and saves authentic JPEG certificate image', async () => {
      const jpegBytes = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01,
      ]);
      const file = new File([jpegBytes], 'stanford_ml_cert.jpg', { type: 'image/jpeg' });

      const result = await saveCertificateImage(file);
      createdFiles.push(result.url);

      expect(result.url).toMatch(/^\/uploads\/cert-\d+-[a-f0-9]+\.jpg$/);
      expect(result.mimeType).toBe('image/jpeg');

      const diskPath = path.join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      expect(fs.existsSync(diskPath)).toBe(true);
    });

    it('accepts and saves authentic PNG certificate image', async () => {
      const pngBytes = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      ]);
      const file = new File([pngBytes], 'deeplearning_ai.png', { type: 'image/png' });

      const result = await saveCertificateImage(file);
      createdFiles.push(result.url);

      expect(result.url).toMatch(/^\/uploads\/cert-\d+-[a-f0-9]+\.png$/);
      expect(result.mimeType).toBe('image/png');

      const diskPath = path.join(process.cwd(), 'public', result.url.replace(/^\//, ''));
      expect(fs.existsSync(diskPath)).toBe(true);
    });

    it('accepts and saves authentic WebP certificate image', async () => {
      const webpBytes = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38,
      ]);
      const file = new File([webpBytes], 'cert_badge.webp', { type: 'image/webp' });

      const result = await saveCertificateImage(file);
      createdFiles.push(result.url);

      expect(result.url).toMatch(/^\/uploads\/cert-\d+-[a-f0-9]+\.webp$/);
      expect(result.mimeType).toBe('image/webp');
    });

    it('rejects unsupported file formats like SVG or PDF in certificate images', () => {
      const svgFile = new File(['<svg></svg>'], 'cert.svg', { type: 'image/svg+xml' });
      const validation = validateCertificateFile(svgFile);
      expect(validation.valid).toBe(false);
      expect(validation.error).toMatch(/Unsupported file type/);
    });

    it('rejects disguised malicious files with invalid binary magic bytes', async () => {
      const fakeBytes = Buffer.from('console.log("malicious script disguised as image");');
      const fakeFile = new File([fakeBytes], 'exploit.jpg', { type: 'image/jpeg' });

      await expect(saveCertificateImage(fakeFile)).rejects.toThrow(
        /Unrecognized or unsafe binary file format/
      );
    });

    it('rejects files larger than 10MB limit', () => {
      const largeFile = new File([new Uint8Array(11 * 1024 * 1024)], 'giant_cert.png', {
        type: 'image/png',
      });
      const validation = validateCertificateFile(largeFile);
      expect(validation.valid).toBe(false);
      expect(validation.error).toMatch(/exceeds the maximum limit of 10MB/);
    });
  });

  describe('Certification Schema & Data Service Integration', () => {
    it('validates certificationSchema with imageUrl, issueDate, and credentialId', () => {
      const payload = {
        title: 'Deep Learning Specialization',
        slug: 'deep-learning-specialization',
        issuer: 'DeepLearning.AI',
        category: 'Machine Learning',
        issueDate: '2024-03',
        credentialId: 'DL-SPEC-12345',
        credentialUrl: 'https://coursera.org/verify/DL12345',
        imageUrl: '/uploads/cert-174000-abcd.png',
        description: 'Comprehensive 5-course series covering neural networks and deep learning.',
        relatedSkills: ['Python', 'PyTorch', 'CNN', 'RNN'],
        isFeatured: true,
        isPublished: true,
      };

      const parsed = certificationSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.imageUrl).toBe('/uploads/cert-174000-abcd.png');
        expect(parsed.data.issueDate).toBe('2024-03');
        expect(parsed.data.credentialId).toBe('DL-SPEC-12345');
      }
    });

    it('creates, retrieves, and updates certification with imageUrl and issueDate', async () => {
      const newCert = await createCertification({
        title: 'Test AI Certificate',
        slug: 'test-ai-certificate-' + Date.now(),
        issuer: 'Test Academy',
        category: 'Artificial Intelligence',
        issueDate: '2024-06',
        credentialId: 'TEST-123',
        credentialUrl: 'https://example.com/verify/123',
        imageUrl: '/uploads/cert-sample.png',
        description: 'Test certificate description',
        relatedSkills: ['Python', 'TensorFlow'],
        isFeatured: false,
        isPublished: true,
        sortOrder: 99,
      });
      createdCertIds.push(newCert.id);

      expect(newCert.id).toBeDefined();
      expect(newCert.imageUrl).toBe('/uploads/cert-sample.png');
      expect(newCert.issueDate).toBe('2024-06');

      // Fetch by ID
      const fetched = await getCertificationById(newCert.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.imageUrl).toBe('/uploads/cert-sample.png');
      expect(fetched?.issueDate).toBe('2024-06');

      // Update imageUrl and replace
      const updated = await updateCertification(newCert.id, {
        imageUrl: '/uploads/cert-sample-updated.png',
        issueDate: '2024-07',
      });
      expect(updated?.imageUrl).toBe('/uploads/cert-sample-updated.png');
      expect(updated?.issueDate).toBe('2024-07');
    });

    it('tracks media references for certificate images via checkMediaReferences', async () => {
      const uniqueImageFilename = `cert-test-ref-${Date.now()}.png`;
      const uniqueImageUrl = `/uploads/${uniqueImageFilename}`;

      const certWithImage = await createCertification({
        title: 'Ref Tracking Test Certificate',
        slug: 'ref-tracking-cert-' + Date.now(),
        issuer: 'Ref Academy',
        category: 'Software Engineering',
        imageUrl: uniqueImageUrl,
        relatedSkills: ['TypeScript'],
        isFeatured: false,
        isPublished: true,
        sortOrder: 100,
      });
      createdCertIds.push(certWithImage.id);

      const refs = checkMediaReferences(uniqueImageUrl);
      expect(refs.length).toBeGreaterThan(0);
      expect(refs.some((r) => r.type === 'certification' && r.title === 'Ref Tracking Test Certificate')).toBe(
        true
      );
    });
  });
});
