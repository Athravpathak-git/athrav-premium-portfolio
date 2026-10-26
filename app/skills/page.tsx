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
  Programming: <Code2 className="w-4 h-4 text-burgundy" />,
  'Web Development': <Globe className="w-4 h-4 text-burgundy" />,
  Databases: <Database className="w-4 h-4 text-burgundy" />,
  'Artificial Intelligence': <Brain className="w-4 h-4 text-burgundy" />,
  'Machine Learning': <Cpu className="w-4 h-4 text-burgundy" />,
  'Tools and Platforms': <Wrench className="w-4 h-4 text-burgundy" />,
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
    <div className="min-h-screen bg-cream text-charcoal pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft bg-white text-xs font-mono text-rosegold shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-rosegold" />
            <span>Competency Matrix</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy">
            Technical Stack & Tooling
          </h1>
          <p className="text-base text-charcoal/80 max-w-2xl leading-relaxed font-normal">
            Disciplined overview of programming languages, modern web frameworks, data persistence layers,
            and artificial intelligence tools currently in active practice and coursework.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="text-charcoal font-semibold">Proficiency Indicators:</span>
            <span className="px-2.5 py-1 rounded-full border border-rosegold/40 bg-rosegold-50 text-burgundy font-medium">
              Proficient (Solid implementation capability)
            </span>
            <span className="px-2.5 py-1 rounded-full border border-border-soft bg-cream-100 text-charcoal font-medium">
              Intermediate (Active project usage)
            </span>
            <span className="px-2.5 py-1 rounded-full border border-border-soft bg-white text-charcoal/70 font-medium">
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
                <div className="flex items-center gap-2.5 pb-2 border-b border-border-soft">
                  <div className="w-8 h-8 rounded-lg bg-white border border-border-soft flex items-center justify-center shadow-sm">
                    {CATEGORY_ICONS[group.name] || <Code2 className="w-4 h-4 text-burgundy" />}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-burgundy tracking-tight">
                    {group.name}
                  </h2>
                  <span className="text-xs font-mono text-charcoal/70 ml-auto font-medium">
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
        <div className="mt-20 pt-8 border-t border-border-soft flex justify-between items-center">
          <Link
            href="/education"
            className="text-xs font-mono font-medium text-charcoal/70 hover:text-burgundy transition-colors"
          >
            ← Academic Path (BCA)
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy hover:text-rosegold transition-colors"
          >
            <span>Explore Projects Built With These Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
