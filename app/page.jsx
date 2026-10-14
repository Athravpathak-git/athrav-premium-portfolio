import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Database, ShieldCheck, Cpu, ArrowUpRight, Sparkles } from 'lucide-react';
import Hero3DScene from '@/components/Hero3DScene.jsx';
import { getProfile, getFeaturedProjects, getSkills } from '@/lib/data.js';
import { GitHubIcon, LinkedInIcon, TwitterXIcon, WebsiteIcon, EmailIcon } from '@/components/SocialIcons.jsx';

export const revalidate = 60; // Incremental static regeneration

export default async function HomePage() {
  const profile = await getProfile();
  const featuredProjects = await getFeaturedProjects();
  const allSkills = await getSkills();

  // Pick top 8 published skills for hero preview
  const topSkills = allSkills.slice(0, 8);

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow -top-40 -left-40 w-[600px] h-[600px] bg-slate-700/20" />
      <div className="ambient-glow top-60 right-0 w-[500px] h-[500px] bg-sky-900/15" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center space-x-3.5 flex-wrap gap-y-2">
              {profile.avatarUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg relative bg-slate-900 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Full-Stack Architecture & PostgreSQL Engineering</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.08]">
                Crafting <span className="font-normal text-metallic-glow">resilient</span> software systems.
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
                Hi, I&apos;m <span className="text-slate-200 font-medium">{profile.name}</span>. I design
                high-throughput backends, robust database architectures, and fluid, high-performance web applications.
              </p>
            </div>

            {/* Call to Actions & Social Links */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs sm:text-sm font-medium bg-white text-black hover:bg-slate-200 transition-all shadow-xl hover:shadow-white/10"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs sm:text-sm font-medium glass-button"
                >
                  <span>Initiate Contact</span>
                </Link>
              </div>

              {/* Verified Social Icons */}
              <div className="flex items-center space-x-2.5 pt-1">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    aria-label="GitHub Profile"
                  >
                    <GitHubIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    aria-label="LinkedIn Profile"
                  >
                    <LinkedInIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    aria-label="Twitter / X Profile"
                  >
                    <TwitterXIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    aria-label="Personal Website"
                  >
                    <WebsiteIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="p-2 rounded-full glass-panel hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    aria-label="Direct Email"
                  >
                    <EmailIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metrics / Focus */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/[0.08] max-w-lg">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Core Focus</p>
                <p className="text-sm font-medium text-slate-200 mt-1">Full-Stack / DB</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Primary Database</p>
                <p className="text-sm font-medium text-slate-200 mt-1">PostgreSQL</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Architecture</p>
                <p className="text-sm font-medium text-slate-200 mt-1">App Router</p>
              </div>
            </div>
          </div>

          {/* Hero Right 3D Experience */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <Hero3DScene />
          </div>
        </div>
      </section>

      {/* Engineering Principles Section */}
      <section className="py-20 border-t border-white/[0.08] bg-[#07080d]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              System Philosophy
            </h2>
            <p className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Architectural standards designed for production longevity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                <Database className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-base font-medium text-white">PostgreSQL Integrity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parameterized queries, ACID transactions, strict schema constraints, indexing, and migration versioning.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-medium text-white">Defense in Depth</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Argon2id password hashing, HTTP-only session cookies, persistent rate limiting, and zero secret leakage.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                <Cpu className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-medium text-white">High Performance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optimized Next.js App Router rendering, minimal client JavaScript, hardware-accelerated 3D with fallbacks.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                <Code2 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-medium text-white">Refined Craft</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dark luxury aesthetic inspired by Apple ergonomics: clear focus rings, fluid motion, and accessible structure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Featured Work
            </h2>
            <p className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Selected engineering projects
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {project.category}
                    </span>
                    {project.liveUrl && (
                      <span className="flex items-center space-x-1 text-slate-400 group-hover:text-white">
                        <span>Live</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  {project.imageUrl && (
                    <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 relative group-hover:border-white/20 transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-slate-100">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.techStack?.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06]">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-xs font-medium text-slate-300 group-hover:text-white flex items-center space-x-1"
                  >
                    <span>View project architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl glass-panel text-center max-w-xl mx-auto space-y-3">
            <Code2 className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-medium text-white">Project Showcase in Preparation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated project entries are being prepared and will be published via the administrative console once verified.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white"
              >
                <span>Read more about my background</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 border-t border-white/[0.08] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Interested in building together?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            I am always open to exploring high-impact software engineering roles, distributed systems projects, and technical collaborations.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center space-x-2 px-7 py-3 rounded-full text-xs sm:text-sm font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-2xl"
            >
              <span>Get in touch directly</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
