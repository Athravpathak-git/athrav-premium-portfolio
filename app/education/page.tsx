import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getEducationList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { GraduationCap, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Education & Academic Path — Athrav Pathak',
  description:
    'Academic timeline and computer science education of Athrav Pathak, currently pursuing Bachelor of Computer Applications (BCA) in second year.',
  path: '/education',
});

export default async function EducationPage() {
  const educationList = await getEducationList(true);

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold-700 dark:text-rosegold shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-rosegold-700 dark:text-rosegold" />
            <span>Academic Timeline</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Formal Computer Science Education
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 max-w-2xl leading-relaxed font-normal">
            Structured academic foundations in computer applications, programming paradigms, data structures, and database systems.
          </p>
        </div>

        {/* Structured Timeline */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-border-soft dark:border-charcoal-700 space-y-12">
          {educationList.map((edu) => (
            <div key={edu.id} className="relative group">
              {/* Timeline node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-cream dark:bg-charcoal-900 border-2 border-burgundy dark:border-rosegold flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rosegold" />
              </div>

              <div className="editorial-card rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 text-burgundy dark:text-cream">
                    {edu.status}
                  </span>
                  <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70 font-medium">
                    Active Enrollment (Year 2)
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold text-burgundy dark:text-cream tracking-tight">
                    {edu.degree}
                  </h2>
                  <p className="text-sm font-semibold text-rosegold-700 dark:text-rosegold">
                    {edu.institution}
                  </p>
                  {edu.fieldOfStudy && (
                    <p className="text-xs text-charcoal/70 dark:text-cream/70 font-mono">
                      Specialization: {edu.fieldOfStudy}
                    </p>
                  )}
                </div>

                <p className="text-sm text-charcoal/85 dark:text-cream/80 leading-relaxed">
                  {edu.description}
                </p>

                {/* Key coursework highlights */}
                <div className="pt-3 border-t border-border-soft dark:border-charcoal-700 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-burgundy dark:text-rosegold font-semibold">
                    Core Subjects & Study Areas:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Object-Oriented Programming (C++/Python)',
                      'Relational Database Management (RDBMS/SQL)',
                      'Data Structures & Algorithms',
                      'Computer Architecture & OS',
                      'Web Application Development',
                      'Discrete Mathematics',
                    ].map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] font-mono text-charcoal dark:text-cream/90 bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 px-2.5 py-1 rounded-md"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation link to skills */}
        <div className="mt-16 pt-8 border-t border-border-soft dark:border-charcoal-700 flex justify-between items-center">
          <Link
            href="/about"
            className="text-xs font-mono font-medium text-charcoal/70 dark:text-cream/70 hover:text-burgundy dark:hover:text-rosegold transition-colors"
          >
            ← About Biography
          </Link>
          <Link
            href="/skills"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
          >
            <span>Explore Technical Stack</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
