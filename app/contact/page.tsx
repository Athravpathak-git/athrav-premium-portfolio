import React from 'react';
import type { Metadata } from 'next';
import { getProfile, getSocialLinksList } from '@/lib/data-service';
import { constructMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/public/ContactForm';
import { Mail, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { SocialIcon, getPlatformBadgeStyle } from '@/components/common/SocialIcon';

export const metadata: Metadata = constructMetadata({
  title: 'Contact & Inquiries — Athrav Pathak',
  description:
    'Send a secure inquiry or collaboration request directly to Athrav Pathak, Aspiring AI Engineer.',
  path: '/contact',
});

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const profile = await getProfile();
  const contactSocials = await getSocialLinksList({
    publishedOnly: true,
    placement: 'contact',
  }).catch(() => []);

  const verifiedEmail = profile.email || 'athravpathak07@gmail.com';

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-900 text-charcoal dark:text-cream pt-32 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-mono text-rosegold-700 dark:text-rosegold shadow-sm">
            <Mail className="w-3.5 h-3.5 text-rosegold-700 dark:text-rosegold" />
            <span>Direct Channel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy dark:text-cream">
            Get in Touch
          </h1>
          <p className="text-base text-charcoal/80 dark:text-cream/80 leading-relaxed font-normal">
            Have an inquiry regarding software internships, AI project discussions, or academic collaborations?
            Reach out through the secure form below or via any verified direct channel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-serif font-bold text-burgundy dark:text-cream">
                Contact Channels
              </h3>

              <div className="space-y-4 text-xs font-mono">
                {/* Primary Verified Email */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500 shadow-inner">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-charcoal/70 dark:text-cream/70 block">Direct Email:</span>
                    <a
                      href={`mailto:${verifiedEmail}`}
                      className="font-semibold text-burgundy dark:text-rosegold hover:underline break-all transition-colors"
                    >
                      {verifiedEmail}
                    </a>
                  </div>
                </div>

                {/* Dynamic Contact Channels */}
                {contactSocials
                  .filter((s) => s.platform !== 'email')
                  .map((channel) => {
                    const badge = getPlatformBadgeStyle(channel.platform);
                    const href = channel.url;

                    return (
                      <div key={channel.id} className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${badge.bg} ${badge.border}`}
                        >
                          <SocialIcon platform={channel.platform} iconName={channel.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-charcoal/70 dark:text-cream/70 block capitalize">
                            {channel.label}:
                          </span>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-burgundy dark:text-rosegold hover:underline break-all transition-colors group"
                          >
                            <span>{channel.username || channel.label}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                      </div>
                    );
                  })}

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cream-100 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 flex items-center justify-center shrink-0 text-burgundy dark:text-rosegold shadow-inner">
                    <MapPin className="w-4 h-4 text-rosegold" />
                  </div>
                  <div>
                    <span className="text-charcoal/70 dark:text-cream/70 block">Location:</span>
                    <span className="font-semibold text-burgundy dark:text-cream">
                      {profile.location || 'India'}
                    </span>
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
