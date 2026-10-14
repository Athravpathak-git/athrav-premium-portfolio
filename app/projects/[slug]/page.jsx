import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, GitBranch, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { getProjectBySlug, getAllProjects } from '@/lib/data.js';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);
  if (!project) {
    return { title: 'Project Not Found — Athrav Pathak' };
  }
  const title = `${project.title} — Athrav Pathak`;
  const description = project.summary || project.subtitle;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/projects/${project.slug}`,
      images: project.imageUrl ? [{ url: project.imageUrl, alt: project.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.imageUrl ? [project.imageUrl] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Back Link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
            {project.category}
          </span>
          {project.featured && (
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
              Featured Architecture
            </span>
          )}
          <span className="text-slate-500 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="text-lg text-slate-300 font-normal">{project.subtitle}</p>
          )}
        </div>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
          {project.summary}
        </p>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg"
            >
              <span>Live Demonstration</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium glass-button"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Source Repository</span>
            </a>
          )}
        </div>
      </div>

      {/* Feature Image Banner */}
      {project.imageUrl && (
        <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Technology Stack Matrix */}
      <div className="p-6 rounded-2xl glass-panel space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Applied Technologies & Architecture</span>
        </h2>
        <div className="flex flex-wrap gap-2 pt-1">
          {project.techStack?.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Full Description & Architecture Narrative */}
      <div className="pt-6 border-t border-white/[0.08] space-y-6">
        <h2 className="text-xl font-light text-white tracking-tight">
          System Overview & Implementation
        </h2>
        <div className="prose prose-invert max-w-none text-sm sm:text-base text-slate-300 leading-relaxed font-light whitespace-pre-line">
          {project.description}
        </div>
      </div>
    </div>
  );
}
