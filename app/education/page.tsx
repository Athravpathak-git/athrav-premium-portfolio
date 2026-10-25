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
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic Timeline</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Formal Computer Science Education
        </h1>
        <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
          Structured academic foundations in computer applications, programming paradigms, data structures, and database systems.
        </p>
      </div>

      {/* Structured Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l border-white/15 space-y-12">
        {educationList.map((edu, idx) => (
          <div key={edu.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-silver-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-silver-300" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-8 space-y-4 hover:border-white/20 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {edu.status}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Active Enrollment (Year 2)
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {edu.degree}
                </h2>
                <p className="text-sm font-medium text-silver-300">
                  {edu.institution}
                </p>
                {edu.fieldOfStudy && (
                  <p className="text-xs text-zinc-400 font-mono">
                    Specialization: {edu.fieldOfStudy}
                  </p>
                )}
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">
                {edu.description}
              </p>

              {/* Key coursework highlights */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
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
                      className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-md"
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
      <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
        <Link
          href="/about"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          ← About Biography
        </Link>
        <Link
          href="/skills"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-300 hover:text-white transition-colors"
        >
          <span>Explore Technical Skills</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
