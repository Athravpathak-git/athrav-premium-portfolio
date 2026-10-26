'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Lock, User, AlertCircle, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'loading' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Check if session is already active or if user arrived via expiration redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'session_expired') {
        setSessionExpiredNotice(true);
      }
    }

    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.authenticated) {
          const params = new URLSearchParams(window.location.search);
          const destination = params.get('from') || '/admin';
          window.location.href = destination;
        } else {
          setStatus('idle');
        }
      })
      .catch(() => {
        if (isMounted) setStatus('idle');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fillDevCredentials = () => {
    setIdentifier('athrav_admin');
    setPassword('ReplaceWithStrongPassword123!');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setSessionExpiredNotice(false);

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

      // Hard HTTP navigation to bypass client router cache and guarantee cookie delivery
      const params = new URLSearchParams(window.location.search);
      const destination = params.get('from') || '/admin';
      window.location.href = destination;
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
          {sessionExpiredNotice && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Session Required</p>
                <p className="text-amber-200/90 mt-0.5">Your administrative session has expired or is invalid. Please authenticate below to access the CMS.</p>
              </div>
            </div>
          )}

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
              disabled={status === 'loading' || status === 'checking'}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-xl shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : status === 'checking' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Active Session...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Shortcut for Local Dev Mode */}
          <div className="pt-2">
            <button
              type="button"
              onClick={fillDevCredentials}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-white/20 bg-zinc-900/50 hover:bg-zinc-900 text-silver-300 text-xs font-mono transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Local Dev Credentials (athrav_admin)</span>
            </button>
          </div>

          {/* Dev Mode Credentials Guide */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] font-mono text-zinc-400">
              Default credentials: <span className="text-silver-300 font-mono">athrav_admin</span> / <span className="text-silver-300 font-mono">ReplaceWithStrongPassword123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
