import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, getProjectsList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Layers,
  Cpu,
  Target,
  Wrench,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, true);
  if (!project) {
    return constructMetadata({ title: 'Project Not Found' });
  }

  return constructMetadata({
    title: `${project.title} — Technical Case Study`,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug, true);

  if (!project) {
    notFound();
  }

  const allProjects = await getProjectsList({ publishedOnly: true });
  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-cream text-charcoal pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-charcoal/70 hover:text-burgundy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects Overview</span>
          </Link>
        </div>

        {/* Project Header */}
        <div className="space-y-6 pb-10 border-b border-border-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono font-semibold text-burgundy uppercase tracking-wider px-3.5 py-1 rounded-full border border-border-soft bg-white shadow-sm">
              {project.category}
            </span>
            {project.isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rosegold-700 bg-rosegold-50 px-3 py-1 rounded-full border border-rosegold-200">
                <Sparkles className="w-3.5 h-3.5 text-rosegold" />
                Featured Engineering Project
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy">
              {project.title}
            </h1>
            {project.subtitle && (
              <p className="text-lg text-rosegold font-semibold">{project.subtitle}</p>
            )}
          </div>

          <p className="text-base sm:text-lg text-charcoal/85 leading-relaxed max-w-3xl">
            {project.summary}
          </p>

          {/* Links & Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-cream-100 border border-border-soft text-xs font-mono font-semibold text-charcoal transition-colors shadow-sm"
              >
                <Github className="w-4 h-4 text-rosegold" />
                <span>Inspect Source Repository</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-xs font-bold text-white transition-colors shadow-sm"
              >
                <span>Launch Live System</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="py-8 border-b border-border-soft">
          <h3 className="text-xs font-mono uppercase tracking-wider text-burgundy font-semibold mb-3">
            Core Technologies & Architecture Stack:
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono text-charcoal bg-white border border-border-soft px-3 py-1.5 rounded-lg"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Technical Case Study Sections */}
        <div className="py-12 space-y-12 text-charcoal/85">
          {/* Full Description / Overview */}
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-burgundy flex items-center gap-2">
              <Layers className="w-5 h-5 text-rosegold" />
              <span>Project Scope & Architecture Overview</span>
            </h2>
            <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
              {project.description}
            </div>
          </section>

          {/* Architecture Summary / Diagram */}
          {project.architectureSummary && (
            <section className="space-y-4 rounded-2xl border border-border-soft bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-burgundy flex items-center gap-2">
                <Cpu className="w-5 h-5 text-rosegold" />
                <span>System Design & Architecture Flow</span>
              </h2>
              <p className="text-sm text-charcoal/80 leading-relaxed font-mono">
                {project.architectureSummary}
              </p>
            </section>
          )}

          {/* Challenges & Solutions */}
          {(project.challenges || project.solutions) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.challenges && (
                <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-3 shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-burgundy flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-rosegold" />
                    <span>Engineering Challenges</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
                    {project.challenges}
                  </p>
                </div>
              )}

              {project.solutions && (
                <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-3 shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-burgundy flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-burgundy" />
                    <span>Implemented Solutions</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
                    {project.solutions}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Results & Future Improvements */}
          {(project.results || project.futureImprovements) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.results && (
                <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-3 shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-burgundy flex items-center gap-2">
                    <Target className="w-4 h-4 text-rosegold" />
                    <span>Verified Outcomes</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
                    {project.results}
                  </p>
                </div>
              )}

              {project.futureImprovements && (
                <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-3 shadow-sm">
                  <h3 className="text-lg font-serif font-bold text-burgundy flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rosegold" />
                    <span>Future Iterations</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
                    {project.futureImprovements}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border-soft space-y-6">
            <h3 className="text-xl font-serif font-bold text-burgundy">Other Selected Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedProjects.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/projects/${rel.slug}`}
                  className="group p-5 rounded-xl border border-border-soft hover:border-rosegold bg-white transition-all flex justify-between items-center shadow-sm hover:shadow-md"
                >
                  <div>
                    <h4 className="text-sm font-serif font-bold text-burgundy group-hover:text-burgundy-500 transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-charcoal/70 font-mono mt-0.5">{rel.category}</p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-rosegold group-hover:text-burgundy rotate-180 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
