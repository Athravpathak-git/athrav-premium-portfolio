import React from 'react';
import type { Metadata } from 'next';
import { getProfile } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/public/ContactForm';
import { Mail, Github, MapPin, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Contact & Inquiries — Athrav Pathak',
  description:
    'Send a secure inquiry or collaboration request directly to Athrav Pathak, Aspiring AI Engineer.',
  path: '/contact',
});

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold shadow-sm">
            <Mail className="w-3.5 h-3.5 text-rosegold" />
            <span>Direct Channel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Get in Touch
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 leading-relaxed font-normal">
            Have an inquiry regarding software internships, AI project discussions, or academic collaborations?
            Reach out through the secure form below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-burgundy dark:text-cream">Contact Information</h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center shrink-0 text-burgundy dark:text-rosegold shadow-inner">
                    <Mail className="w-4 h-4 text-rosegold" />
                  </div>
                  <div>
                    <span className="text-charcoal/70 dark:text-cream/70 block">Direct Email:</span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-semibold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center shrink-0 text-burgundy dark:text-rosegold shadow-inner">
                    <Github className="w-4 h-4 text-rosegold" />
                  </div>
                  <div>
                    <span className="text-charcoal/70 dark:text-cream/70 block">GitHub Profile:</span>
                    <a
                      href={profile.githubUrl || 'https://github.com/Athravpathak-git'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-burgundy dark:text-rosegold hover:text-rosegold dark:hover:text-cream transition-colors"
                    >
                      @Athravpathak-git
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center shrink-0 text-burgundy dark:text-rosegold shadow-inner">
                    <MapPin className="w-4 h-4 text-rosegold" />
                  </div>
                  <div>
                    <span className="text-charcoal/70 dark:text-cream/70 block">Location:</span>
                    <span className="font-semibold text-burgundy dark:text-cream">{profile.location || 'India'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-soft dark:border-charcoal-700 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-burgundy dark:text-rosegold">
                  <ShieldCheck className="w-3.5 h-3.5 text-rosegold" />
                  <span>Rate Limited & Encrypted Transmission</span>
                </div>
                <p className="text-[11px] text-charcoal/70 dark:text-cream/70 leading-relaxed">
                  Contact submissions are securely recorded and forwarded to the administrator with honeypot spam protection.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 sm:p-8 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
