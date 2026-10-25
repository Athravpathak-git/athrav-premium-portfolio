import React from 'react';
import Link from 'next/link';
import { ProjectData } from '@/lib/mock-data';
import { ArrowUpRight, Github, ExternalLink, Sparkles } from 'lucide-react';

export function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <div className="group relative rounded-2xl border border-white/10 hover:border-white/25 bg-zinc-950/70 dark:bg-zinc-950/70 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-silver-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              <Sparkles className="w-3 h-3 text-silver-300" />
              Featured
            </span>
          )}
        </div>

        <Link href={`/projects/${project.slug}`} className="block group-hover:text-silver-200 transition-colors">
          <h3 className="text-xl font-semibold text-white tracking-tight flex items-center justify-between gap-2">
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </h3>
          {project.subtitle && (
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{project.subtitle}</p>
          )}
        </Link>

        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {project.summary}
        </p>
      </div>

      {/* Tech Stack Tags & Actions */}
      <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs font-medium text-silver-300 hover:text-white transition-colors"
          >
            View Architecture & Details →
          </Link>

          <div className="flex items-center gap-3">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors p-1"
                aria-label={`GitHub repository for ${project.title}`}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors p-1"
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
