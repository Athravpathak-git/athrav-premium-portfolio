import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSkillsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { SkillBadge } from '@/components/public/SkillBadge';
import { Cpu, ArrowRight, Code2, Globe, Database, Brain, Wrench } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Technical Stack & Tooling — Athrav Pathak',
  description:
    'Categorized technical skills, programming languages, and machine learning tools utilized by Athrav Pathak.',
  path: '/skills',
});

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Programming: <Code2 className="w-4 h-4 text-burgundy dark:text-rosegold" />,
  'Web Development': <Globe className="w-4 h-4 text-burgundy dark:text-rosegold" />,
  Databases: <Database className="w-4 h-4 text-burgundy dark:text-rosegold" />,
  'Artificial Intelligence': <Brain className="w-4 h-4 text-burgundy dark:text-rosegold" />,
  'Machine Learning': <Cpu className="w-4 h-4 text-burgundy dark:text-rosegold" />,
  'Tools and Platforms': <Wrench className="w-4 h-4 text-burgundy dark:text-rosegold" />,
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
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-rosegold" />
            <span>Competency Matrix</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Technical Stack & Tooling
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 max-w-2xl leading-relaxed font-normal">
            Disciplined overview of programming languages, modern web frameworks, data persistence layers,
            and artificial intelligence tools currently in active practice and coursework.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="text-charcoal dark:text-cream font-semibold">Proficiency Indicators:</span>
            <span className="px-2.5 py-1 rounded-full border border-rosegold/40 dark:border-rosegold/50 bg-rosegold-50 dark:bg-rosegold-900/30 text-burgundy dark:text-rosegold font-medium">
              Proficient (Solid implementation capability)
            </span>
            <span className="px-2.5 py-1 rounded-full border border-border-soft dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-700 text-charcoal dark:text-cream font-medium">
              Intermediate (Active project usage)
            </span>
            <span className="px-2.5 py-1 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal/70 dark:text-cream/70 font-medium">
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
                <div className="flex items-center gap-2.5 pb-2 border-b border-border-soft dark:border-charcoal-700">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 flex items-center justify-center shadow-sm">
                    {CATEGORY_ICONS[group.name] || <Code2 className="w-4 h-4 text-burgundy dark:text-rosegold" />}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-burgundy dark:text-cream tracking-tight">
                    {group.name}
                  </h2>
                  <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70 ml-auto font-medium">
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
        <div className="mt-20 pt-8 border-t border-border-soft dark:border-charcoal-700 flex justify-between items-center">
          <Link
            href="/education"
            className="text-xs font-mono font-medium text-charcoal/70 dark:text-cream/70 hover:text-burgundy dark:hover:text-rosegold transition-colors"
          >
            ← Academic Path (BCA)
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
          >
            <span>Explore Projects Built With These Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
