import React from 'react';
import Link from 'next/link';
import { ProjectData } from '@/lib/mock-data';
import { ArrowUpRight, Github, ExternalLink, Sparkles } from 'lucide-react';

export function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <div className="group relative rounded-2xl border border-cream-300 dark:border-forest-700 hover:border-champagne-500 bg-ivory dark:bg-forest-900 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase tracking-wider font-medium">
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-champagne-700 dark:text-champagne-300 bg-champagne-50 dark:bg-forest-800 px-2.5 py-0.5 rounded-full border border-champagne-300 dark:border-champagne-600">
              <Sparkles className="w-3 h-3 text-champagne-600" />
              Featured
            </span>
          )}
        </div>

        <Link href={`/projects/${project.slug}`} className="block group-hover:text-forest-600 transition-colors">
          <h3 className="text-xl font-bold text-forest dark:text-ivory tracking-tight flex items-center justify-between gap-2">
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 text-forest-500 group-hover:text-forest group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </h3>
          {project.subtitle && (
            <p className="text-xs text-forest-600 dark:text-sage font-mono mt-0.5">{project.subtitle}</p>
          )}
        </Link>

        <p className="text-sm text-forest-700/80 dark:text-sage-100 line-clamp-3 leading-relaxed">
          {project.summary}
        </p>
      </div>

      {/* Tech Stack Tags & Actions */}
      <div className="pt-6 mt-6 border-t border-cream-300/60 dark:border-forest-800 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-mono text-forest-700 dark:text-sage bg-cream-200/70 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 px-2.5 py-1 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs font-semibold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
          >
            View Architecture & Details →
          </Link>

          <div className="flex items-center gap-3">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-500 hover:text-forest dark:text-sage dark:hover:text-ivory transition-colors p-1"
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
                className="text-forest-500 hover:text-forest dark:text-sage dark:hover:text-ivory transition-colors p-1"
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
