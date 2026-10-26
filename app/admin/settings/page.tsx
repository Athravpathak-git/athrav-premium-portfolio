'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Mail,
  Globe,
  SunMoon,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.settings) setSettings(data.settings);
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve website settings.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update website settings.');

      setStatusMsg({ type: 'success', text: 'Settings updated successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-silver-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-border-soft">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">System Settings</h1>
        <p className="text-xs font-mono text-charcoal/70 mt-1">
          GLOBAL SEO, EMAIL NOTIFICATIONS, DATABASE GUIDELINES & APPEARANCE
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SEO Configuration */}
        <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-silver-300" />
            <h3 className="text-sm font-semibold text-burgundy">Global SEO & Metadata</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Website Brand Title</label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Default Meta Title
              </label>
              <input
                type="text"
                value={settings.metaTitle || ''}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={2}
                value={settings.metaDescription || ''}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal resize-y"
              />
            </div>
          </div>
        </div>

        {/* Email Notification Settings */}
        <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-silver-300" />
            <h3 className="text-sm font-semibold text-burgundy">Email Dispatch & Notifications</h3>
          </div>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Configure the administrative recipient email for incoming inquiries. In development,
            emails are simulated safely in console logs without external credentials.
          </p>

          <div>
            <label className="block text-xs font-mono text-charcoal/85 mb-1">
              Recipient Email for Inquiries
            </label>
            <input
              type="email"
              value={settings.notificationEmail || 'athravpathak07@gmail.com'}
              onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
              className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal font-mono"
            />
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <SunMoon className="w-4 h-4 text-silver-300" />
            <h3 className="text-sm font-semibold text-burgundy">Appearance & Theme Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Default Theme</label>
              <select
                value={settings.themeDefault || 'dark'}
                onChange={(e) => setSettings({ ...settings, themeDefault: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-sm text-charcoal"
              >
                <option value="dark">Dark (Apple Luxury Tech)</option>
                <option value="light">Light (Silver Monochrome)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Theme Switcher</label>
              <select
                value={settings.allowThemeToggle || 'true'}
                onChange={(e) => setSettings({ ...settings, allowThemeToggle: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-sm text-charcoal"
              >
                <option value="true">Enabled (Allow User Toggle)</option>
                <option value="false">Enforce Dark Mode Only</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-lg shadow-md disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Website Settings</span>
        </button>
      </form>

      {/* Manual Neon Database Connection Instructions */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-silver-300" />
          <h3 className="text-sm font-semibold text-burgundy">Manual Neon PostgreSQL Integration Guide</h3>
        </div>
        <p className="text-xs text-charcoal/70 leading-relaxed">
          When you are ready to connect your production Neon PostgreSQL database:
        </p>

        <ol className="space-y-2 text-xs font-mono text-charcoal/85 list-decimal list-inside leading-relaxed">
          <li>Create a project in your Neon console and copy the PostgreSQL connection strings.</li>
          <li>Set <code className="text-silver-300 font-mono">DATABASE_URL</code> and <code className="text-silver-300 font-mono">DIRECT_URL</code> in your <code className="text-silver-300 font-mono">.env.local</code>.</li>
          <li>Run <code className="text-silver-300 font-mono">npm run prisma:deploy</code> or <code className="text-silver-300 font-mono">npx prisma migrate deploy</code>.</li>
          <li>Run <code className="text-silver-300 font-mono">npm run seed:admin</code> with your environment credentials to insert your super admin.</li>
          <li>Restart Next.js. The app will immediately switch from dev mock mode to live Neon persistence!</li>
        </ol>
      </div>
    </div>
  );
}
