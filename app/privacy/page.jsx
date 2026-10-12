import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Athrav Pathak',
  description: 'Privacy policy, data retention procedures, and security commitments for Athrav Pathak portfolio.',
};

export default function PrivacyPage() {
  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security & Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Privacy <span className="font-normal text-metallic">Policy</span>
        </h1>
        <p className="text-sm text-slate-400">
          Effective Date: February 2026 • Last Updated: October 2026
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-sky-400" />
            <span>1. Zero Tracking & No Analytics Cookies</span>
          </h2>
          <p>
            This portfolio website does not utilize invasive third-party tracking scripts, advertising beacons, 
            or cross-site profiling cookies. Public visitors can browse all publicly available content with complete privacy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>2. Contact Information & Message Processing</span>
          </h2>
          <p>
            When you submit a communication through the contact form, the details you supply (your name, email address, 
            subject, and message body) are transmitted over encrypted TLS and recorded directly in a private PostgreSQL database.
          </p>
          <p>
            This information is accessed exclusively by Athrav Pathak for the sole purpose of evaluating and replying to your message. 
            Under no circumstances is this data sold, shared, rented, or distributed to marketing brokers or third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">3. Data Retention & Deletion Policy</h2>
          <p>
            Contact submissions are retained only as long as necessary to fulfill professional communication. 
            If you wish to request immediate deletion of your submitted messages and contact information, you may send 
            an email directly to the contact address displayed on the portfolio, and all corresponding database records 
            will be permanently purged.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">4. Technical Security Controls</h2>
          <p>
            All application traffic is guarded with modern HTTP security headers including Content Security Policy (CSP), 
            HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, frame-ancestors: &apos;none&apos;, and persistent 
            rate limiting against automated attacks.
          </p>
        </section>
      </div>
    </div>
  );
}
