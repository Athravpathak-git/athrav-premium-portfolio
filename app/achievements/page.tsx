import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAchievementsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { Trophy, Target, ArrowRight, Milestone, Sparkles } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Achievements & Milestones — Athrav Pathak',
  description:
    'Learning milestones, academic progress, and engineering achievements of Athrav Pathak, Aspiring AI Engineer.',
  path: '/achievements',
});

export default async function AchievementsPage() {
  const achievements = await getAchievementsList(true);

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-champagne-600" />
            <span>Progression Record</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Achievements & Milestones
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 max-w-2xl leading-relaxed">
            Tangible learning milestones, academic advancement in BCA, and technical progress documented transparently.
          </p>
        </div>

        {/* Milestones Timeline */}
        <div className="relative pl-6 sm:pl-8 border-l border-cream-300 dark:border-forest-700 space-y-10">
          {achievements.map((ach) => (
            <div key={ach.id} className="relative group">
              {/* Timeline node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-cream-50 dark:bg-forest-900 border-2 border-forest dark:border-champagne-400 flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-champagne-300" />
              </div>

              <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-7 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cream-200/80 dark:bg-forest-800 text-forest-700 dark:text-sage border border-cream-300 dark:border-forest-700">
                    {ach.category}
                  </span>
                  {ach.date && (
                    <span className="text-xs font-mono text-forest-600 dark:text-sage">{ach.date}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-forest dark:text-ivory tracking-tight">{ach.title}</h2>
                  {ach.issuer && (
                    <p className="text-xs font-semibold text-champagne-700 dark:text-champagne-300">{ach.issuer}</p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Engineering Vision Callout */}
        <div className="mt-16 p-8 rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 space-y-4 shadow-sm">
          <h3 className="text-xl font-bold text-forest dark:text-ivory flex items-center gap-2">
            <Target className="w-5 h-5 text-champagne-600" />
            <span>Immediate Growth Objectives (2026)</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-forest-700/90 dark:text-sage-100">
            <li className="flex items-start gap-2">
              <span className="text-champagne-700 dark:text-champagne-300 font-mono font-bold">01.</span>
              <span>Master transformer self-attention mechanisms and train mini-GPT models from scratch using PyTorch.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-champagne-700 dark:text-champagne-300 font-mono font-bold">02.</span>
              <span>Complete third-semester and fourth-semester BCA curriculum with strong conceptual rigor.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-champagne-700 dark:text-champagne-300 font-mono font-bold">03.</span>
              <span>Contribute to open-source developer tooling and machine learning repositories.</span>
            </li>
          </ul>
        </div>

        {/* Navigation Footer */}
        <div className="mt-16 pt-8 border-t border-cream-300/70 dark:border-forest-800 flex justify-between items-center">
          <Link
            href="/experience"
            className="text-xs font-mono font-medium text-forest-600 dark:text-sage hover:text-forest dark:hover:text-ivory transition-colors"
          >
            ← Experience & Internships
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
          >
            <span>View Technical Capabilities & Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
