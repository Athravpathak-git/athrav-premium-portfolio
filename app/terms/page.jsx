import React from 'react';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Use — Athrav Pathak',
  description: 'Terms of use and intellectual property terms for the Athrav Pathak portfolio.',
};

export default function TermsPage() {
  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Terms of <span className="font-normal text-metallic">Use</span>
        </h1>
        <p className="text-sm text-slate-400">
          Effective Date: February 2026 • Last Updated: October 2026
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and browsing this portfolio website, you agree to comply with and be bound by the terms 
            set forth herein. If you disagree with any portion of these terms, please discontinue use of this site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">2. Intellectual Property Rights</h2>
          <p>
            All custom designs, written content, technical architectures, branding elements, and visual compositions 
            presented on this domain belong to Athrav Pathak unless otherwise cited or linked to open-source licenses. 
            Open-source code repositories linked from this portfolio remain governed by their respective licenses (e.g., MIT, Apache 2.0).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">3. Acceptable Use Policy</h2>
          <p>
            You agree not to engage in malicious activities against this website, including but not limited to 
            denial-of-service attempts, automated vulnerability scraping, brute-force authentication attacks, 
            or transmitting abusive communications through the contact channel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">4. Disclaimer of Warranty</h2>
          <p>
            The materials and code demonstrations contained on this site are provided for professional informational and 
            showcase purposes &quot;as is&quot; without warranties of any kind.
          </p>
        </section>
      </div>
    </div>
  );
}
