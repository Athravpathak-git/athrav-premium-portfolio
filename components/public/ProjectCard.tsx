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
      className={`group relative rounded-2xl border border-border-soft hover:border-rosegold bg-white p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_-6px_rgba(87,38,51,0.08)] hover:-translate-y-1 ${
        featuredLarge ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-semibold text-burgundy uppercase tracking-wider px-2.5 py-1 rounded-md bg-cream-100 border border-border-soft">
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rosegold-700 bg-rosegold-50 px-2.5 py-0.5 rounded-full border border-rosegold-200">
              <Sparkles className="w-3 h-3 text-rosegold" />
              Featured Work
            </span>
          )}
        </div>

        <Link href={`/projects/${project.slug}`} className="block group-hover:text-burgundy transition-colors">
          <h3
            className={`font-serif font-bold text-burgundy tracking-tight flex items-center justify-between gap-2 ${
              featuredLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
            }`}
          >
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 text-rosegold group-hover:text-burgundy group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </h3>
          {project.subtitle && (
            <p className="text-xs text-charcoal/70 font-mono mt-1">{project.subtitle}</p>
          )}
        </Link>

        <p className="text-sm text-charcoal/85 leading-relaxed font-normal">
          {project.summary}
        </p>

        {featuredLarge && project.architectureSummary && (
          <div className="p-4 rounded-xl bg-cream-50 border border-border-soft text-xs text-charcoal/80 font-mono">
            <span className="font-bold text-burgundy block mb-1">Architecture Overview:</span>
            {project.architectureSummary}
          </div>
        )}
      </div>

      {/* Tech Stack Tags & Actions */}
      <div className="pt-6 mt-6 border-t border-border-soft space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-mono text-charcoal bg-cream-100 border border-border-soft px-2.5 py-1 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs font-bold text-burgundy hover:text-rosegold-600 transition-colors inline-flex items-center gap-1"
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
                className="text-charcoal/60 hover:text-burgundy transition-colors p-1"
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
                className="text-charcoal/60 hover:text-burgundy transition-colors p-1"
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
