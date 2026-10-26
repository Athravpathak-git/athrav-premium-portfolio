import React from 'react';
import Link from 'next/link';
import { Github, Mail, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-burgundy-800 bg-burgundy text-cream py-16 relative overflow-hidden">
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
            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosegold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rosegold"></span>
              </span>
              <span className="text-xs font-mono text-rosegold-200">
                Available for internships & creative collaborations
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rosegold mb-4 font-mono">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-rosegold mb-4 font-mono">
              Channels & Connect
            </h4>
            <ul className="space-y-2.5 text-sm text-blush-100">
              <li>
                <a
                  href="https://github.com/Athravpathak-git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-cream transition-colors group"
                >
                  <Github className="w-4 h-4 text-rosegold group-hover:text-cream" />
                  <span>GitHub Profile</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 hover:text-cream transition-colors group"
                >
                  <Mail className="w-4 h-4 text-rosegold group-hover:text-cream" />
                  <span>Contact Inquiries</span>
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-blush-300">
          <p>© {currentYear} Athrav Pathak. All rights reserved.</p>
          <p className="text-rosegold-300">Curated with Burgundy & Soft Cream Luxury Editorial Design</p>
        </div>
      </div>
    </footer>
  );
}
