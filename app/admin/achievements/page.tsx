'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, X, Trophy } from 'lucide-react';

export default function AdminAchievementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/achievements')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setItems(data.items || []);
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve achievements.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const isEdit = !!editingItem?.id;
    const url = '/api/admin/achievements';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save milestone.');

      setStatusMsg({
        type: 'success',
        text: isEdit ? 'Milestone updated.' : 'Milestone created.',
      });
      setEditingItem(null);
      setIsCreating(false);
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove milestone "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/achievements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete milestone.');

      setStatusMsg({ type: 'success', text: 'Milestone removed.' });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Achievements & Milestones</h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            MANAGE LEARNING MILESTONES & VERIFIED ACADEMIC PROGRESS
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingItem({
              title: '',
              category: 'Academic Milestone',
              issuer: '',
              date: '2026',
              description: '',
              sortOrder: items.length + 1,
              isPublished: true,
            });
            setIsCreating(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Milestone</span>
        </button>
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

      {/* Editor Modal */}
      {(isCreating || editingItem) && (
        <div className="p-6 rounded-2xl border border-white/20 bg-zinc-950 p-6 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-semibold text-white">
              {editingItem?.id ? 'Edit Milestone' : 'Create New Milestone'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsCreating(false);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Advancing to Second Year BCA"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Category</label>
                <input
                  type="text"
                  value={editingItem.category || 'Academic Milestone'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  placeholder="Academic Milestone / Technical Milestone"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Issuer / Context</label>
                <input
                  type="text"
                  value={editingItem.issuer || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                  placeholder="e.g. BCA Degree Coursework"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Date / Year</label>
                <input
                  type="text"
                  value={editingItem.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  placeholder="2025-2026"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white resize-y"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished ?? true}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-zinc-900 text-silver-400"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Milestone</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listing Table */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/60 border-b border-white/10 font-mono text-zinc-400 uppercase">
            <tr>
              <th className="p-4">Milestone</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="p-4 font-semibold text-white">{item.title}</td>
                <td className="p-4 text-zinc-300 font-mono">{item.category}</td>
                <td className="p-4 font-mono text-zinc-400">{item.date || '—'}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                      item.isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({ ...item });
                      setIsCreating(false);
                    }}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
