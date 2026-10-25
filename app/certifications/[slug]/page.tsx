import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCertificationBySlug, getCertificationsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import {
  ArrowLeft,
  Award,
  ExternalLink,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface CertPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CertPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cert = await getCertificationBySlug(slug, true);
  if (!cert) {
    return constructMetadata({ title: 'Certification Not Found' });
  }

  return constructMetadata({
    title: `${cert.title} — Certification Details`,
    description: cert.description || `Certification details for ${cert.title} by ${cert.issuer}`,
    path: `/certifications/${cert.slug}`,
  });
}

export default async function CertificationDetailPage({ params }: CertPageProps) {
  const { slug } = await params;
  const cert = await getCertificationBySlug(slug, true);

  if (!cert) {
    notFound();
  }

  const allCerts = await getCertificationsList({ publishedOnly: true });
  const otherCerts = allCerts.filter((c) => c.slug !== cert.slug).slice(0, 2);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href="/certifications"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Certifications</span>
        </Link>
      </div>

      {/* Main Details Box */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-8 sm:p-10 space-y-8 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/15 flex items-center justify-center text-silver-300">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider px-3 py-1 rounded-full border border-white/10 bg-zinc-900">
            {cert.category}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {cert.title}
          </h1>
          <p className="text-base text-silver-300 font-medium">{cert.issuer}</p>
        </div>

        {/* Credential Metadata Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-white/10 text-xs font-mono">
          <div>
            <span className="text-zinc-400 block mb-1">Verification Status:</span>
            {cert.credentialUrl ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Online Credential</span>
              </span>
            ) : (
              <span className="text-amber-400">
                Draft / Coursework Record (Pending URL)
              </span>
            )}
          </div>

          <div>
            <span className="text-zinc-400 block mb-1">Credential ID:</span>
            <span className="text-zinc-300">
              {cert.credentialId || 'Unspecified (Editable in Admin)'}
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Curriculum & Scope</h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {cert.description || 'No detailed syllabus summary currently entered.'}
          </p>
        </div>

        {/* Related Skills */}
        {cert.relatedSkills && cert.relatedSkills.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Associated Technical Competencies:
            </h3>
            <div className="flex flex-wrap gap-2">
              {cert.relatedSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-mono text-zinc-300 bg-zinc-900 border border-white/10 px-3 py-1 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Verification Link Action */}
        {cert.credentialUrl && (
          <div className="pt-4">
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-lg shadow-white/10"
            >
              <span>Verify Credential on Issuer Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Other Certifications */}
      {otherCerts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-white/10 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Other Credentials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherCerts.map((c) => (
              <Link
                key={c.id}
                href={`/certifications/${c.slug}`}
                className="p-4 rounded-xl border border-white/10 hover:border-white/20 bg-zinc-950/60 block"
              >
                <h4 className="text-sm font-medium text-white">{c.title}</h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{c.issuer}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
