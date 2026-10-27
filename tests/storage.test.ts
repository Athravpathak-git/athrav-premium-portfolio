import { describe, it, expect } from 'vitest';
import {
  validateUploadedFile,
  validateFileMagicBytes,
  isBlobStorageConfigured,
  getStorageProvider,
  deleteUploadedFile,
} from '@/lib/storage';

describe('Storage & File Upload Security Validation', () => {
  it('accepts legitimate JPEG, PNG, and PDF files within size limits', () => {
    const validPng = new File(['mock content'], 'screenshot.png', { type: 'image/png' });
    const resultPng = validateUploadedFile(validPng);
    expect(resultPng.valid).toBe(true);

    const validPdf = new File(['mock pdf bytes'], 'credential.pdf', {
      type: 'application/pdf',
    });
    const resultPdf = validateUploadedFile(validPdf);
    expect(resultPdf.valid).toBe(true);
  });

  it('rejects SVG files to prevent XSS and script injection attacks', () => {
    const svgFile = new File(['<svg onload="alert(1)"></svg>'], 'malicious.svg', {
      type: 'image/svg+xml',
    });
    const result = validateUploadedFile(svgFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('SVG is rejected for security');
  });

  it('rejects dangerous executable extensions', () => {
    const exeFile = new File(['binary'], 'script.exe', {
      type: 'application/x-msdownload',
    });
    const resultExe = validateUploadedFile(exeFile);
    expect(resultExe.valid).toBe(false);

    const shFile = new File(['#!/bin/bash'], 'run.sh', {
      type: 'application/x-sh',
    });
    const resultSh = validateUploadedFile(shFile);
    expect(resultSh.valid).toBe(false);
  });

  it('rejects files exceeding the 10MB maximum size limit', () => {
    // Create mock oversized file object
    const oversizedFile = {
      name: 'large_dataset.png',
      size: 11 * 1024 * 1024, // 11MB
      type: 'image/png',
    } as unknown as File;

    const result = validateUploadedFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds the maximum limit of 10MB');
  });

  it('validates binary magic bytes and detects disguised files', () => {
    // Legitimate JPEG buffer
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegCheck = validateFileMagicBytes(jpegBuffer);
    expect(jpegCheck.valid).toBe(true);
    expect(jpegCheck.detectedMime).toBe('image/jpeg');

    // Legitimate PNG buffer
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const pngCheck = validateFileMagicBytes(pngBuffer);
    expect(pngCheck.valid).toBe(true);
    expect(pngCheck.detectedMime).toBe('image/png');

    // Disguised script/HTML file
    const fakePngBuffer = Buffer.from('<html><script>alert("hack")</script></html>');
    const fakeCheck = validateFileMagicBytes(fakePngBuffer);
    expect(fakeCheck.valid).toBe(false);
    expect(fakeCheck.error).toContain('Unrecognized or unsafe binary file format');
  });

  it('correctly reports storage provider based on BLOB_STORE_ID (OIDC) or BLOB_READ_WRITE_TOKEN environment', () => {
    const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
    const originalStoreId = process.env.BLOB_STORE_ID;
    try {
      delete process.env.BLOB_READ_WRITE_TOKEN;
      delete process.env.BLOB_STORE_ID;
      expect(isBlobStorageConfigured()).toBe(false);
      expect(getStorageProvider()).toBe('local');

      // Static token authentication
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_testtoken123';
      expect(isBlobStorageConfigured()).toBe(true);
      expect(getStorageProvider()).toBe('vercel-blob');

      delete process.env.BLOB_READ_WRITE_TOKEN;

      // Vercel OIDC authentication
      process.env.BLOB_STORE_ID = 'store_test_abc123';
      expect(isBlobStorageConfigured()).toBe(true);
      expect(getStorageProvider()).toBe('vercel-blob');
    } finally {
      if (originalToken) {
        process.env.BLOB_READ_WRITE_TOKEN = originalToken;
      } else {
        delete process.env.BLOB_READ_WRITE_TOKEN;
      }
      if (originalStoreId) {
        process.env.BLOB_STORE_ID = originalStoreId;
      } else {
        delete process.env.BLOB_STORE_ID;
      }
    }
  });

  it('safely handles path traversal attempts in deleteUploadedFile', async () => {
    const maliciousAttempt = await deleteUploadedFile('../../etc/passwd');
    expect(maliciousAttempt).toBe(false);

    const emptyAttempt = await deleteUploadedFile('');
    expect(emptyAttempt).toBe(false);
  });

  it('strictly blocks fallback to public/uploads when in production or on Vercel without blob configuration', async () => {
    const { saveUploadedFile, saveCertificateImage } = await import('@/lib/storage');
    const originalVercel = process.env.VERCEL;
    const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
    const originalStoreId = process.env.BLOB_STORE_ID;

    try {
      process.env.VERCEL = '1';
      delete process.env.BLOB_READ_WRITE_TOKEN;
      delete process.env.BLOB_STORE_ID;

      const validPng = new File(
        [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])],
        'photo.png',
        { type: 'image/png' }
      );

      await expect(saveUploadedFile(validPng, true)).rejects.toThrow(
        /Vercel Blob storage is not configured for production deployment/
      );

      await expect(saveCertificateImage(validPng)).rejects.toThrow(
        /Vercel Blob storage is not configured for production deployment/
      );
    } finally {
      if (originalVercel !== undefined) {
        process.env.VERCEL = originalVercel;
      } else {
        delete process.env.VERCEL;
      }
      if (originalToken) {
        process.env.BLOB_READ_WRITE_TOKEN = originalToken;
      }
      if (originalStoreId) {
        process.env.BLOB_STORE_ID = originalStoreId;
      }
    }
  });
});
