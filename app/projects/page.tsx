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
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Layers className="w-3.5 h-3.5" />
          <span>Engineering Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Software & AI Implementations
        </h1>
        <p className="text-base text-zinc-400 leading-relaxed">
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
        <div className="text-center py-24 rounded-2xl border border-white/10 bg-zinc-950/60 p-8 space-y-3">
          <p className="text-zinc-400 text-sm">No published projects are currently available.</p>
        </div>
      )}

      {/* External GitHub Banner */}
      <div className="mt-20 p-8 rounded-2xl border border-white/10 bg-zinc-950/70 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white">Source Code & Experiment Repositories</h3>
          <p className="text-xs text-zinc-400">
            Explore continuous coding activity and exploratory notebooks on Athrav&apos;s GitHub.
          </p>
        </div>
        <a
          href="https://github.com/Athravpathak-git"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-mono text-white transition-colors shrink-0"
        >
          <Github className="w-4 h-4" />
          <span>Visit @Athravpathak-git</span>
        </a>
      </div>
    </div>
  );
}
