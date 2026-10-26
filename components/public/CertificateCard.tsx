import React from 'react';
import Link from 'next/link';
import { CertificationData } from '@/lib/mock-data';
import { Award, ArrowUpRight, ExternalLink } from 'lucide-react';

export function CertificateCard({ cert }: { cert: CertificationData }) {
  const isDraftRecord = !cert.credentialId && !cert.credentialUrl;

  return (
    <div className="group rounded-2xl border border-border-soft hover:border-rosegold bg-white p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_-6px_rgba(87,38,51,0.08)] hover:-translate-y-1">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-full bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-charcoal/70">{cert.category}</span>
            {isDraftRecord && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cream-100 text-burgundy border border-border-soft">
                Coursework Record
              </span>
            )}
          </div>
        </div>

        <Link href={`/certifications/${cert.slug}`} className="block">
          <h3 className="text-lg font-serif font-bold text-burgundy group-hover:text-burgundy-500 transition-colors flex items-center justify-between gap-2">
            <span>{cert.title}</span>
            <ArrowUpRight className="w-4 h-4 text-rosegold group-hover:text-burgundy group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </h3>
          <p className="text-xs text-rosegold font-semibold mt-0.5">{cert.issuer}</p>
        </Link>

        {cert.description && (
          <p className="text-xs text-charcoal/80 leading-relaxed line-clamp-3">
            {cert.description}
          </p>
        )}
      </div>

      <div className="pt-5 mt-5 border-t border-border-soft space-y-3">
        {cert.relatedSkills && cert.relatedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cert.relatedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-mono text-charcoal bg-cream-100 px-2 py-0.5 rounded border border-border-soft"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/certifications/${cert.slug}`}
            className="text-xs text-burgundy hover:text-rosegold font-bold"
          >
            Credential Details →
          </Link>

          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal/60 hover:text-burgundy transition-colors p-1"
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
