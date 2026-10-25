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
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Trophy className="w-3.5 h-3.5" />
          <span>Progression Record</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Achievements & Milestones
        </h1>
        <p className="text-base text-zinc-400 max-w-2xl leading-relaxed">
          Tangible learning milestones, academic advancement in BCA, and technical progress documented transparently.
        </p>
      </div>

      {/* Milestones Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l border-white/15 space-y-10">
        {achievements.map((ach) => (
          <div key={ach.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-silver-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-silver-300" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-7 space-y-3 hover:border-white/20 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-silver-300 border border-white/10">
                  {ach.category}
                </span>
                {ach.date && (
                  <span className="text-xs font-mono text-zinc-400">{ach.date}</span>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">{ach.title}</h2>
                {ach.issuer && (
                  <p className="text-xs font-medium text-silver-300">{ach.issuer}</p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {ach.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Engineering Vision Callout */}
      <div className="mt-16 p-8 rounded-2xl border border-white/10 bg-zinc-950/80 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-silver-300" />
          <span>Immediate Growth Objectives (2026)</span>
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
          <li className="flex items-start gap-2">
            <span className="text-silver-400 font-mono">01.</span>
            <span>Master transformer self-attention mechanisms and train mini-GPT models from scratch using PyTorch.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-silver-400 font-mono">02.</span>
            <span>Complete third-semester and fourth-semester BCA curriculum with strong conceptual rigor.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-silver-400 font-mono">03.</span>
            <span>Contribute to open-source developer tooling and machine learning repositories.</span>
          </li>
        </ul>
      </div>

      {/* Navigation Footer */}
      <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
        <Link
          href="/experience"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          ← Experience & Internships
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-300 hover:text-white transition-colors"
        >
          <span>View Technical Capabilities & Services</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
