import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjectsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { ProjectCard } from '@/components/public/ProjectCard';
import { Layers, ArrowRight, Github } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Engineering Projects — Athrav Pathak',
  description:
    'Explore artificial intelligence platforms, computer vision prototypes, and full-stack web applications engineered by Athrav Pathak.',
  path: '/projects',
});

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getProjectsList({ publishedOnly: true });

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold-700 dark:text-rosegold shadow-sm">
            <Layers className="w-3.5 h-3.5 text-rosegold-700 dark:text-rosegold" />
            <span>Engineering Portfolio</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Software & AI Implementations
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 leading-relaxed font-normal">
            Focused implementations across machine learning pipelines, agentic architectures, and modern web applications.
            Click any project to inspect its problem statement, technical architecture, and challenges.
          </p>
        </div>

        {/* Projects Editorial Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-7">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                featuredLarge={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-8 space-y-3 shadow-sm">
            <p className="text-charcoal/70 dark:text-cream/70 text-sm">No published projects are currently available.</p>
          </div>
        )}

        {/* External GitHub Banner */}
        <div className="mt-20 p-8 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-serif font-bold text-burgundy dark:text-cream">Source Code & Experiment Repositories</h3>
            <p className="text-xs text-charcoal/70 dark:text-cream/70">
              Explore continuous coding activity, experimentation scripts, and notebooks on Athrav&apos;s GitHub.
            </p>
          </div>
          <a
            href="https://github.com/Athravpathak-git"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white text-xs font-mono font-bold transition-all shadow-sm shrink-0"
          >
            <Github className="w-4 h-4 text-rosegold" />
            <span>Athravpathak-git</span>
          </a>
        </div>
      </div>
    </div>
  );
}
