import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getProfile, getSocialLinksList } from '@/lib/data-service';
import { SocialIcon } from '@/components/common/SocialIcon';

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const profile = await getProfile().catch(() => null);
  const socialLinks = await getSocialLinksList({
    publishedOnly: true,
    placement: 'footer',
  }).catch(() => []);

  const verifiedEmail = profile?.email || 'athravpathak07@gmail.com';

  return (
    <footer className="border-t border-burgundy-800 dark:border-burgundy-950/80 bg-burgundy dark:bg-[#12070A] text-cream py-16 relative overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-burgundy-700/60">
          {/* Identity column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-cream font-serif font-bold tracking-tight text-lg">
                ATHRAV PATHAK
              </span>
            </div>
            <p className="text-sm text-blush-200 max-w-md leading-relaxed">
              Creative Developer & Aspiring AI Engineer pursuing Bachelor of Computer Applications (BCA).
              Building thoughtful digital experiences at the intersection of machine learning and modern web technologies.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosegold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rosegold"></span>
                </span>
                <span className="text-xs font-mono text-rosegold-200">
                  Available for internships & creative collaborations
                </span>
              </div>
              <div className="text-xs font-mono text-blush-200/90">
                Direct Contact:{' '}
                <a
                  href={`mailto:${verifiedEmail}`}
                  className="text-cream underline underline-offset-4 hover:text-rosegold transition-colors font-medium"
                >
                  {verifiedEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rosegold-200 mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-blush-100">
              <li>
                <Link href="/about" className="hover:text-cream transition-colors">
                  About Journey
                </Link>
              </li>
              <li>
                <Link href="/education" className="hover:text-cream transition-colors">
                  Academic Path (BCA)
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-cream transition-colors">
                  Technical Stack
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-cream transition-colors">
                  Selected Projects
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-cream transition-colors">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rosegold-200 mb-4 font-mono">
              Channels & Connect
            </h4>
            <ul className="space-y-2.5 text-sm text-blush-100">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => {
                  const isEmail = link.platform === 'email';
                  const href = isEmail
                    ? `mailto:${verifiedEmail}`
                    : link.url;
                  const displayLabel = isEmail ? verifiedEmail : link.label;

                  return (
                    <li key={link.id}>
                      <a
                        href={href}
                        target={isEmail ? undefined : '_blank'}
                        rel={isEmail ? undefined : 'noopener noreferrer'}
                        className="inline-flex items-center gap-2 hover:text-cream transition-colors group"
                        aria-label={displayLabel}
                      >
                        <SocialIcon
                          platform={link.platform}
                          iconName={link.icon}
                          className="w-4 h-4 text-rosegold group-hover:text-cream transition-colors"
                        />
                        <span>{displayLabel}</span>
                        {!isEmail && (
                          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                        )}
                      </a>
                    </li>
                  );
                })
              ) : (
                <>
                  <li>
                    <a
                      href="https://github.com/Athravpathak-git"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-cream transition-colors group"
                    >
                      <SocialIcon platform="github" className="w-4 h-4 text-rosegold group-hover:text-cream" />
                      <span>GitHub Profile</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${verifiedEmail}`}
                      className="inline-flex items-center gap-1.5 hover:text-cream transition-colors group"
                    >
                      <SocialIcon platform="email" className="w-4 h-4 text-rosegold group-hover:text-cream" />
                      <span>{verifiedEmail}</span>
                    </a>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 hover:text-cream transition-colors group text-rosegold-200 hover:text-cream pt-1 font-medium"
                >
                  <span>Contact Form Inquiries →</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-rosegold-300 hover:text-cream pt-2"
                >
                  <span>Admin Access</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-blush-200">
          <p>© {currentYear} Athrav Pathak. All rights reserved.</p>
          <p className="text-rosegold-200">Curated with Burgundy & Soft Cream Luxury Editorial Design</p>
        </div>
      </div>
    </footer>
  );
}
