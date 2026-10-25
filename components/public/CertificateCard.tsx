import React from 'react';
import Link from 'next/link';
import { CertificationData } from '@/lib/mock-data';
import { Award, ArrowUpRight, ExternalLink } from 'lucide-react';

export function CertificateCard({ cert }: { cert: CertificationData }) {
  const isDraftRecord = !cert.credentialId && !cert.credentialUrl;

  return (
    <div className="group rounded-2xl border border-white/10 hover:border-white/25 bg-zinc-950/70 backdrop-blur-xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center text-silver-300">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">{cert.category}</span>
            {isDraftRecord && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Draft / Coursework Record
              </span>
            )}
          </div>
        </div>

        <Link href={`/certifications/${cert.slug}`} className="block">
          <h3 className="text-lg font-semibold text-white group-hover:text-silver-200 transition-colors flex items-center justify-between gap-2">
            <span>{cert.title}</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{cert.issuer}</p>
        </Link>

        {cert.description && (
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
            {cert.description}
          </p>
        )}
      </div>

      <div className="pt-5 mt-5 border-t border-white/10 space-y-3">
        {cert.relatedSkills && cert.relatedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cert.relatedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-white/5"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/certifications/${cert.slug}`}
            className="text-xs text-silver-300 hover:text-white font-medium"
          >
            Credential Details →
          </Link>

          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1"
            >
              <span>Verify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
