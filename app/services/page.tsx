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
  Layers: <Layers className="w-5 h-5 text-forest dark:text-champagne-300" />,
  Cpu: <Cpu className="w-5 h-5 text-forest dark:text-champagne-300" />,
  BarChart3: <BarChart3 className="w-5 h-5 text-forest dark:text-champagne-300" />,
  Compass: <Compass className="w-5 h-5 text-forest dark:text-champagne-300" />,
};

export default async function ServicesPage() {
  const services = await getServicesList(true);

  return (
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
            <span>Technical Offering</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Services & Capabilities
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 leading-relaxed">
            Applied software engineering competencies and machine learning prototypes available for internship roles,
            collaborative student initiatives, and exploratory technical contracts.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="rounded-2xl border border-cream-300 dark:border-forest-700 hover:border-champagne-500 bg-ivory dark:bg-forest-900 p-8 space-y-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center shadow-inner">
                {srv.icon && ICON_MAP[srv.icon] ? (
                  ICON_MAP[srv.icon]
                ) : (
                  <Cpu className="w-5 h-5 text-forest dark:text-champagne-300" />
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-forest dark:text-ivory tracking-tight">{srv.title}</h2>
                <p className="text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 border-t border-cream-300/60 dark:border-forest-800 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-forest-600 dark:text-sage font-medium">
                  Utilized Technology Stack:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {srv.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono text-forest-700 dark:text-sage bg-cream-200/70 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 px-2.5 py-1 rounded-md"
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
        <div className="mt-16 p-8 rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-center space-y-4 shadow-sm">
          <h3 className="text-xl font-bold text-forest dark:text-ivory">Need a prototype or technical collaboration?</h3>
          <p className="text-sm text-forest-700/80 dark:text-sage-100 max-w-lg mx-auto">
            Send a detailed message outlining your project goals or internship opportunity.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-forest hover:bg-forest-600 text-ivory font-bold text-xs transition-colors shadow-md"
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
