import React from 'react';
import type { Metadata } from 'next';
import { getProfile } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/public/ContactForm';
import { Mail, Github, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Contact & Inquiries — Athrav Pathak',
  description:
    'Send a secure inquiry or collaboration request directly to Athrav Pathak, Aspiring AI Engineer.',
  path: '/contact',
});

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-mono text-silver-300">
          <Mail className="w-3.5 h-3.5" />
          <span>Direct Channel</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Get in Touch
        </h1>
        <p className="text-base text-zinc-400 leading-relaxed">
          Have an inquiry regarding software internships, AI project discussions, or academic collaborations?
          Reach out through the secure form below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 text-silver-300">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 block">Direct Email:</span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-zinc-200 hover:text-white transition-colors"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 text-silver-300">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 block">GitHub Profile:</span>
                  <a
                    href={profile.githubUrl || 'https://github.com/Athravpathak-git'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 hover:text-white transition-colors"
                  >
                    @Athravpathak-git
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 text-silver-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-400 block">Location:</span>
                  <span className="text-zinc-200">{profile.location || 'India'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rate Limited & Encrypted Transmission</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Contact submissions are securely recorded and forwarded to the administrator with honeypot spam protection.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
