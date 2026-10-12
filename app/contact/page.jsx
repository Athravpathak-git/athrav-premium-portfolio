import React from 'react';
import { Mail, Shield, Clock } from 'lucide-react';
import ContactForm from '@/components/ContactForm.jsx';
import { getProfile } from '@/lib/data.js';

export const metadata = {
  title: 'Contact — Athrav Pathak',
  description: 'Initiate direct contact with software engineer Athrav Pathak for opportunities, consulting, and system design.',
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <div className="relative pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-xs text-slate-400">
          <Mail className="w-3.5 h-3.5 text-sky-400" />
          <span>Direct Channel</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          Initiate <span className="font-normal text-metallic">Communication</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Reach out directly regarding engineering opportunities, software consulting, or system architecture inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Direct Contact
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Recipient</span>
                <span className="text-slate-200 font-medium">{profile.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Direct Email</span>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-sky-400 hover:underline font-mono"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-4 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-center space-x-2 text-slate-300 font-medium">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Security</span>
            </div>
            <p>
              Submissions are stored securely in PostgreSQL with rate-limiting and anti-spam verification. 
              Your email is never shared, marketed to, or publicly exposed.
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
