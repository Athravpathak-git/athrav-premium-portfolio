'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  ExternalLink,
  Eye,
  Award,
} from 'lucide-react';

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/certifications')
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
        setStatusMsg({ type: 'error', text: 'Failed to retrieve certifications list.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenEditor = (item?: any) => {
    if (item) {
      setEditingItem({ ...item });
      setSkillsInput(item.relatedSkills?.join(', ') || '');
      setIsCreating(false);
    } else {
      setEditingItem({
        title: '',
        slug: '',
        issuer: '',
        category: 'Machine Learning',
        issueDate: '',
        credentialId: '',
        credentialUrl: '',
        description: '',
        relatedSkills: ['Python', 'Machine Learning'],
        isFeatured: false,
        sortOrder: items.length + 1,
        isPublished: false, // Default draft
      });
      setSkillsInput('Python, Machine Learning');
      setIsCreating(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const isEdit = !!editingItem?.id;
    const url = '/api/admin/certifications';
    const method = isEdit ? 'PUT' : 'POST';

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      ...editingItem,
      relatedSkills: parsedSkills,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save certification.');

      setStatusMsg({
        type: 'success',
        text: isEdit ? 'Certification updated.' : 'Certification created.',
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
    if (!confirm(`Are you sure you want to permanently delete credential "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/certifications?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete certification.');

      setStatusMsg({ type: 'success', text: `Certification "${title}" removed.` });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Certifications Management</h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            MANAGE COURSEWORK CREDENTIALS, VERIFICATION IDS & ISSUER METADATA
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenEditor()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Credential Record</span>
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
        <div className="p-6 rounded-2xl border border-white/20 bg-zinc-950 p-6 sm:p-8 space-y-5 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">
              {editingItem?.id ? `Edit: ${editingItem.title}` : 'Create Certification Record'}
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
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Certification Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-');
                    setEditingItem({
                      ...editingItem,
                      title,
                      slug: editingItem.slug || slug,
                    });
                  }}
                  placeholder="e.g. Machine Learning Specialization"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editingItem.slug || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                  placeholder="e.g. coursera-ml-specialization"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.issuer || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                  placeholder="e.g. Coursera / DeepLearning.AI"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Category</label>
                <select
                  value={editingItem.category || 'Machine Learning'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Credential ID</label>
                <input
                  type="text"
                  value={editingItem.credentialId || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, credentialId: e.target.value })}
                  placeholder="e.g. ABC123XYZ"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Online Verification URL
                </label>
                <input
                  type="url"
                  value={editingItem.credentialUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, credentialUrl: e.target.value })}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Description / Syllabus Notes
              </label>
              <textarea
                rows={3}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Related Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, Scikit-Learn, Linear Regression"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                <input
                  type="checkbox"
                  checked={editingItem.isFeatured || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-zinc-900 text-silver-400"
                />
                <span>Featured Credential (Homepage priority)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-zinc-900 text-silver-400"
                />
                <span>Published (Visible on Public Website)</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-lg shadow-white/10"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Credential</span>
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
              <th className="p-4">Certificate</th>
              <th className="p-4">Issuer</th>
              <th className="p-4">Category</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="p-4 font-semibold text-white">{item.title}</td>
                <td className="p-4 text-zinc-300">{item.issuer}</td>
                <td className="p-4 font-mono text-silver-300">{item.category}</td>
                <td className="p-4">
                  {item.credentialUrl ? (
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> URL Verified
                    </span>
                  ) : (
                    <span className="text-amber-400 font-mono">Draft Record</span>
                  )}
                </td>
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
                  {item.isPublished && (
                    <Link
                      href={`/certifications/${item.slug}`}
                      target="_blank"
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white inline-block"
                      title="Preview Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEditor(item)}
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
