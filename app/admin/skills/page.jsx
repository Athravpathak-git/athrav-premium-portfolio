'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog.jsx';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Languages & Core Runtimes',
    proficiency: 'Advanced',
    sortOrder: 0,
    isPublished: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/admin/skills');
      const data = await res.json();
      if (data.skills) setSkills(data.skills);
    } catch (err) {
      setError('Failed to fetch skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleCreateNew = () => {
    setCurrentSkill(null);
    setFormData({
      name: '',
      category: 'Languages & Core Runtimes',
      proficiency: 'Advanced',
      sortOrder: 0,
      isPublished: true,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (skill) => {
    setCurrentSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency || 'Advanced',
      sortOrder: skill.sortOrder,
      isPublished: skill.isPublished,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...formData,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    if (currentSkill) payload.id = currentSkill.id;

    try {
      const res = await fetch('/api/admin/skills', {
        method: currentSkill ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save skill.');
      }

      setMessage(`Skill "${formData.name}" saved.`);
      setIsEditing(false);
      fetchSkills();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/skills?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete skill.');
      }

      setMessage(`Skill "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchSkills();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-sky-400" />
            <span>Skills Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Organize competencies by technology category and domain.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-sm font-medium text-white">
              {currentSkill ? 'Edit Skill' : 'New Skill'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Skill Name <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. PostgreSQL Architecture"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Category <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Databases & Storage"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Proficiency / Note</label>
              <input
                type="text"
                value={formData.proficiency}
                onChange={(e) => setFormData((prev) => ({ ...prev, proficiency: e.target.value }))}
                placeholder="Advanced / Proficient"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="w-24 px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
              />
              <span className={formData.isPublished ? 'text-emerald-400 font-medium' : ''}>
                Published
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium glass-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Skill</span>}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : skills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400">
                    <th className="pb-3 font-medium">Skill Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Proficiency</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {skills.map((skill) => (
                    <tr key={skill.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 pr-4 font-medium text-white">{skill.name}</td>
                      <td className="py-3.5 pr-4 text-slate-400">{skill.category}</td>
                      <td className="py-3.5 pr-4 text-slate-400">{skill.proficiency || '-'}</td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(skill)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(skill)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Wrench className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No custom skills in database yet.</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-full text-xs font-medium glass-button"
              >
                Add First Skill
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Skill"
        message={`Delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={deleting}
      />
    </div>
  );
}
