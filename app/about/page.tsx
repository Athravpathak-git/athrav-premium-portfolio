import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfile } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { ProfilePortrait } from '@/components/public/ProfilePortrait';
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
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
            <span>Biography & Vision</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            About Athrav Pathak
          </h1>
          <p className="text-lg text-champagne-700 dark:text-champagne-300 font-semibold">
            {profile.headline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Column: Portrait & Profile Attributes */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 shadow-sm space-y-6">
              {/* Portrait / Fallback Avatar */}
              <ProfilePortrait
                avatarUrl={profile.avatarUrl}
                name={profile.name}
                status={profile.status}
                headline="BCA Undergraduate • Year 2"
              />

              {/* Quick Context Facts */}
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-cream-300/60 dark:border-forest-800">
                  <span className="text-forest-600 dark:text-sage">Current Degree:</span>
                  <span className="font-semibold text-forest dark:text-ivory">BCA (Second Year)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-cream-300/60 dark:border-forest-800">
                  <span className="text-forest-600 dark:text-sage">Focus Area:</span>
                  <span className="font-semibold text-forest dark:text-ivory">Artificial Intelligence & ML</span>
                </div>
                <div className="flex justify-between py-2 border-b border-cream-300/60 dark:border-forest-800">
                  <span className="text-forest-600 dark:text-sage">Primary Languages:</span>
                  <span className="font-semibold text-forest dark:text-ivory">Python, TypeScript, SQL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-cream-300/60 dark:border-forest-800">
                  <span className="text-forest-600 dark:text-sage">Location:</span>
                  <span className="font-semibold text-forest dark:text-ivory">{profile.location || 'India'}</span>
                </div>
              </div>

              {/* Links */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={profile.githubUrl || 'https://github.com/Athravpathak-git'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cream-200 dark:bg-forest-800 hover:bg-cream-300 border border-cream-300 dark:border-forest-700 text-xs font-mono font-semibold text-forest dark:text-ivory transition-colors shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Profile</span>
                </a>
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-600 text-xs font-bold text-ivory transition-colors shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Athrav</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Biography & Goals */}
          <div className="md:col-span-7 space-y-10 text-forest-700/90 dark:text-sage-100 leading-relaxed text-sm sm:text-base">
            {/* Section 1: Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-forest dark:text-ivory flex items-center gap-2">
                <Cpu className="w-5 h-5 text-champagne-600" />
                <span>Who I Am</span>
              </h2>
              <p>
                I am Athrav Pathak, an aspiring AI engineer currently pursuing my Bachelor of Computer Applications (BCA) in my second year.
                My curiosity revolves around how computing machines can emulate, assist, and augment human reasoning through statistical learning and algorithmic intelligence.
              </p>
              <p className="text-forest-600 dark:text-sage">
                {profile.bio}
              </p>
            </section>

            {/* Section 2: Learning Journey & Foundations */}
            <section className="space-y-4 pt-4 border-t border-cream-300/70 dark:border-forest-800">
              <h2 className="text-2xl font-bold text-forest dark:text-ivory flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-champagne-600" />
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
            <section className="space-y-4 pt-4 border-t border-cream-300/70 dark:border-forest-800">
              <h2 className="text-2xl font-bold text-forest dark:text-ivory flex items-center gap-2">
                <Target className="w-5 h-5 text-champagne-600" />
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
            <section className="space-y-4 pt-4 border-t border-cream-300/70 dark:border-forest-800">
              <h2 className="text-2xl font-bold text-forest dark:text-ivory flex items-center gap-2">
                <Compass className="w-5 h-5 text-champagne-600" />
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
                  className="inline-flex items-center gap-2 text-sm font-bold text-forest dark:text-champagne-300 hover:text-champagne-600"
                >
                  <span>Explore my structured education timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
