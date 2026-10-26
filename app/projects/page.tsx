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

export default async function ProjectsPage() {
  const projects = await getProjectsList({ publishedOnly: true });

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Layers className="w-3.5 h-3.5 text-champagne-600" />
            <span>Engineering Portfolio</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Software & AI Implementations
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 leading-relaxed">
            Focused implementations across machine learning pipelines, agentic architectures, and modern web applications.
            Click any project to inspect its problem statement, technical architecture, and challenges.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-8 space-y-3">
            <p className="text-forest-600 dark:text-sage text-sm">No published projects are currently available.</p>
          </div>
        )}

        {/* External GitHub Banner */}
        <div className="mt-20 p-8 rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-forest dark:text-ivory">Source Code & Experiment Repositories</h3>
            <p className="text-xs text-forest-600 dark:text-sage">
              Explore continuous coding activity and exploratory notebooks on Athrav&apos;s GitHub.
            </p>
          </div>
          <a
            href="https://github.com/Athravpathak-git"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest hover:bg-forest-600 text-ivory text-xs font-mono font-semibold transition-all shadow-md shrink-0"
          >
            <Github className="w-4 h-4" />
            <span>Athravpathak-git</span>
          </a>
        </div>
      </div>
    </div>
  );
}
