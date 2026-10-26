'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, Award, Calendar, Hash, Download } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  issuer: string;
  issueDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

export function CertificateModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  issuer,
  issueDate,
  credentialId,
  credentialUrl,
}: CertificateModalProps) {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-charcoal/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-charcoal-800 rounded-2xl border border-border-soft dark:border-charcoal-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-900/60">
          <div className="flex items-center gap-3 pr-4 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center text-burgundy dark:text-rosegold shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="cert-modal-title"
                className="text-base sm:text-lg font-serif font-bold text-burgundy dark:text-cream truncate"
              >
                {title}
              </h2>
              <p className="text-xs text-rosegold-700 dark:text-rosegold font-semibold truncate">{issuer}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate preview"
            className="p-2 rounded-xl text-charcoal/60 dark:text-cream/60 hover:text-burgundy dark:hover:text-cream hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Image View */}
        <div className="relative flex-1 overflow-auto bg-cream-100/50 dark:bg-charcoal-950 flex items-center justify-center p-4 sm:p-6 min-h-[300px] max-h-[65vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${title} Certificate Document`}
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg border border-border-soft/60 dark:border-charcoal-700"
          />
        </div>

        {/* Footer / Metadata Bar */}
        <div className="px-6 py-4 border-t border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-charcoal/80 dark:text-cream/80">
            {issueDate && (
              <span className="inline-flex items-center gap-1.5 bg-cream-100 dark:bg-charcoal-700 px-2.5 py-1 rounded-md border border-border-soft dark:border-charcoal-600">
                <Calendar className="w-3.5 h-3.5 text-rosegold" />
                <span>Issued: {issueDate}</span>
              </span>
            )}
            {credentialId && (
              <span className="inline-flex items-center gap-1.5 bg-cream-100 dark:bg-charcoal-700 px-2.5 py-1 rounded-md border border-border-soft dark:border-charcoal-600">
                <Hash className="w-3.5 h-3.5 text-rosegold" />
                <span>ID: {credentialId}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-soft dark:border-charcoal-600 text-charcoal/80 dark:text-cream/80 hover:text-burgundy dark:hover:text-rosegold hover:border-burgundy/40 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Image</span>
            </a>

            {credentialUrl && (
              <a
                href={credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white dark:bg-rosegold dark:text-charcoal-950 dark:hover:bg-cream font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <span>Verify Credential</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
