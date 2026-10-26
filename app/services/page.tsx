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
  Layers: <Layers className="w-5 h-5 text-burgundy" />,
  Cpu: <Cpu className="w-5 h-5 text-burgundy" />,
  BarChart3: <BarChart3 className="w-5 h-5 text-burgundy" />,
  Compass: <Compass className="w-5 h-5 text-burgundy" />,
};

export default async function ServicesPage() {
  const services = await getServicesList(true);

  return (
    <div className="min-h-screen bg-cream text-charcoal pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft bg-white text-xs font-mono text-rosegold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rosegold" />
            <span>Technical Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy">
            Services & Capabilities
          </h1>
          <p className="text-base text-charcoal/80 leading-relaxed font-normal">
            Applied software engineering competencies and machine learning prototypes available for internship roles,
            collaborative student initiatives, and exploratory technical contracts.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="rounded-2xl border border-border-soft hover:border-rosegold bg-white p-8 space-y-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center shadow-inner">
                {srv.icon && ICON_MAP[srv.icon] ? (
                  ICON_MAP[srv.icon]
                ) : (
                  <Cpu className="w-5 h-5 text-burgundy" />
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-burgundy tracking-tight">{srv.title}</h2>
                <p className="text-sm text-charcoal/80 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 border-t border-border-soft space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-burgundy font-semibold">
                  Utilized Technology Stack:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {srv.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono text-charcoal bg-cream-100 border border-border-soft px-2.5 py-1 rounded-md"
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
        <div className="mt-16 p-8 rounded-2xl border border-border-soft bg-white text-center space-y-4 shadow-sm">
          <h3 className="text-xl font-serif font-bold text-burgundy">Need a prototype or technical collaboration?</h3>
          <p className="text-sm text-charcoal/80 max-w-lg mx-auto">
            Send a detailed message outlining your project goals or internship opportunity.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              <span>Discuss Opportunity</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
