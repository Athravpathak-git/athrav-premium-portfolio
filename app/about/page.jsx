import React from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Cpu, Database, Shield, Layers } from 'lucide-react';
import { getProfile } from '@/lib/data.js';

export const metadata = {
  title: 'About — Athrav Pathak',
  description: 'Background, engineering philosophy, and focus areas of software engineer Athrav Pathak.',
};

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="relative pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>Engineer Profile</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          About <span className="font-normal text-metallic">Athrav Pathak</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Full-Stack Software Engineer committed to high architectural standards, data integrity, and purposeful digital design.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
          <p>
            I approach software engineering with a systems mindset: recognizing that lasting software is built on solid data models, unambiguous security boundaries, and disciplined separation of concerns.
          </p>
          <p>
            My core technical focus revolves around the modern JavaScript and TypeScript ecosystem on the frontend, coupled with robust server runtimes, RESTful and server-action driven architectures, and PostgreSQL as the single source of persistent truth.
          </p>
          <p>
            Whether engineering relational schemas with strict foreign keys, indexing strategy, and automated migrations, or tuning clientside rendering pipelines for optimal Core Web Vitals, I aim for solutions that are maintainable, performant, and secure by design.
          </p>

          <div className="pt-4 flex items-center space-x-4">
            <Link
              href="/projects"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors"
            >
              <span>View Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium glass-button"
            >
              <span>Get In Touch</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Fact Sheet */}
        <div className="p-6 rounded-2xl glass-panel space-y-6 self-start">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Overview
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block">Location</span>
              <span className="text-slate-200 font-medium">{profile.location || 'India'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Primary Specialization</span>
              <span className="text-slate-200 font-medium">Full-Stack & PostgreSQL Architecture</span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Status</span>
              <span className="text-emerald-400 font-medium">
                {profile.status || 'Available for engineering opportunities'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Direct Inquiries</span>
              <span className="text-slate-200 font-medium">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Pillars */}
      <div className="pt-8 border-t border-white/[0.08] space-y-8">
        <h2 className="text-xl font-light text-white tracking-tight">Core Competencies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl glass-panel space-y-2.5">
            <Database className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-medium text-white">PostgreSQL Systems</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Relational data modeling, ACID transactions, index optimization, constraints, and Prisma ORM migrations.
            </p>
          </div>
          <div className="p-5 rounded-xl glass-panel space-y-2.5">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">Modern Full-Stack</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next.js App Router, React Server Components, server actions, route handlers, and Tailwind CSS.
            </p>
          </div>
          <div className="p-5 rounded-xl glass-panel space-y-2.5">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-white">Application Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Argon2id password hashing, HTTP-only SameSite cookies, persistent rate limiting, and input validation.
            </p>
          </div>
          <div className="p-5 rounded-xl glass-panel space-y-2.5">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-medium text-white">UX & 3D Interactive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Three.js hardware-accelerated scenes, responsive mobile layouts, accessible focus states, and smooth motion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
