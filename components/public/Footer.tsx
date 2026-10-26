import React from 'react';
import Link from 'next/link';
import { Github, Mail, ArrowUpRight, Cpu } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-forest-900/10 dark:border-forest-800 bg-forest text-cream-200 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-600/40">
          {/* Identity column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-ivory text-forest flex items-center justify-center font-bold shadow-sm">
                <Cpu className="w-4 h-4 text-forest" />
              </div>
              <span className="text-ivory font-bold tracking-wider text-sm">
                ATHRAV PATHAK
              </span>
            </div>
            <p className="text-sm text-sage-200 max-w-md leading-relaxed">
              Aspiring AI Engineer currently pursuing Bachelor of Computer Applications (BCA) in second year.
              Engineering intelligent digital solutions at the intersection of machine learning and modern web technologies.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-champagne-500"></span>
              </span>
              <span className="text-xs font-mono text-sage-200">
                Available for internships & AI project collaborations
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ivory mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-sage-100">
              <li>
                <Link href="/about" className="hover:text-ivory transition-colors">
                  About Journey
                </Link>
              </li>
              <li>
                <Link href="/education" className="hover:text-ivory transition-colors">
                  Academic Path (BCA)
                </Link>
              </li>
              <li>
                <Link href="/skills" className="hover:text-ivory transition-colors">
                  Technical Skills
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-ivory transition-colors">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/certifications" className="hover:text-ivory transition-colors">
                  Certifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ivory mb-4 font-mono">
              Channels & Connect
            </h4>
            <ul className="space-y-2.5 text-sm text-sage-100">
              <li>
                <a
                  href="https://github.com/Athravpathak-git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-ivory transition-colors group"
                >
                  <Github className="w-4 h-4 text-sage-200 group-hover:text-ivory" />
                  <span>GitHub Profile</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 hover:text-ivory transition-colors group"
                >
                  <Mail className="w-4 h-4 text-sage-200 group-hover:text-ivory" />
                  <span>Contact Inquiries</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 hover:text-ivory transition-colors font-mono text-xs opacity-70 hover:opacity-100"
                >
                  <span>Portal Administration</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-sage-300">
          <p>© {currentYear} Athrav Pathak. Engineered with Next.js, TypeScript & Three.js.</p>
          <p className="text-champagne-300">Forest Green & Warm Cream Visual Identity</p>
        </div>
      </div>
    </footer>
  );
}
