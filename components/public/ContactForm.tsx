'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Spam trap
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
      {/* Honeypot field (hidden from users) */}
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
        <div className="p-4 rounded-xl border border-rosegold/50 dark:border-rosegold/60 bg-rosegold-50 dark:bg-rosegold-900/30 text-burgundy dark:text-cream text-sm flex items-start gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-burgundy dark:text-rosegold shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Message Delivered</p>
            <p className="text-xs text-charcoal/80 dark:text-cream/80 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Submission Error</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_name" className="block text-xs font-mono font-medium text-charcoal/80 dark:text-cream/80 mb-1.5">
            Your Name *
          </label>
          <input
            id="contact_name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
            className="w-full bg-cream-50 dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 rounded-xl px-4 py-2.5 text-sm text-charcoal dark:text-cream placeholder-charcoal/40 dark:placeholder-cream/35 focus:outline-none focus:ring-2 focus:ring-burgundy dark:focus:ring-rosegold focus:border-burgundy dark:focus:border-rosegold transition-all"
          />
        </div>

        <div>
          <label htmlFor="contact_email" className="block text-xs font-mono font-medium text-charcoal/80 dark:text-cream/80 mb-1.5">
            Your Email *
          </label>
          <input
            id="contact_email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. sarah@example.com"
            className="w-full bg-cream-50 dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 rounded-xl px-4 py-2.5 text-sm text-charcoal dark:text-cream placeholder-charcoal/40 dark:placeholder-cream/35 focus:outline-none focus:ring-2 focus:ring-burgundy dark:focus:ring-rosegold focus:border-burgundy dark:focus:border-rosegold transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact_subject" className="block text-xs font-mono font-medium text-charcoal/80 dark:text-cream/80 mb-1.5">
          Subject *
        </label>
        <input
          id="contact_subject"
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="e.g. Internship Inquiry / Collaboration"
          className="w-full bg-cream-50 dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 rounded-xl px-4 py-2.5 text-sm text-charcoal dark:text-cream placeholder-charcoal/40 dark:placeholder-cream/35 focus:outline-none focus:ring-2 focus:ring-burgundy dark:focus:ring-rosegold focus:border-burgundy dark:focus:border-rosegold transition-all"
        />
      </div>

      <div>
        <label htmlFor="contact_message" className="block text-xs font-mono font-medium text-charcoal/80 dark:text-cream/80 mb-1.5">
          Message *
        </label>
        <textarea
          id="contact_message"
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Describe your inquiry, project scope, or opportunity..."
          className="w-full bg-cream-50 dark:bg-charcoal-800 border border-border-soft dark:border-charcoal-700 rounded-xl p-4 text-sm text-charcoal dark:text-cream placeholder-charcoal/40 dark:placeholder-cream/35 focus:outline-none focus:ring-2 focus:ring-burgundy dark:focus:ring-rosegold focus:border-burgundy dark:focus:border-rosegold transition-all resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-500 dark:bg-burgundy dark:hover:bg-burgundy-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-60 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy dark:focus-visible:ring-rosegold"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Secure Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
