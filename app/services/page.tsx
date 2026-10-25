import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServicesList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { Layers, Cpu, BarChart3, Compass, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Services & Technical Capabilities — Athrav Pathak',
  description:
    'Full-stack development, AI prototyping, and data analytics capabilities offered by Athrav Pathak.',
  path: '/services',
});

const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-5 h-5 text-silver-300" />,
  Cpu: <Cpu className="w-5 h-5 text-silver-300" />,
  BarChart3: <BarChart3 className="w-5 h-5 text-silver-300" />,
  Compass: <Compass className="w-5 h-5 text-silver-300" />,
};

export default async function ServicesPage() {
  const services = await getServicesList(true);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Technical Offering</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Services & Capabilities
        </h1>
        <p className="text-base text-zinc-400 leading-relaxed">
          Applied software engineering competencies and machine learning prototypes available for internship roles,
          collaborative student initiatives, and exploratory technical contracts.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="rounded-2xl border border-white/10 hover:border-white/20 bg-zinc-950/70 backdrop-blur-xl p-8 space-y-5 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
              {srv.icon && ICON_MAP[srv.icon] ? (
                ICON_MAP[srv.icon]
              ) : (
                <Cpu className="w-5 h-5 text-silver-300" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{srv.title}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">{srv.description}</p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Utilized Technology Stack:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {srv.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono text-zinc-200 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="mt-16 p-8 rounded-2xl border border-white/10 bg-zinc-950/80 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Need a prototype or technical collaboration?</h3>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Send a detailed message outlining your project goals or internship opportunity.
        </p>
        <div className="pt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-lg shadow-white/10"
          >
            <span>Discuss Opportunity</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
