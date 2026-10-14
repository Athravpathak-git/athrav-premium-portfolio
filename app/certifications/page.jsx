import React from 'react';
import { Award, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { getCertifications } from '@/lib/data.js';

export const metadata = {
  title: 'Certifications — Athrav Pathak',
  description: 'Verified professional certifications and technical credentials achieved by Athrav Pathak.',
};

export const revalidate = 60;

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="relative pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Award className="w-3.5 h-3.5 text-sky-400" />
          <span>Verified Credentials</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Certifications & <span className="font-normal text-metallic">Accreditations</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Professional certifications validating technical proficiency, cloud systems, and architectural standards.
        </p>
      </div>

      {/* Certifications List */}
      {certifications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {cert.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.imageUrl}
                          alt={cert.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                        <Award className="w-5 h-5 text-sky-400" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">{cert.issuer}</span>
                      {cert.issueDate && (
                        <span className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(cert.issueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-base font-medium text-white leading-snug">{cert.title}</h2>

                {cert.credentialId && (
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {cert.credentialId}
                  </p>
                )}
              </div>

              {cert.credentialUrl && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-panel text-center max-w-xl mx-auto space-y-3">
          <Award className="w-8 h-8 text-slate-500 mx-auto" />
          <h2 className="text-base font-medium text-white">Credentials In Verification</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verified certification entries are maintained in PostgreSQL and will appear here as approved through the administrative portal.
          </p>
        </div>
      )}
    </div>
  );
}
