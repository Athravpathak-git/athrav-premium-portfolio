'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, X, Star } from 'lucide-react';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Databases',
  'Artificial Intelligence',
  'Machine Learning',
  'Tools and Platforms',
  'Other',
];

export default function AdminSkillsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/skills')
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
        setStatusMsg({ type: 'error', text: 'Failed to retrieve skills records.' });
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
    const url = '/api/admin/skills';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save skill.');

      setStatusMsg({ type: 'success', text: isEdit ? 'Skill updated.' : 'Skill added.' });
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete skill.');

      setStatusMsg({ type: 'success', text: 'Skill removed.' });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-burgundy">Skills Matrix</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            MANAGE CATEGORIZED PROGRAMMING, AI, AND TOOL COMPETENCIES
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingItem({
              name: '',
              category: 'Programming',
              proficiency: 'Intermediate',
              description: '',
              isFeatured: false,
              sortOrder: items.length + 1,
              isPublished: true,
            });
            setIsCreating(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Skill</span>
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

      {/* Editor Modal / Inline Form */}
      {(isCreating || editingItem) && (
        <div className="p-6 rounded-2xl border border-border-soft bg-white p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            <h3 className="text-base font-semibold text-burgundy">
              {editingItem?.id ? 'Edit Skill Record' : 'Create New Skill'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsCreating(false);
              }}
              className="p-1 rounded text-charcoal/70 hover:text-burgundy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. PyTorch"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Category *</label>
                <select
                  value={editingItem.category || 'Programming'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-sm text-charcoal"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Proficiency</label>
                <select
                  value={editingItem.proficiency || 'Intermediate'}
                  onChange={(e) => setEditingItem({ ...editingItem, proficiency: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-sm text-charcoal"
                >
                  <option value="Exploring">Exploring (Coursework)</option>
                  <option value="Intermediate">Intermediate (Project Use)</option>
                  <option value="Proficient">Proficient (Solid Practice)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Description / Context</label>
              <input
                type="text"
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="e.g. Tensor operations and loss function optimization."
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85">
                <input
                  type="checkbox"
                  checked={editingItem.isFeatured || false}
                  onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded bg-cream-50 dark:bg-charcoal-700 accent-burgundy text-burgundy"
                />
                <span>Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded bg-cream-50 dark:bg-charcoal-700 accent-burgundy text-burgundy"
                />
                <span>Published</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Skill</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skills Table */}
      <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-cream-100/70 dark:bg-charcoal-700 border-b border-border-soft dark:border-charcoal-600 font-mono text-charcoal/70 dark:text-cream/70 uppercase">
              <tr>
                <th className="p-4">Skill</th>
                <th className="p-4">Category</th>
                <th className="p-4">Proficiency</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft dark:divide-charcoal-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700/50 transition-colors">
                  <td className="p-4 font-semibold text-burgundy dark:text-cream">{item.name}</td>
                  <td className="p-4 text-charcoal/85 dark:text-cream/85 font-mono">{item.category}</td>
                  <td className="p-4 font-mono text-charcoal/80 dark:text-cream/80">{item.proficiency}</td>
                  <td className="p-4">
                    {item.isFeatured ? (
                      <span className="text-amber-400 font-mono flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> Yes
                      </span>
                    ) : (
                      <span className="text-charcoal/60 font-mono">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                        item.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-cream-100 text-charcoal/70 border border-border-soft'
                      }`}
                    >
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({ ...item });
                        setIsCreating(false);
                      }}
                      className="p-2 rounded-lg hover:bg-cream-100 text-charcoal/85 hover:text-burgundy inline-flex items-center justify-center min-h-[36px] min-w-[36px]"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-cream-100 text-charcoal/70 hover:text-red-400 inline-flex items-center justify-center min-h-[36px] min-w-[36px]"
                      aria-label={`Delete ${item.name}`}
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
    </div>
  );
}
