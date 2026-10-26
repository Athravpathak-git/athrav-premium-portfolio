'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';

export default function AdminEducationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/education')
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
        setStatusMsg({ type: 'error', text: 'Failed to retrieve education records.' });
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
    const url = '/api/admin/education';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save education record.');

      setStatusMsg({
        type: 'success',
        text: isEdit ? 'Education record updated.' : 'Education record created.',
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      const res = await fetch(`/api/admin/education?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record.');

      setStatusMsg({ type: 'success', text: 'Education record deleted.' });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">Education Management</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            MANAGE ATHRAV PATHAK UNDERGRADUATE & ACADEMIC CREDENTIALS
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingItem({
              institution: '',
              degree: 'Bachelor of Computer Applications (BCA)',
              fieldOfStudy: '',
              status: 'Second Year (In Progress)',
              description: '',
              sortOrder: items.length + 1,
              isPublished: true,
            });
            setIsCreating(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education Record</span>
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
              {editingItem?.id ? 'Edit Education Record' : 'Create Education Record'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Degree Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.degree || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                  placeholder="Bachelor of Computer Applications (BCA)"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Institution *</label>
                <input
                  type="text"
                  required
                  value={editingItem.institution || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                  placeholder="University Program"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Field of Study</label>
                <input
                  type="text"
                  value={editingItem.fieldOfStudy || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, fieldOfStudy: e.target.value })}
                  placeholder="Computer Applications / Artificial Intelligence"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Status Tag</label>
                <input
                  type="text"
                  required
                  value={editingItem.status || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  placeholder="Second Year (In Progress)"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal resize-y"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded bg-cream-50 text-silver-400"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100/70 border-b border-border-soft font-mono text-charcoal/70 uppercase">
            <tr>
              <th className="p-4">Degree</th>
              <th className="p-4">Institution</th>
              <th className="p-4">Status</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                <td className="p-4 font-semibold text-burgundy">{item.degree}</td>
                <td className="p-4 text-charcoal/85">{item.institution}</td>
                <td className="p-4 font-mono text-emerald-400">{item.status}</td>
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
                <td className="p-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({ ...item });
                      setIsCreating(false);
                    }}
                    className="p-1.5 rounded hover:bg-cream-100 text-charcoal/85 hover:text-burgundy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-cream-100 text-charcoal/70 hover:text-red-400"
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
