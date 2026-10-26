'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, X, Briefcase } from 'lucide-react';

export default function AdminExperiencePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [respInput, setRespInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = () => {
    fetch('/api/admin/experience')
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
        setStatusMsg({ type: 'error', text: 'Failed to retrieve experience records.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenEditor = (item?: any) => {
    if (item) {
      setEditingItem({ ...item });
      setRespInput(item.responsibilities?.join('\n') || '');
      setTechInput(item.technologies?.join(', ') || '');
      setIsCreating(false);
    } else {
      setEditingItem({
        role: '',
        slug: '',
        company: '',
        employmentType: 'Internship',
        workplaceType: 'Remote',
        location: 'India',
        description: '',
        responsibilities: [],
        technologies: ['Python'],
        companyUrl: '',
        sortOrder: items.length + 1,
        isPublished: false,
      });
      setRespInput('');
      setTechInput('Python');
      setIsCreating(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const isEdit = !!editingItem?.id;
    const url = '/api/admin/experience';
    const method = isEdit ? 'PUT' : 'POST';

    const parsedResp = respInput
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const parsedTech = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      ...editingItem,
      responsibilities: parsedResp,
      technologies: parsedTech,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save experience record.');

      setStatusMsg({
        type: 'success',
        text: isEdit ? 'Experience record updated.' : 'Experience record added.',
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

  const handleDelete = async (id: string, role: string) => {
    if (!confirm(`Are you sure you want to delete experience record "${role}"?`)) return;

    try {
      const res = await fetch(`/api/admin/experience?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record.');

      setStatusMsg({ type: 'success', text: 'Experience record removed.' });
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
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">Experience & Internships</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            MANAGE TECHNICAL TRAINING PROGRAMS, PRACTICAL INTERNSHIPS & ROLES
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenEditor()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Experience Entry</span>
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
        <div className="p-6 rounded-2xl border border-border-soft bg-white p-6 sm:p-8 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            <h3 className="text-lg font-serif font-bold text-burgundy">
              {editingItem?.id ? `Edit: ${editingItem.role}` : 'Create Experience Entry'}
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
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Role / Position *</label>
                <input
                  type="text"
                  required
                  value={editingItem.role || ''}
                  onChange={(e) => {
                    const role = e.target.value;
                    const slug = role
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-');
                    setEditingItem({
                      ...editingItem,
                      role,
                      slug: editingItem.slug || slug,
                    });
                  }}
                  placeholder="e.g. Technical Intern"
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
                  placeholder="e.g. infosys-springboard-internship"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Organization *</label>
                <input
                  type="text"
                  required
                  value={editingItem.company || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                  placeholder="e.g. Infosys Springboard"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1">Company Website URL</label>
                <input
                  type="url"
                  value={editingItem.companyUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, companyUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Responsibilities (one per line)
              </label>
              <textarea
                rows={3}
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                placeholder="Learned software development lifecycle\nBuilt prototype data pipelines"
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Python, SQL, Git"
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-cream-50 text-silver-400"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Experience Entry</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listing Table */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100/70 border-b border-border-soft font-mono text-charcoal/70 uppercase">
            <tr>
              <th className="p-4">Role</th>
              <th className="p-4">Organization</th>
              <th className="p-4">Type</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                <td className="p-4 font-semibold text-burgundy">{item.role}</td>
                <td className="p-4 text-charcoal/85">{item.company}</td>
                <td className="p-4 font-mono text-charcoal/70">{item.employmentType}</td>
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
                    onClick={() => handleOpenEditor(item)}
                    className="p-1.5 rounded hover:bg-cream-100 text-charcoal/85 hover:text-burgundy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.role)}
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
