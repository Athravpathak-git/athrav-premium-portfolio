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
  Star,
  Layers,
} from 'lucide-react';

export default function AdminProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/projects')
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
        setStatusMsg({ type: 'error', text: 'Failed to retrieve projects list.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenEditor = (item?: any) => {
    if (item) {
      setEditingItem({ ...item });
      setTechInput(item.techStack?.join(', ') || '');
      setIsCreating(false);
    } else {
      setEditingItem({
        title: '',
        slug: '',
        subtitle: '',
        summary: '',
        description: '',
        category: 'Artificial Intelligence',
        isFeatured: false,
        techStack: ['Python', 'TypeScript'],
        liveUrl: '',
        repoUrl: 'https://github.com/Athravpathak-git',
        architectureSummary: '',
        challenges: '',
        solutions: '',
        results: '',
        futureImprovements: '',
        sortOrder: items.length + 1,
        isPublished: false, // Default draft per requirements
      });
      setTechInput('Python, TypeScript');
      setIsCreating(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const isEdit = !!editingItem?.id;
    const url = '/api/admin/projects';
    const method = isEdit ? 'PUT' : 'POST';

    // Parse tech tags from comma-separated input
    const parsedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      ...editingItem,
      techStack: parsedTech.length > 0 ? parsedTech : ['Python'],
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project.');

      setStatusMsg({
        type: 'success',
        text: isEdit ? 'Project updated successfully.' : 'Project created successfully.',
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
    if (!confirm(`Are you sure you want to permanently delete project "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete project.');

      setStatusMsg({ type: 'success', text: `Project "${title}" deleted.` });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">Projects Management</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            MANAGE AI IMPLEMENTATIONS, ARCHITECTURES, DRAFTS & REPOSITORIES
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenEditor()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
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

      {/* Editor Modal / Section */}
      {(isCreating || editingItem) && (
        <div className="p-6 rounded-2xl border border-border-soft bg-white p-6 sm:p-8 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            <h3 className="text-lg font-serif font-bold text-burgundy">
              {editingItem?.id ? `Edit: ${editingItem.title}` : 'Create New Project Record'}
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

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Project Title *</label>
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
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editingItem.slug || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                  placeholder="e.g. omnimind-ai"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingItem.subtitle || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                  placeholder="Autonomous Agentic Intelligence Platform"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Category</label>
                <select
                  value={editingItem.category || 'Artificial Intelligence'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-sm text-charcoal"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Full Stack Engineering">Full Stack Engineering</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Summary (1-2 sentences) *</label>
              <textarea
                rows={2}
                required
                value={editingItem.summary || ''}
                onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Full Technical Description *
              </label>
              <textarea
                rows={4}
                required
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Technology Stack (comma-separated) *
              </label>
              <input
                type="text"
                required
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Next.js, TypeScript, Python, PyTorch, PostgreSQL"
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  value={editingItem.repoUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, repoUrl: e.target.value })}
                  placeholder="https://github.com/Athravpathak-git/..."
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={editingItem.liveUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, liveUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Architecture Summary / Diagram Notes
              </label>
              <textarea
                rows={2}
                value={editingItem.architectureSummary || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, architectureSummary: e.target.value })
                }
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Challenges</label>
                <textarea
                  rows={2}
                  value={editingItem.challenges || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, challenges: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Solutions</label>
                <textarea
                  rows={2}
                  value={editingItem.solutions || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, solutions: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85">
                <input
                  type="checkbox"
                  checked={editingItem.isFeatured || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-cream-50 dark:bg-charcoal-700 accent-burgundy text-burgundy"
                />
                <span>Featured Project (Homepage priority)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-cream-50 dark:bg-charcoal-700 accent-burgundy text-burgundy"
                />
                <span>Published (Visible on Public Website)</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-lg shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Project</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Listing Table */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100/70 border-b border-border-soft font-mono text-charcoal/70 uppercase">
            <tr>
              <th className="p-4">Title & Slug</th>
              <th className="p-4">Category</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-burgundy">{item.title}</div>
                  <div className="text-[10px] font-mono text-charcoal/70 mt-0.5">/{item.slug}</div>
                </td>
                <td className="p-4 text-charcoal/85 font-mono">{item.category}</td>
                <td className="p-4">
                  {item.isFeatured ? (
                    <span className="text-amber-400 font-mono flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Featured
                    </span>
                  ) : (
                    <span className="text-charcoal/60 font-mono">Standard</span>
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
                    {item.isPublished ? 'Published' : 'Draft (Hidden)'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {item.isPublished && (
                    <Link
                      href={`/projects/${item.slug}`}
                      target="_blank"
                      className="p-1.5 rounded hover:bg-cream-100 text-charcoal/85 hover:text-burgundy inline-block"
                      title="Preview on Public Site"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEditor(item)}
                    className="p-1.5 rounded hover:bg-cream-100 text-charcoal/85 hover:text-burgundy"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded hover:bg-cream-100 text-charcoal/70 hover:text-red-400"
                    title="Delete Project"
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
