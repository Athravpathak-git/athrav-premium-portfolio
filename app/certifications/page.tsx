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
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Award className="w-3.5 h-3.5" />
          <span>Structured Learning Credentials</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Certifications & Coursework
        </h1>
        <p className="text-base text-zinc-400 leading-relaxed">
          Completed and in-progress training curriculums across machine learning theory, software development,
          and artificial intelligence simulations.
        </p>
      </div>

      {/* Notice regarding unverified/draft coursework records */}
      <div className="mb-12 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-zinc-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
        <div className="text-center py-24 rounded-2xl border border-white/10 bg-zinc-950/60 p-8">
          <p className="text-zinc-400 text-sm">No certifications are currently published.</p>
        </div>
      )}
    </div>
  );
}
