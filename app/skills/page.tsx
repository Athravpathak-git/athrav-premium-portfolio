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
  Programming: <Code2 className="w-4 h-4 text-forest dark:text-champagne-300" />,
  'Web Development': <Globe className="w-4 h-4 text-forest dark:text-champagne-300" />,
  Databases: <Database className="w-4 h-4 text-forest dark:text-champagne-300" />,
  'Artificial Intelligence': <Brain className="w-4 h-4 text-forest dark:text-champagne-300" />,
  'Machine Learning': <Cpu className="w-4 h-4 text-forest dark:text-champagne-300" />,
  'Tools and Platforms': <Wrench className="w-4 h-4 text-forest dark:text-champagne-300" />,
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
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-champagne-600" />
            <span>Competency Matrix</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Technical Skills & AI Stack
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 max-w-2xl leading-relaxed">
            Disciplined overview of programming languages, modern web frameworks, data persistence layers,
            and artificial intelligence tools currently in active practice and coursework.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="text-forest-600 dark:text-sage font-medium">Proficiency Indicators:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-sage-400 bg-sage-100/70 text-forest dark:bg-forest-800 dark:text-ivory">
              Proficient (Solid implementation capability)
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-champagne-300 bg-champagne-50 text-champagne-800 dark:bg-forest-800 dark:text-champagne-300">
              Intermediate (Active project usage)
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-cream-300 bg-cream-100 text-forest-600 dark:bg-forest-800 dark:text-sage-200">
              Exploring (Academic depth)
            </span>
          </div>
        </div>

        {/* Categorized Skills Sections */}
        <div className="space-y-14">
          {groupedSkills.map((group) => {
            if (group.items.length === 0) return null;
            return (
              <div key={group.name} className="space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-cream-300/70 dark:border-forest-800">
                  <div className="w-8 h-8 rounded-lg bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center shadow-inner">
                    {CATEGORY_ICONS[group.name] || <Code2 className="w-4 h-4 text-forest dark:text-champagne-300" />}
                  </div>
                  <h2 className="text-xl font-bold text-forest dark:text-ivory tracking-tight">
                    {group.name}
                  </h2>
                  <span className="text-xs font-mono text-forest-600 dark:text-sage ml-auto font-medium">
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
        <div className="mt-20 pt-8 border-t border-cream-300/70 dark:border-forest-800 flex justify-between items-center">
          <Link
            href="/education"
            className="text-xs font-mono font-medium text-forest-600 dark:text-sage hover:text-forest dark:hover:text-ivory transition-colors"
          >
            ← Academic Path (BCA)
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
          >
            <span>Explore Projects Built With These Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
