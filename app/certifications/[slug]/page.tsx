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
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { CertificateImagePreview } from '@/components/public/CertificateImagePreview';

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
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/certifications"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-charcoal/70 dark:text-cream/70 hover:text-burgundy dark:hover:text-rosegold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Certifications</span>
          </Link>
        </div>

        {/* Main Details Box */}
        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-8 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="w-12 h-12 rounded-xl bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center text-burgundy dark:text-rosegold shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-medium text-charcoal/80 dark:text-cream/80 uppercase tracking-wider px-3.5 py-1 rounded-full border border-border-soft dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-700">
              {cert.category}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
              {cert.title}
            </h1>
            <p className="text-base text-rosegold font-semibold">{cert.issuer}</p>
          </div>

          {/* Certificate Image Preview Section */}
          {cert.imageUrl && (
            <div className="py-2">
              <CertificateImagePreview
                imageUrl={cert.imageUrl}
                title={cert.title}
                issuer={cert.issuer}
                issueDate={cert.issueDate}
                credentialId={cert.credentialId}
                credentialUrl={cert.credentialUrl}
              />
            </div>
          )}

          {/* Credential Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-border-soft dark:border-charcoal-700 text-xs font-mono">
            <div>
              <span className="text-charcoal/70 dark:text-cream/70 block mb-1">Verification Status:</span>
              {cert.credentialUrl ? (
                <span className="inline-flex items-center gap-1.5 text-burgundy dark:text-rosegold font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Online Credential</span>
                </span>
              ) : (
                <span className="text-charcoal/70 dark:text-cream/70 font-medium">
                  Draft / Coursework Record (Pending URL)
                </span>
              )}
            </div>

            <div>
              <span className="text-charcoal/70 dark:text-cream/70 block mb-1">Credential ID:</span>
              <span className="font-semibold text-burgundy dark:text-cream">
                {cert.credentialId || 'Unspecified (Editable in Admin)'}
              </span>
            </div>

            {cert.issueDate && (
              <div>
                <span className="text-charcoal/70 dark:text-cream/70 block mb-1">Issue Date:</span>
                <span className="font-semibold text-burgundy dark:text-cream flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rosegold" />
                  {cert.issueDate}
                </span>
              </div>
            )}
          </div>

          {/* Narrative Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-burgundy dark:text-cream">Curriculum & Scope</h3>
            <p className="text-sm text-charcoal/85 dark:text-cream/80 leading-relaxed whitespace-pre-line">
              {cert.description || 'No detailed syllabus summary currently entered.'}
            </p>
          </div>

          {/* Related Skills */}
          {cert.relatedSkills && cert.relatedSkills.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border-soft dark:border-charcoal-700">
              <h3 className="text-xs font-mono uppercase tracking-wider text-burgundy dark:text-rosegold font-semibold">
                Associated Technical Competencies:
              </h3>
              <div className="flex flex-wrap gap-2">
                {cert.relatedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-mono text-charcoal dark:text-cream/90 bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 px-3 py-1 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Verification Button */}
          {cert.credentialUrl && (
            <div className="pt-4 border-t border-border-soft dark:border-charcoal-700">
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>Verify Credential on Issuer Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Other Certifications */}
        {otherCerts.length > 0 && (
          <div className="mt-14 space-y-4">
            <h3 className="text-xl font-serif font-bold text-burgundy dark:text-cream">Other Certifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherCerts.map((other) => (
                <Link
                  key={other.id}
                  href={`/certifications/${other.slug}`}
                  className="p-5 rounded-xl border border-border-soft hover:border-rosegold dark:border-charcoal-700 dark:hover:border-rosegold bg-white dark:bg-charcoal-800 transition-all flex justify-between items-center shadow-sm hover:shadow-md"
                >
                  <div>
                    <h4 className="text-sm font-serif font-bold text-burgundy dark:text-cream">{other.title}</h4>
                    <p className="text-xs text-charcoal/70 dark:text-cream/70 font-mono mt-0.5">{other.issuer}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-rosegold">View →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
