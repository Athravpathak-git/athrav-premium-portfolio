import React from 'react';
import { Layers, Terminal, Database, Server, Wrench, Shield } from 'lucide-react';
import { getSkills } from '@/lib/data.js';

export const metadata = {
  title: 'Skills — Athrav Pathak',
  description: 'Technical competencies, programming languages, database architectures, and engineering tools.',
};

export default async function SkillsPage() {
  const dbSkills = await getSkills();

  // Baseline verified technical skillset grouped by domain
  const defaultCategories = [
    {
      category: 'Languages & Core Runtimes',
      icon: Terminal,
      items: ['JavaScript (ESNext)', 'TypeScript', 'Node.js', 'SQL / PostgreSQL DDL', 'HTML5 & Semantic Markup'],
    },
    {
      category: 'Frontend & Architecture',
      icon: Layers,
      items: ['Next.js (App Router)', 'React.js', 'Tailwind CSS', 'Three.js (3D Graphics)', 'Responsive UI & a11y'],
    },
    {
      category: 'Databases & Storage',
      icon: Database,
      items: ['PostgreSQL (Primary)', 'Prisma ORM', 'Relational Schema Design', 'Indexes & Query Optimization', 'Database Migrations'],
    },
    {
      category: 'Backend & APIs',
      icon: Server,
      items: ['Server Actions', 'RESTful API Design', 'Zod Schema Validation', 'Server-Side Rendering', 'Micro-interactions'],
    },
    {
      category: 'Security & DevOps',
      icon: Shield,
      items: ['Argon2id Hashing', 'Session Security & Cookies', 'Rate Limiting & Anti-Spam', 'Content Security Policy (CSP)', 'Git Version Control'],
    },
    {
      category: 'Tools & Platforms',
      icon: Wrench,
      items: ['PostgreSQL CLI (psql)', 'VS Code', 'npm / Node Tooling', 'Vercel / Cloud Deployment', 'Linux / PowerShell'],
    },
  ];

  // If skills exist in DB, group them by category
  let categoriesToDisplay = defaultCategories;
  if (dbSkills && dbSkills.length > 0) {
    const grouped = {};
    for (const skill of dbSkills) {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill.name);
    }
    categoriesToDisplay = Object.entries(grouped).map(([category, items]) => ({
      category,
      icon: Database,
      items,
    }));
  }

  return (
    <div className="relative pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>Technical Stack</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Skills & <span className="font-normal text-metallic">Technologies</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Technologies and methodologies applied across full-stack engineering, PostgreSQL architectures, and production infrastructure.
        </p>
      </div>

      {/* Skill Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesToDisplay.map((cat) => {
          const IconComponent = cat.icon || Layers;
          return (
            <div
              key={cat.category}
              className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                  <IconComponent className="w-4 h-4 text-sky-400" />
                </div>
                <h2 className="text-base font-medium text-white">{cat.category}</h2>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {cat.items.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.07] font-normal"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
