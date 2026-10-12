import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl glass-panel text-slate-400">
          <Compass className="w-12 h-12 stroke-[1.2]" />
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            404 Error
          </p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you requested does not exist or has been relocated within the architecture.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
