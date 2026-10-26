import React from 'react';
import type { Metadata } from 'next';
import { getCertificationsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { CertificateCard } from '@/components/public/CertificateCard';
import { Award, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Certifications & Training — Athrav Pathak',
  description:
    'Academic and technical certifications across machine learning, software engineering, and data analytics.',
  path: '/certifications',
});

export default async function CertificationsPage() {
  const certifications = await getCertificationsList({ publishedOnly: true });

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Award className="w-3.5 h-3.5 text-champagne-600" />
            <span>Structured Learning Credentials</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Certifications & Coursework
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 leading-relaxed">
            Completed and in-progress training curriculums across machine learning theory, software development,
            and artificial intelligence simulations.
          </p>
        </div>

        {/* Notice regarding unverified/draft coursework records */}
        <div className="mb-12 p-4 rounded-xl border border-champagne-400 bg-champagne-50/70 dark:bg-forest-900 text-xs text-forest-800 dark:text-champagne-200 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-champagne-700 dark:text-champagne-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparency Notice:</strong> All initial certifications are preserved as editable draft records until exact credential verification IDs and links are added by the owner in the Admin Dashboard. No credentials are fabricated or presented as verified without supporting documentation.
          </p>
        </div>

        {/* Certifications Grid */}
        {certifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-8 shadow-sm">
            <p className="text-forest-600 dark:text-sage text-sm">No certifications are currently published.</p>
          </div>
        )}
      </div>
    </div>
  );
}
