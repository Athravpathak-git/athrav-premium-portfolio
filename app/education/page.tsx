import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getEducationList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { GraduationCap, Calendar, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Education & Academic Path — Athrav Pathak',
  description:
    'Academic timeline and computer science education of Athrav Pathak, currently pursuing Bachelor of Computer Applications (BCA) in second year.',
  path: '/education',
});

export default async function EducationPage() {
  const educationList = await getEducationList(true);

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-champagne-600" />
            <span>Academic Timeline</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Formal Computer Science Education
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 max-w-2xl leading-relaxed">
            Structured academic foundations in computer applications, programming paradigms, data structures, and database systems.
          </p>
        </div>

        {/* Structured Timeline */}
        <div className="relative pl-6 sm:pl-8 border-l border-cream-300 dark:border-forest-700 space-y-12">
          {educationList.map((edu) => (
            <div key={edu.id} className="relative group">
              {/* Timeline node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-cream-50 dark:bg-forest-900 border-2 border-forest dark:border-champagne-400 flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-champagne-300" />
              </div>

              <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-sage-100 dark:bg-forest-800 border border-sage-300 dark:border-forest-600 text-forest dark:text-champagne-300">
                    {edu.status}
                  </span>
                  <span className="text-xs font-mono text-forest-600 dark:text-sage font-medium">
                    Active Enrollment (Year 2)
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-forest dark:text-ivory tracking-tight">
                    {edu.degree}
                  </h2>
                  <p className="text-sm font-semibold text-champagne-700 dark:text-champagne-300">
                    {edu.institution}
                  </p>
                  {edu.fieldOfStudy && (
                    <p className="text-xs text-forest-600 dark:text-sage font-mono">
                      Specialization: {edu.fieldOfStudy}
                    </p>
                  )}
                </div>

                <p className="text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed">
                  {edu.description}
                </p>

                {/* Key coursework highlights */}
                <div className="pt-3 border-t border-cream-300/60 dark:border-forest-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-forest-600 dark:text-sage font-medium">
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
                        className="text-[11px] font-mono text-forest-700 dark:text-sage bg-cream-200/70 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 px-2.5 py-1 rounded-md"
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
        <div className="mt-16 pt-8 border-t border-cream-300/70 dark:border-forest-800 flex justify-between items-center">
          <Link
            href="/about"
            className="text-xs font-mono font-medium text-forest-600 dark:text-sage hover:text-forest dark:hover:text-ivory transition-colors"
          >
            ← About Biography
          </Link>
          <Link
            href="/skills"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
          >
            <span>Explore Technical Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
