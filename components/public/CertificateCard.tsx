import React from 'react';
import Link from 'next/link';
import { CertificationData } from '@/lib/mock-data';
import { Award, ArrowUpRight, ExternalLink } from 'lucide-react';

export function CertificateCard({ cert }: { cert: CertificationData }) {
  const isDraftRecord = !cert.credentialId && !cert.credentialUrl;

  return (
    <div className="group rounded-2xl border border-cream-300 dark:border-forest-700 hover:border-champagne-500 bg-ivory dark:bg-forest-900 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-full bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-forest-600 dark:text-sage">{cert.category}</span>
            {isDraftRecord && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-champagne-100 text-champagne-800 dark:bg-forest-800 dark:text-champagne-300 border border-champagne-300">
                Draft / Coursework Record
              </span>
            )}
          </div>
        </div>

        <Link href={`/certifications/${cert.slug}`} className="block">
          <h3 className="text-lg font-bold text-forest dark:text-ivory group-hover:text-forest-600 transition-colors flex items-center justify-between gap-2">
            <span>{cert.title}</span>
            <ArrowUpRight className="w-4 h-4 text-forest-500 group-hover:text-forest group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </h3>
          <p className="text-xs text-forest-600 dark:text-sage font-medium mt-0.5">{cert.issuer}</p>
        </Link>

        {cert.description && (
          <p className="text-xs text-forest-700/80 dark:text-sage-100 leading-relaxed line-clamp-3">
            {cert.description}
          </p>
        )}
      </div>

      <div className="pt-5 mt-5 border-t border-cream-300/60 dark:border-forest-800 space-y-3">
        {cert.relatedSkills && cert.relatedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cert.relatedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-mono text-forest-700 dark:text-sage bg-cream-200/60 dark:bg-forest-800 px-2 py-0.5 rounded border border-cream-300 dark:border-forest-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/certifications/${cert.slug}`}
            className="text-xs text-forest dark:text-champagne-300 hover:text-champagne-600 font-semibold"
          >
            Credential Details →
          </Link>

          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-500 hover:text-forest dark:text-sage dark:hover:text-ivory transition-colors p-1"
              title="Verify Credential"
              aria-label={`Verify credential for ${cert.title}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
