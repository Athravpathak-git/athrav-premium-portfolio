import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfile } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import {
  Brain,
  GraduationCap,
  Target,
  Compass,
  Cpu,
  Github,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = constructMetadata({
  title: 'About Athrav Pathak — Aspiring AI Engineer',
  description:
    'Learn about Athrav Pathak, a second-year BCA student passionate about artificial intelligence, machine learning algorithms, and engineering intelligent digital systems.',
  path: '/about',
});

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Biography & Vision</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          About Athrav Pathak
        </h1>
        <p className="text-lg text-silver-300 font-medium">
          {profile.headline}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Column: Portrait Fallback & Profile Attributes */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl space-y-6">
            {/* Portrait / Fallback Avatar */}
            {profile.avatarUrl ? (
              <div className="space-y-4">
                <div className="w-full aspect-square rounded-2xl border border-white/20 bg-zinc-900 overflow-hidden relative shadow-2xl shadow-black/80 group">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-md">{profile.name}</h2>
                    <p className="text-xs font-mono text-silver-300 drop-shadow">BCA Undergraduate • Year 2</p>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Current Status:</span>
                  <span className="text-xs font-mono text-emerald-400 font-medium">
                    {profile.status || 'Open to Opportunities'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/15 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-inner">
                <div className="w-20 h-20 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center mb-3 text-silver-300">
                  <Brain className="w-10 h-10" />
                </div>
                <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">BCA Undergraduate • Year 2</p>
                <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                  {profile.status || 'Open to Opportunities'}
                </div>
              </div>
            )}

            {/* Quick Context Facts */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Current Degree:</span>
                <span className="text-zinc-200">BCA (Second Year)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Focus Area:</span>
                <span className="text-zinc-200">Artificial Intelligence & ML</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Primary Languages:</span>
                <span className="text-zinc-200">Python, TypeScript, SQL</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Location:</span>
                <span className="text-zinc-200">{profile.location || 'India'}</span>
              </div>
            </div>

            {/* Links */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={profile.githubUrl || 'https://github.com/Athravpathak-git'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Profile</span>
              </a>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-silver-100 text-xs font-semibold text-zinc-950 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Athrav</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Biography & Goals */}
        <div className="md:col-span-7 space-y-10 text-zinc-300 leading-relaxed text-sm sm:text-base">
          {/* Section 1: Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-silver-300" />
              <span>Who I Am</span>
            </h2>
            <p>
              I am Athrav Pathak, an aspiring AI engineer currently pursuing my Bachelor of Computer Applications (BCA) in my second year.
              My curiosity revolves around how computing machines can emulate, assist, and augment human reasoning through statistical learning and algorithmic intelligence.
            </p>
            <p className="text-zinc-400">
              {profile.bio}
            </p>
          </section>

          {/* Section 2: Learning Journey & Foundations */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-silver-300" />
              <span>Academic Progression & Learning Journey</span>
            </h2>
            <p>
              My academic journey began with foundational computer science paradigms: understanding computer organization, operating systems, relational database normalization, and data structures.
            </p>
            <p>
              As I transitioned into my second year of BCA, I directed my extracurricular study towards machine learning. Starting with classical regression and classification models in Scikit-Learn, I have been building a rigorous intuition for cost function minimization, matrix calculus, and neural network architectures in PyTorch.
            </p>
          </section>

          {/* Section 3: Engineering Mindset */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-silver-300" />
              <span>Problem-Solving Mindset</span>
            </h2>
            <p>
              I believe great AI engineering demands more than just training models—it requires delivering reliable software. An intelligent algorithm is only as effective as the latency, accessibility, and resilience of the system that serves it.
            </p>
            <p>
              Hence, I pair my artificial intelligence coursework with rigorous full-stack web engineering: building strict type-safe APIs with TypeScript and Next.js, modeling relational schemas in PostgreSQL, and designing user interfaces that communicate clearly.
            </p>
          </section>

          {/* Section 4: Long-Term Career Vision */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-silver-300" />
              <span>Career Goals & Professional Vision</span>
            </h2>
            <p>
              My immediate objective is to secure competitive software and machine learning internships where I can contribute to production systems, learn from experienced engineering teams, and solve meaningful real-world challenges.
            </p>
            <p>
              Long-term, I aspire to engineer intelligent systems that automate tedious cognitive workflows and unlock high-leverage digital productivity for people worldwide.
            </p>

            <div className="pt-4">
              <Link
                href="/education"
                className="inline-flex items-center gap-2 text-sm font-semibold text-silver-300 hover:text-white"
              >
                <span>Explore my structured education timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
