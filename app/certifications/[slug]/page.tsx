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
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/certifications"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-forest-600 dark:text-sage hover:text-forest dark:hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Certifications</span>
          </Link>
        </div>

        {/* Main Details Box */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-8 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="w-12 h-12 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-medium text-forest-700 dark:text-sage uppercase tracking-wider px-3.5 py-1 rounded-full border border-cream-300 dark:border-forest-700 bg-cream-100 dark:bg-forest-800">
              {cert.category}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest dark:text-ivory">
              {cert.title}
            </h1>
            <p className="text-base text-champagne-700 dark:text-champagne-300 font-semibold">{cert.issuer}</p>
          </div>

          {/* Credential Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-cream-300/60 dark:border-forest-800 text-xs font-mono">
            <div>
              <span className="text-forest-600 dark:text-sage block mb-1">Verification Status:</span>
              {cert.credentialUrl ? (
                <span className="inline-flex items-center gap-1.5 text-forest dark:text-sage-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Online Credential</span>
                </span>
              ) : (
                <span className="text-champagne-800 dark:text-champagne-300 font-medium">
                  Draft / Coursework Record (Pending URL)
                </span>
              )}
            </div>

            <div>
              <span className="text-forest-600 dark:text-sage block mb-1">Credential ID:</span>
              <span className="font-semibold text-forest dark:text-ivory">
                {cert.credentialId || 'Unspecified (Editable in Admin)'}
              </span>
            </div>
          </div>

          {/* Narrative Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-forest dark:text-ivory">Curriculum & Scope</h3>
            <p className="text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed whitespace-pre-line">
              {cert.description || 'No detailed syllabus summary currently entered.'}
            </p>
          </div>

          {/* Related Skills */}
          {cert.relatedSkills && cert.relatedSkills.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-cream-300/60 dark:border-forest-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-forest-600 dark:text-sage font-medium">
                Associated Technical Competencies:
              </h3>
              <div className="flex flex-wrap gap-2">
                {cert.relatedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-mono text-forest-700 dark:text-sage bg-cream-200/70 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 px-3 py-1 rounded-md"
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest hover:bg-forest-600 text-ivory font-bold text-xs transition-colors shadow-md"
              >
                <span>Verify Credential on Issuer Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Other Certifications */}
        {otherCerts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-cream-300/70 dark:border-forest-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-600 dark:text-sage font-mono">
              Other Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherCerts.map((c) => (
                <Link
                  key={c.id}
                  href={`/certifications/${c.slug}`}
                  className="p-4 rounded-xl border border-cream-300 dark:border-forest-700 hover:border-champagne-500 bg-ivory dark:bg-forest-900 block shadow-sm hover:shadow-md transition-all"
                >
                  <h4 className="text-sm font-bold text-forest dark:text-ivory">{c.title}</h4>
                  <p className="text-xs text-forest-600 dark:text-sage font-mono mt-0.5">{c.issuer}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
