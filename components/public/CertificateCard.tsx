'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CertificationData } from '@/lib/mock-data';
import { Award, ArrowUpRight, ExternalLink, Eye, Calendar, Hash } from 'lucide-react';
import { CertificateModal } from './CertificateModal';

export function CertificateCard({ cert }: { cert: CertificationData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const isDraftRecord = !cert.credentialId && !cert.credentialUrl;

  return (
    <>
      <div className="group rounded-2xl border border-border-soft hover:border-rosegold dark:border-charcoal-700 dark:hover:border-rosegold bg-white dark:bg-charcoal-800 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_-6px_rgba(87,38,51,0.08)] dark:hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.4)] hover:-translate-y-1">
        <div className="space-y-4">
          {/* Header Row: Category & Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-8 h-8 rounded-full bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center text-burgundy dark:text-rosegold">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-charcoal/70 dark:text-cream/70">
                {cert.category}
              </span>
              {isDraftRecord && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cream-100 dark:bg-charcoal-700 text-burgundy dark:text-cream border border-border-soft dark:border-charcoal-600">
                  Coursework Record
                </span>
              )}
            </div>
          </div>

          {/* Certificate Image Thumbnail (if uploaded) */}
          {cert.imageUrl && !imageLoadError ? (
            <div
              onClick={() => setIsModalOpen(true)}
              className="relative w-full h-44 rounded-xl overflow-hidden border border-border-soft dark:border-charcoal-700 bg-cream-100/60 dark:bg-charcoal-900 cursor-pointer group/img transition-all"
              title="Click to view full certificate"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cert.imageUrl}
                alt={`${cert.title} Certificate`}
                onError={() => setImageLoadError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-burgundy/40 dark:bg-charcoal-950/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-mono font-semibold backdrop-blur-[2px]">
                <Eye className="w-4 h-4" />
                <span>View Certificate</span>
              </div>
            </div>
          ) : null}

          {/* Title & Issuer */}
          <div>
            <Link href={`/certifications/${cert.slug}`} className="block">
              <h3 className="text-lg font-serif font-bold text-burgundy dark:text-cream group-hover:text-burgundy-500 dark:group-hover:text-rosegold transition-colors flex items-center justify-between gap-2">
                <span>{cert.title}</span>
                <ArrowUpRight className="w-4 h-4 text-rosegold group-hover:text-burgundy dark:group-hover:text-rosegold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </h3>
              <p className="text-xs text-rosegold-700 dark:text-rosegold font-semibold mt-0.5">{cert.issuer}</p>
            </Link>

            {/* Issue Date & Credential ID metadata */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-charcoal/60 dark:text-cream/60">
              {cert.issueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rosegold/80" />
                  <span>{cert.issueDate}</span>
                </span>
              )}
              {cert.credentialId && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-rosegold/80" />
                  <span>{cert.credentialId}</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {cert.description && (
            <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed line-clamp-3">
              {cert.description}
            </p>
          )}
        </div>

        {/* Footer Area */}
        <div className="pt-5 mt-5 border-t border-border-soft dark:border-charcoal-700 space-y-3">
          {cert.relatedSkills && cert.relatedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cert.relatedSkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] font-mono text-charcoal dark:text-cream/90 bg-cream-100 dark:bg-charcoal-700 px-2 py-0.5 rounded border border-border-soft dark:border-charcoal-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {cert.imageUrl && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-burgundy/10 dark:bg-rosegold/10 text-burgundy dark:text-rosegold hover:bg-burgundy hover:text-white dark:hover:bg-rosegold dark:hover:text-charcoal-900 font-medium text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Certificate</span>
                </button>
              )}

              <Link
                href={`/certifications/${cert.slug}`}
                className="text-xs text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream font-bold transition-colors"
              >
                Details →
              </Link>
            </div>

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-rosegold-700 dark:text-rosegold hover:text-burgundy dark:hover:text-cream font-medium transition-colors p-1"
                title="Verify Credential on Issuer Portal"
                aria-label={`Verify credential for ${cert.title}`}
              >
                <span>Verify</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {cert.imageUrl && (
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={cert.imageUrl}
          title={cert.title}
          issuer={cert.issuer}
          issueDate={cert.issueDate}
          credentialId={cert.credentialId}
          credentialUrl={cert.credentialUrl}
        />
      )}
    </>
  );
}
