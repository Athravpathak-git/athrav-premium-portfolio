import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getExperienceList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { Briefcase, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Experience & Internships — Athrav Pathak',
  description:
    'Internships, practical programs, and technical experience of Athrav Pathak, Aspiring AI Engineer.',
  path: '/experience',
});

export const dynamic = 'force-dynamic';

export default async function ExperiencePage() {
  const experiences = await getExperienceList(true);

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold-700 dark:text-rosegold shadow-sm">
            <Briefcase className="w-3.5 h-3.5 text-rosegold-700 dark:text-rosegold" />
            <span>Industry & Practical Programs</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Experience & Internships
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 max-w-2xl leading-relaxed font-normal">
            Technical internships and practical industry programs covering software engineering,
            programming problem-solving, and applied AI foundations.
          </p>
        </div>

        {/* Experience List */}
        <div className="space-y-10">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-8 space-y-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold text-burgundy dark:text-cream">{exp.role}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-rosegold-700 dark:text-rosegold font-semibold">{exp.company}</span>
                    {exp.companyUrl && (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-charcoal/60 dark:text-cream/60 hover:text-burgundy dark:hover:text-rosegold"
                        aria-label={`${exp.company} website`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-xs font-mono font-medium text-charcoal dark:text-cream bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 px-3 py-1 rounded-full">
                    {exp.employmentType} • {exp.workplaceType}
                  </span>
                </div>
              </div>

              <p className="text-sm text-charcoal/85 dark:text-cream/80 leading-relaxed">
                {exp.description}
              </p>

              {/* Responsibilities */}
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-burgundy dark:text-rosegold font-semibold">
                    Key Scope & Activities:
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-charcoal/85 dark:text-cream/80">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-burgundy dark:text-rosegold shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="pt-4 border-t border-border-soft dark:border-charcoal-700 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70 mr-2 font-medium">Technologies:</span>
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono text-charcoal dark:text-cream/90 bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 px-2.5 py-1 rounded-md"
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
        <div className="mt-16 pt-8 border-t border-border-soft dark:border-charcoal-700 flex justify-between items-center">
          <Link
            href="/certifications"
            className="text-xs font-mono font-medium text-charcoal/70 dark:text-cream/70 hover:text-burgundy dark:hover:text-rosegold transition-colors"
          >
            ← Certifications
          </Link>
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
          >
            <span>View Achievements & Milestones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
