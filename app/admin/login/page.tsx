'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication rejected. Please check your credentials.');
      }

      // Successful login
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setStatus('error');
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-silver-500/10 blur-3xl pointer-events-none -top-20" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center mx-auto text-silver-300 shadow-xl shadow-black/80">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Administrative Portal
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            ATHRAV PATHAK PORTFOLIO CMS • SECURE ACCESS
          </p>
        </div>

        {/* Login Form Box */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl p-8 space-y-6 shadow-2xl">
          {status === 'error' && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Authentication Failed</p>
                <p className="text-red-200/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin_identifier"
                className="block text-xs font-mono text-zinc-300 mb-1.5"
              >
                Username or Email
              </label>
              <div className="relative">
                <input
                  id="admin_identifier"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@athravpathak.dev"
                  className="w-full bg-zinc-900/70 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-silver-400 focus:border-transparent transition-all"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin_password"
                className="block text-xs font-mono text-zinc-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin_password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900/70 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-silver-400 focus:border-transparent transition-all"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-xl shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          {/* Dev Mode Credentials Guide */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] font-mono text-zinc-400">
              Initial setup uses credentials in <code className="text-silver-300 font-mono">.env.example</code>.
              Run <code className="text-silver-300 font-mono">npm run seed:admin</code> to provision PostgreSQL admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
