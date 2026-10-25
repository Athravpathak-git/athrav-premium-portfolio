'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Trap field: if filled, spam bots caught
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch message. Please try again.');
      }

      setStatus('success');
      setSuccessMessage(data.message || 'Thank you! Your message has been received.');
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    } catch (err: unknown) {
      setStatus('error');
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected transmission error occurred.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot field (hidden from screen readers & users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website_input">Leave this field empty</label>
        <input
          id="company_website_input"
          type="text"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === 'success' && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Message Delivered</p>
            <p className="text-xs text-emerald-200/90 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Submission Error</p>
            <p className="text-xs text-red-200/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_name" className="block text-xs font-mono text-zinc-300 mb-1.5">
            Your Name *
          </label>
          <input
            id="contact_name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-silver-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-xs font-mono text-zinc-300 mb-1.5">
            Email Address *
          </label>
          <input
            id="contact_email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="sarah@example.com"
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-silver-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact_subject" className="block text-xs font-mono text-zinc-300 mb-1.5">
          Subject *
        </label>
        <input
          id="contact_subject"
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="AI Internship Opportunity / Project Collaboration"
          className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-silver-400 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="contact_message" className="block text-xs font-mono text-zinc-300 mb-1.5">
          Message *
        </label>
        <textarea
          id="contact_message"
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Please share details about your inquiry, project scope, or opportunity..."
          className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-silver-400 focus:border-transparent transition-all resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-silver-100 via-silver-200 to-silver-300 hover:from-white hover:to-silver-100 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-lg shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transmitting...</span>
          </>
        ) : (
          <>
            <span>Send Secure Message</span>
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
