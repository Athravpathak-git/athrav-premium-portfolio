import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getExperienceList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { Briefcase, ArrowRight, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Experience & Internships — Athrav Pathak',
  description:
    'Internships, practical programs, and technical experience of Athrav Pathak, Aspiring AI Engineer.',
  path: '/experience',
});

export default async function ExperiencePage() {
  const experiences = await getExperienceList(true);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Industry & Practical Programs</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Experience & Internships
        </h1>
        <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
          Technical internships and practical industry programs covering software engineering,
          programming problem-solving, and applied AI foundations.
        </p>
      </div>

      {/* Experience List */}
      <div className="space-y-10">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-8 space-y-6 hover:border-white/20 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{exp.role}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-base text-silver-300 font-medium">{exp.company}</span>
                  {exp.companyUrl && (
                    <a
                      href={exp.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white"
                      aria-label={`${exp.company} website`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-mono text-zinc-300 bg-zinc-900 border border-white/10 px-3 py-1 rounded-full">
                  {exp.employmentType} • {exp.workplaceType}
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {exp.description}
            </p>

            {/* Responsibilities */}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Key Scope & Activities:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-silver-400 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {exp.technologies && exp.technologies.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 mr-2">Technologies:</span>
                {exp.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono text-zinc-200 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
        <Link
          href="/certifications"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          ← Certifications
        </Link>
        <Link
          href="/achievements"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-300 hover:text-white transition-colors"
        >
          <span>View Achievements & Milestones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
