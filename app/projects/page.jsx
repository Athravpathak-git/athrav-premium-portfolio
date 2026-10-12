import React from 'react';
import { Layers } from 'lucide-react';
import { getAllProjects } from '@/lib/data.js';
import ProjectsClientList from '@/components/ProjectsClientList.jsx';

export const metadata = {
  title: 'Projects — Athrav Pathak',
  description: 'Full-stack software engineering projects, system architectures, and technical implementations.',
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="relative pt-32 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Case Studies & Systems</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Featured <span className="font-normal text-metallic">Engineering Projects</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Architectural breakdowns, databases, and implementations built with production standards.
        </p>
      </div>

      {/* Filterable projects list */}
      <ProjectsClientList initialProjects={projects} />
    </div>
  );
}
