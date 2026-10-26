'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Lock, User, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

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
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-charcoal/70 hover:text-burgundy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-burgundy border border-burgundy-700 flex items-center justify-center mx-auto text-rosegold shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-burgundy">
            Administrative Portal
          </h1>
          <p className="text-xs font-mono text-rosegold font-semibold tracking-wider">
            ATHRAV PATHAK PORTFOLIO CMS • SECURE ACCESS
          </p>
        </div>

        {/* Login Form Box */}
        <div className="rounded-2xl border border-border-soft bg-white p-8 space-y-6 shadow-xl">
          {sessionExpiredNotice && (
            <div className="p-4 rounded-xl border border-rosegold/50 bg-rosegold-50 text-burgundy text-xs flex items-start gap-3 animate-fade-in shadow-sm">
              <AlertCircle className="w-4 h-4 text-rosegold shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Session Required</p>
                <p className="text-charcoal/80 mt-0.5">Your administrative session has expired or is invalid. Please authenticate below to access the CMS.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-900 text-xs flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Failed</p>
                <p className="text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin_identifier"
                className="block text-xs font-mono font-medium text-charcoal/80 mb-1.5"
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
                  placeholder="athrav_admin"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 pl-10 text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-burgundy transition-all"
                />
                <User className="w-4 h-4 text-rosegold absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin_password"
                className="block text-xs font-mono font-medium text-charcoal/80 mb-1.5"
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
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 pl-10 text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-burgundy transition-all"
                />
                <Lock className="w-4 h-4 text-rosegold absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'checking'}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-sm transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-border-soft bg-cream-50 hover:bg-cream-100 text-charcoal text-xs font-mono transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-rosegold" />
              <span>Fill Local Dev Credentials (athrav_admin)</span>
            </button>
          </div>

          {/* Dev Mode Credentials Guide */}
          <div className="pt-4 border-t border-border-soft text-center">
            <p className="text-[11px] font-mono text-charcoal/70">
              Default credentials: <span className="font-bold text-burgundy font-mono">athrav_admin</span> / <span className="font-bold text-burgundy font-mono">ReplaceWithStrongPassword123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
