'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Save, Sliders, Eye, EyeOff } from 'lucide-react';

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSections = () => {
    fetch('/api/admin/homepage')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setSections(data.sections || []);
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve homepage sections.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleUpdate = async (section: any) => {
    setSavingKey(section.sectionKey);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update section.');

      setStatusMsg({ type: 'success', text: `Section "${section.title}" updated.` });
      fetchSections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleEnable = (sec: any) => {
    const updated = { ...sec, isEnabled: !sec.isEnabled };
    handleUpdate(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-6 border-b border-border-soft dark:border-charcoal-700">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy dark:text-cream">Homepage Sections</h1>
          <p className="text-xs font-mono text-charcoal/70 dark:text-cream/70 mt-1">
            CONTROL SECTION VISIBILITY, HEADINGS & DISPLAY ORDER ACROSS THE HOMEPAGE
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((sec) => (
          <div
            key={sec.sectionKey}
            className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-soft dark:border-charcoal-700">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cream-50 dark:bg-charcoal-700 border border-border-soft dark:border-charcoal-600 text-burgundy dark:text-cream font-semibold">
                  {sec.sectionKey}
                </span>
                <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70">
                  Order: #{sec.sortOrder}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleEnable(sec)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    sec.isEnabled
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-border-soft dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-700 text-charcoal/70 dark:text-cream/70'
                  }`}
                >
                  {sec.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{sec.isEnabled ? 'Visible on Homepage' : 'Hidden'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 dark:text-cream/85 mb-1">Section Title</label>
                <input
                  type="text"
                  value={sec.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSections(
                      sections.map((s) => (s.sectionKey === sec.sectionKey ? { ...s, title: val } : s))
                    );
                  }}
                  className="w-full bg-cream-50 dark:bg-charcoal-700/60 border border-border-soft dark:border-charcoal-600 rounded-xl px-4 py-2 text-sm text-charcoal dark:text-cream"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 dark:text-cream/85 mb-1">Subtitle / Eyebrow</label>
                <input
                  type="text"
                  value={sec.subtitle || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSections(
                      sections.map((s) =>
                        s.sectionKey === sec.sectionKey ? { ...s, subtitle: val } : s
                      )
                    );
                  }}
                  className="w-full bg-cream-50 dark:bg-charcoal-700/60 border border-border-soft dark:border-charcoal-600 rounded-xl px-4 py-2 text-sm text-charcoal dark:text-cream"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 dark:text-cream/85 mb-1">Description</label>
              <textarea
                rows={2}
                value={sec.description || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSections(
                    sections.map((s) =>
                      s.sectionKey === sec.sectionKey ? { ...s, description: val } : s
                    )
                  );
                }}
                className="w-full bg-cream-50 dark:bg-charcoal-700/60 border border-border-soft dark:border-charcoal-600 rounded-xl px-4 py-2 text-sm text-charcoal dark:text-cream resize-y"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={savingKey === sec.sectionKey}
                onClick={() => handleUpdate(sec)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-cream font-bold text-xs transition-colors disabled:opacity-60"
              >
                {savingKey === sec.sectionKey ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Update Section</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
