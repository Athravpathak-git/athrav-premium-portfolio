import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAchievementsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { Trophy, Target, ArrowRight } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Achievements & Milestones — Athrav Pathak',
  description:
    'Learning milestones, academic progress, and engineering achievements of Athrav Pathak, Aspiring AI Engineer.',
  path: '/achievements',
});

export default async function AchievementsPage() {
  const achievements = await getAchievementsList(true);

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-rosegold" />
            <span>Progression Record</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Achievements & Milestones
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 max-w-2xl leading-relaxed font-normal">
            Tangible learning milestones, academic advancement in BCA, and technical progress documented transparently.
          </p>
        </div>

        {/* Milestones Timeline */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-border-soft dark:border-charcoal-700 space-y-10">
          {achievements.map((ach) => (
            <div key={ach.id} className="relative group">
              {/* Timeline node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-cream dark:bg-charcoal-900 border-2 border-burgundy dark:border-rosegold flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rosegold" />
              </div>

              <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 sm:p-7 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cream-100 dark:bg-charcoal-700 text-burgundy dark:text-cream border border-border-soft dark:border-charcoal-600">
                    {ach.category}
                  </span>
                  {ach.date && (
                    <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70">{ach.date}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-bold text-burgundy dark:text-cream tracking-tight">{ach.title}</h2>
                  {ach.issuer && (
                    <p className="text-xs font-semibold text-rosegold">{ach.issuer}</p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Engineering Vision Callout */}
        <div className="mt-16 p-8 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 space-y-4 shadow-sm">
          <h3 className="text-xl font-serif font-bold text-burgundy dark:text-cream flex items-center gap-2">
            <Target className="w-5 h-5 text-rosegold" />
            <span>Immediate Growth Objectives</span>
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-charcoal/85 dark:text-cream/80">
            <li className="flex items-start gap-2">
              <span className="text-rosegold font-mono font-bold">01.</span>
              <span>Master transformer self-attention mechanisms and train mini-GPT models from scratch using PyTorch.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rosegold font-mono font-bold">02.</span>
              <span>Complete third-semester and fourth-semester BCA curriculum with strong conceptual rigor.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rosegold font-mono font-bold">03.</span>
              <span>Contribute to open-source developer tooling and machine learning repositories.</span>
            </li>
          </ul>
        </div>

        {/* Navigation Footer */}
        <div className="mt-16 pt-8 border-t border-border-soft dark:border-charcoal-700 flex justify-between items-center">
          <Link
            href="/experience"
            className="text-xs font-mono font-medium text-charcoal/70 dark:text-cream/70 hover:text-burgundy dark:hover:text-rosegold transition-colors"
          >
            ← Experience & Internships
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
          >
            <span>Explore Technical Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
