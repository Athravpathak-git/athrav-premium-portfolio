import React from 'react';
import type { Metadata } from 'next';
import { getCertificationsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { CertificateCard } from '@/components/public/CertificateCard';
import { Award, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Certifications & Coursework — Athrav Pathak',
  description:
    'Academic and technical certifications across machine learning, software engineering, and data analytics.',
  path: '/certifications',
});

export default async function CertificationsPage() {
  const certifications = await getCertificationsList({ publishedOnly: true });

  return (
    <div className="min-h-screen bg-cream text-charcoal pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft bg-white text-xs font-mono text-rosegold shadow-sm">
            <Award className="w-3.5 h-3.5 text-rosegold" />
            <span>Structured Learning Credentials</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy">
            Certifications & Coursework
          </h1>
          <p className="text-base text-charcoal/80 leading-relaxed font-normal">
            Completed and in-progress training curriculums across machine learning theory, software development,
            and artificial intelligence simulations.
          </p>
        </div>

        {/* Notice regarding unverified/draft coursework records */}
        <div className="mb-12 p-4 rounded-xl border border-border-soft bg-white text-xs text-charcoal/85 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-rosegold shrink-0 mt-0.5" />
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
          <div className="text-center py-24 rounded-2xl border border-border-soft bg-white p-8 shadow-sm">
            <p className="text-charcoal/70 text-sm">No certifications are currently published.</p>
          </div>
        )}
      </div>
    </div>
  );
}
