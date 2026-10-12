'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // bot trap
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF defense hint
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deliver message. Please try again.');
      }

      setStatus({ submitting: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    } catch (err) {
      setStatus({ submitting: false, success: false, error: err.message });
    }
  };

  return (
    <div className="p-6 sm:p-10 rounded-2xl glass-panel space-y-6">
      {/* Live region for accessibility feedback */}
      <div aria-live="polite" className="sr-only">
        {status.success && 'Message delivered successfully.'}
        {status.error && `Error: ${status.error}`}
      </div>

      {status.success ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-medium text-white">Message Transmitted</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Thank you for reaching out. Your communication has been securely logged, and Athrav will respond shortly.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setStatus({ submitting: false, success: false, error: null })}
              className="px-4 py-2 rounded-full text-xs font-medium glass-button"
            >
              Send Another Message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {status.error && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{status.error}</span>
            </div>
          )}

          {/* Honeypot field — hidden from real users, filled by bots */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-website-field">Leave blank</label>
            <input
              id="contact-website-field"
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="contact-name" className="text-xs font-medium text-slate-300">
                Your Name <span className="text-sky-400">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Elena Rostova"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-email" className="text-xs font-medium text-slate-300">
                Email Address <span className="text-sky-400">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="elena@company.com"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="text-xs font-medium text-slate-300">
              Subject <span className="text-sky-400">*</span>
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="Engineering Role / Project Architecture Discussion"
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="contact-message" className="text-xs font-medium text-slate-300">
                Message Body <span className="text-sky-400">*</span>
              </label>
              <span id="message-hint" className="text-[11px] text-slate-500">
                Min 10 characters
              </span>
            </div>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              aria-describedby="message-hint"
              value={formData.message}
              onChange={handleChange}
              placeholder="Outline your inquiry, opportunity scope, or project details..."
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              Rate-limited & protected against automation spam.
            </p>
            <button
              type="submit"
              disabled={status.submitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-50 shadow-lg"
            >
              {status.submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
