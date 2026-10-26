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
    <div className="min-h-screen bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage shadow-sm">
            <Mail className="w-3.5 h-3.5 text-champagne-600" />
            <span>Direct Channel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Get in Touch
          </h1>
          <p className="text-base text-forest-700/80 dark:text-sage-100 leading-relaxed">
            Have an inquiry regarding software internships, AI project discussions, or academic collaborations?
            Reach out through the secure form below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-forest dark:text-ivory">Contact Information</h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center shrink-0 text-forest dark:text-champagne-300 shadow-inner">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-forest-600 dark:text-sage block">Direct Email:</span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-semibold text-forest dark:text-ivory hover:text-champagne-600 transition-colors"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center shrink-0 text-forest dark:text-champagne-300 shadow-inner">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-forest-600 dark:text-sage block">GitHub Profile:</span>
                    <a
                      href={profile.githubUrl || 'https://github.com/Athravpathak-git'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-forest dark:text-ivory hover:text-champagne-600 transition-colors"
                    >
                      @Athravpathak-git
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center shrink-0 text-forest dark:text-champagne-300 shadow-inner">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-forest-600 dark:text-sage block">Location:</span>
                    <span className="font-semibold text-forest dark:text-ivory">{profile.location || 'India'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cream-300/60 dark:border-forest-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-forest-700 dark:text-sage">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest dark:text-sage-300" />
                  <span>Rate Limited & Encrypted Transmission</span>
                </div>
                <p className="text-[11px] text-forest-600 dark:text-sage leading-relaxed">
                  Contact submissions are securely recorded and forwarded to the administrator with honeypot spam protection.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-forest dark:text-ivory mb-6">Send a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
