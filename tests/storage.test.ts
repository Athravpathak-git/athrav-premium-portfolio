import { describe, it, expect } from 'vitest';
import { validateUploadedFile } from '@/lib/storage';

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
});
