import React from 'react';
import Link from 'next/link';
import { Github, Mail, ArrowUpRight, Cpu } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-zinc-950 dark:bg-black text-zinc-400 py-16 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-silver-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Identity column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-silver-300" />
              </div>
              <span className="text-white font-semibold tracking-wider text-sm">
                ATHRAV PATHAK
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Aspiring AI Engineer currently pursuing Bachelor of Computer Applications (BCA) in second year.
              Engineering intelligent digital solutions at the intersection of machine learning and modern web technologies.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Available for internships & AI project collaborations
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Journey
                </Link>
              </li>
              <li>
                <Link href="/education" className="hover:text-white transition-colors">
                  Academic Path (BCA)
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-white transition-colors">
                  Technical Skills
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-white transition-colors">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-4 font-mono">
              Channels & Connect
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/Athravpathak-git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                >
                  <Github className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                  <span>GitHub Profile</span>
                  <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                >
                  <Mail className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                  <span>Contact Inquiries</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono pt-2 inline-block"
                >
                  Administrative Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {currentYear} Athrav Pathak. All rights reserved.</p>
          <p className="font-mono text-zinc-400">
            Engineered with Next.js App Router, Three.js & PostgreSQL architecture.
          </p>
        </div>
      </div>
    </footer>
  );
}
