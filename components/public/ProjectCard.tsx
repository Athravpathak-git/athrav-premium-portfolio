import React from 'react';
import Link from 'next/link';
import { ProjectData } from '@/lib/mock-data';
import { ArrowUpRight, Github, ExternalLink, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectData;
  featuredLarge?: boolean;
}

export function ProjectCard({ project, featuredLarge = false }: ProjectCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border border-border-soft hover:border-rosegold dark:border-charcoal-700 dark:hover:border-rosegold bg-white dark:bg-charcoal-800 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_-6px_rgba(87,38,51,0.08)] dark:hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.4)] hover:-translate-y-1 ${
        featuredLarge ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-semibold text-burgundy dark:text-cream uppercase tracking-wider px-2.5 py-1 rounded-md bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600">
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rosegold-700 dark:text-rosegold-300 bg-rosegold-50 dark:bg-rosegold-900/40 px-2.5 py-0.5 rounded-full border border-rosegold-200 dark:border-rosegold-700/50">
              <Sparkles className="w-3 h-3 text-rosegold" />
              Featured Work
            </span>
          )}
        </div>

        <Link href={`/projects/${project.slug}`} className="block group-hover:text-burgundy dark:group-hover:text-rosegold transition-colors">
          <h3
            className={`font-serif font-bold text-burgundy dark:text-cream tracking-tight flex items-center justify-between gap-2 ${
              featuredLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 text-rosegold group-hover:text-burgundy dark:group-hover:text-rosegold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </h3>
          {project.subtitle && (
            <p className="text-xs text-charcoal/70 dark:text-cream/70 font-mono mt-1">{project.subtitle}</p>
          )}
        </Link>

        <p className="text-sm text-charcoal/85 dark:text-cream/80 leading-relaxed font-normal">
          {project.summary}
        </p>

        {featuredLarge && project.architectureSummary && (
          <div className="p-4 rounded-xl bg-cream-50 dark:bg-charcoal-900/60 border border-border-soft dark:border-charcoal-700 text-xs text-charcoal/80 dark:text-cream/80 font-mono">
            <span className="font-bold text-burgundy dark:text-rosegold block mb-1">Architecture Overview:</span>
            {project.architectureSummary}
          </div>
        )}
      </div>

      {/* Tech Stack Tags & Actions */}
      <div className="pt-6 mt-6 border-t border-border-soft dark:border-charcoal-700 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-mono text-charcoal dark:text-cream/90 bg-cream-100 dark:bg-charcoal-700/80 border border-border-soft dark:border-charcoal-600 px-2.5 py-1 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs font-bold text-burgundy dark:text-rosegold hover:text-rosegold-600 dark:hover:text-cream transition-colors inline-flex items-center gap-1"
          >
            <span>View Case Study</span>
            <span aria-hidden="true">→</span>
          </Link>

          <div className="flex items-center gap-3">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal/60 dark:text-cream/60 hover:text-burgundy dark:hover:text-rosegold transition-colors p-1"
                title="Source Repository"
                aria-label={`Source code for ${project.title}`}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal/60 dark:text-cream/60 hover:text-burgundy dark:hover:text-rosegold transition-colors p-1"
                title="Live Deployment"
                aria-label={`Live demo for ${project.title}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
