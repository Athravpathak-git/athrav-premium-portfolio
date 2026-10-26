'use client';

import React, { useState } from 'react';
import { Eye, ZoomIn, Download, ExternalLink } from 'lucide-react';
import { CertificateModal } from './CertificateModal';

interface CertificateImagePreviewProps {
  imageUrl: string;
  title: string;
  issuer: string;
  issueDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

export function CertificateImagePreview({
  imageUrl,
  title,
  issuer,
  issueDate,
  credentialId,
  credentialUrl,
}: CertificateImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Interactive Image Frame */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative w-full rounded-2xl overflow-hidden border border-border-soft dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-900 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
          title="Click to expand certificate"
        >
          <div className="aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center p-2 sm:p-4 bg-cream-100/40 dark:bg-charcoal-950/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${title} Official Certificate Document`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-md group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-burgundy/40 dark:bg-charcoal-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs font-semibold backdrop-blur-[2px]">
            <ZoomIn className="w-5 h-5" />
            <span>Click to Enlarge Certificate</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white dark:bg-rosegold dark:text-charcoal-950 dark:hover:bg-cream text-xs font-bold transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Certificate</span>
            </button>

            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-soft dark:border-charcoal-600 text-charcoal/80 dark:text-cream/80 hover:text-burgundy dark:hover:text-rosegold text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </a>
          </div>

          {credentialUrl && (
            <a
              href={credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rosegold/50 dark:border-rosegold/30 text-burgundy dark:text-rosegold hover:bg-burgundy/10 dark:hover:bg-rosegold/10 text-xs font-bold transition-colors"
            >
              <span>Verify Credential</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      <CertificateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageUrl={imageUrl}
        title={title}
        issuer={issuer}
        issueDate={issueDate}
        credentialId={credentialId}
        credentialUrl={credentialUrl}
      />
    </>
  );
}
