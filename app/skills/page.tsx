import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSkillsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { SkillBadge } from '@/components/public/SkillBadge';
import { Cpu, ArrowRight, Code2, Globe, Database, Brain, Wrench } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Technical Skills & Tooling — Athrav Pathak',
  description:
    'Categorized technical skills, programming languages, and machine learning tools utilized by Athrav Pathak.',
  path: '/skills',
});

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Programming: <Code2 className="w-4 h-4 text-silver-300" />,
  'Web Development': <Globe className="w-4 h-4 text-silver-300" />,
  Databases: <Database className="w-4 h-4 text-silver-300" />,
  'Artificial Intelligence': <Brain className="w-4 h-4 text-silver-300" />,
  'Machine Learning': <Cpu className="w-4 h-4 text-silver-300" />,
  'Tools and Platforms': <Wrench className="w-4 h-4 text-silver-300" />,
};

export default async function SkillsPage() {
  const skills = await getSkillsList(true);

  // Group skills by category
  const categories = [
    'Programming',
    'Web Development',
    'Databases',
    'Artificial Intelligence',
    'Machine Learning',
    'Tools and Platforms',
  ];

  const groupedSkills = categories.map((cat) => ({
    name: cat,
    items: skills.filter((s) => s.category === cat),
  }));

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Cpu className="w-3.5 h-3.5" />
          <span>Competency Matrix</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Technical Skills & AI Stack
        </h1>
        <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
          Disciplined overview of programming languages, modern web frameworks, data persistence layers,
          and artificial intelligence tools currently in active practice and coursework.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
          <span className="text-zinc-400">Proficiency Indicators:</span>
          <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            Proficient (Solid implementation capability)
          </span>
          <span className="px-2.5 py-0.5 rounded-full border border-silver-400/20 bg-silver-400/10 text-silver-300">
            Intermediate (Active project usage)
          </span>
          <span className="px-2.5 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300">
            Exploring (Academic & coursework depth)
          </span>
        </div>
      </div>

      {/* Categorized Skills Sections */}
      <div className="space-y-14">
        {groupedSkills.map((group) => {
          if (group.items.length === 0) return null;
          return (
            <div key={group.name} className="space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                  {CATEGORY_ICONS[group.name] || <Code2 className="w-4 h-4 text-silver-300" />}
                </div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  {group.name}
                </h2>
                <span className="text-xs font-mono text-zinc-400 ml-auto">
                  {group.items.length} skills
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((skill) => (
                  <SkillBadge key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="mt-20 pt-8 border-t border-white/10 flex justify-between items-center">
        <Link
          href="/education"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          ← Academic Path (BCA)
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-300 hover:text-white transition-colors"
        >
          <span>Explore Projects Built With These Skills</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
