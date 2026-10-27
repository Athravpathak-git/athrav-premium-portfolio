import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProfile, getSocialLinksList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { ProfilePortrait } from '@/components/public/ProfilePortrait';
import { SocialIcon } from '@/components/common/SocialIcon';
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
  ArrowUpRight,
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
  const aboutSocials = await getSocialLinksList({
    publishedOnly: true,
    placement: 'about',
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold-700 dark:text-rosegold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rosegold-700 dark:text-rosegold" />
            <span>Biography & Vision</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            About Athrav Pathak
          </h1>
          <p className="text-lg text-charcoal/80 dark:text-cream/80 font-serif">
            {profile.headline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left Column: Portrait & Profile Attributes */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 shadow-sm space-y-6">
              {/* Portrait Component displaying real saved profile photo */}
              <ProfilePortrait
                avatarUrl={profile.avatarUrl}
                name={profile.name}
                status={profile.status}
                headline="BCA Undergraduate • Year 2"
              />

              {/* Quick Context Facts */}
              <div className="space-y-3 text-xs font-mono pt-2">
                <div className="flex justify-between py-2 border-b border-border-soft dark:border-charcoal-700">
                  <span className="text-charcoal/70 dark:text-cream/70 font-medium">Current Degree:</span>
                  <span className="font-bold text-burgundy dark:text-rosegold">BCA (Second Year)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-soft dark:border-charcoal-700">
                  <span className="text-charcoal/70 dark:text-cream/70 font-medium">Focus Area:</span>
                  <span className="font-bold text-burgundy dark:text-rosegold">Artificial Intelligence & ML</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-soft dark:border-charcoal-700">
                  <span className="text-charcoal/70 dark:text-cream/70 font-medium">Primary Languages:</span>
                  <span className="font-bold text-burgundy dark:text-rosegold">Python, TypeScript, SQL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border-soft dark:border-charcoal-700">
                  <span className="text-charcoal/70 dark:text-cream/70 font-medium">Location:</span>
                  <span className="font-bold text-burgundy dark:text-rosegold">{profile.location || 'India'}</span>
                </div>
              </div>

              {/* Links & Verified Socials */}
              <div className="pt-2 flex flex-col gap-2.5">
                {aboutSocials
                  .filter((s) => s.platform !== 'email')
                  .map((channel) => (
                    <a
                      key={channel.id}
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-cream-100 dark:bg-charcoal-700 hover:bg-cream-200 dark:hover:bg-charcoal-600 border border-border-soft dark:border-charcoal-600 text-xs font-mono font-semibold text-charcoal dark:text-cream transition-colors shadow-sm group"
                    >
                      <div className="flex items-center gap-2">
                        <SocialIcon platform={channel.platform} iconName={channel.icon} className="w-4 h-4 text-rosegold" />
                        <span>{channel.label}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}

                {aboutSocials.length === 0 && (
                  <a
                    href={profile.githubUrl || 'https://github.com/Athravpathak-git'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cream-100 dark:bg-charcoal-700 hover:bg-cream-200 dark:hover:bg-charcoal-600 border border-border-soft dark:border-charcoal-600 text-xs font-mono font-semibold text-charcoal dark:text-cream transition-colors shadow-sm"
                  >
                    <SocialIcon platform="github" className="w-4 h-4 text-rosegold" />
                    <span>GitHub Profile</span>
                  </a>
                )}

                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-burgundy hover:bg-burgundy-500 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Athrav</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Biography & Technical Trajectory */}
          <div className="md:col-span-7 space-y-10">
            {/* Biography Narrative */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-burgundy dark:text-cream">Background & Academic Journey</h2>
              <div className="space-y-4 text-sm sm:text-base text-charcoal/85 dark:text-cream/80 leading-relaxed">
                <p>
                  I am a passionate computer applications undergraduate currently in my second year of BCA, focusing on
                  artificial intelligence, machine learning algorithms, and modern full-stack web applications.
                </p>
                <p>
                  My development journey started with foundational programming and problem-solving, which quickly evolved
                  into fascination with how machine learning algorithms transform raw data into intelligent, predictive systems.
                  I believe that true engineering excellence comes from understanding mathematical principles from the ground up,
                  not simply calling pre-trained black-box APIs.
                </p>
                <p>
                  Alongside my coursework, I build real-world software applications using Python, TypeScript, React 19,
                  and Next.js, bridging the gap between theoretical computer science and accessible user experiences.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-burgundy dark:text-cream">Engineering Principles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 flex items-center justify-center text-burgundy dark:text-rosegold">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-burgundy dark:text-cream">First-Principles Thinking</h3>
                  <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    Deconstructing complex problems to their core mathematical and computational truths before selecting libraries.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 flex items-center justify-center text-burgundy dark:text-rosegold">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-burgundy dark:text-cream">Transparent Progress</h3>
                  <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    Honest documentation of skills, current academic standing, and ongoing projects without inflated credentials.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 flex items-center justify-center text-burgundy dark:text-rosegold">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-burgundy dark:text-cream">Algorithmic Rigor</h3>
                  <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    Mastering data structures, runtime complexity, and vectorization techniques for high-performance software.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 flex items-center justify-center text-burgundy dark:text-rosegold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-burgundy dark:text-cream">Continuous Curiosity</h3>
                  <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed">
                    Actively following research papers, experimenting with new paradigms, and embracing continuous learning.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps Links */}
            <div className="pt-6 border-t border-border-soft dark:border-charcoal-700 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/education"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
              >
                <span>View formal academic path (BCA)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
              >
                <span>Explore featured projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
