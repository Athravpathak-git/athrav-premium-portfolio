'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog.jsx';
import ImageUploader from '@/components/admin/ImageUploader.jsx';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    summary: '',
    description: '',
    category: 'Full Stack',
    featured: false,
    techStack: '',
    liveUrl: '',
    repoUrl: '',
    imageUrl: '',
    sortOrder: 0,
    isPublished: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (err) {
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateNew = () => {
    setCurrentProject(null);
    setFormData({
      title: '',
      slug: '',
      subtitle: '',
      summary: '',
      description: '',
      category: 'Full Stack',
      featured: false,
      techStack: '',
      liveUrl: '',
      repoUrl: '',
      imageUrl: '',
      sortOrder: 0,
      isPublished: false,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (project) => {
    setCurrentProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      subtitle: project.subtitle || '',
      summary: project.summary,
      description: project.description,
      category: project.category,
      featured: project.featured,
      techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
      liveUrl: project.liveUrl || '',
      repoUrl: project.repoUrl || '',
      imageUrl: project.imageUrl || '',
      sortOrder: project.sortOrder,
      isPublished: project.isPublished,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      // Auto-generate slug if creating new
      const next = { ...prev, title: val };
      if (!currentProject && !prev.slugManuallyEdited) {
        next.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return next;
    });
  };

  const handleTogglePublish = async (project) => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          ...project,
          isPublished: !project.isPublished,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to toggle publication status.');
      }

      setMessage(`Project "${project.title}" ${project.isPublished ? 'unpublished' : 'published'}.`);
      fetchProjects();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const techArray = formData.techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      techStack: techArray,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    if (currentProject) {
      payload.id = currentProject.id;
    }

    try {
      const res = await fetch('/api/admin/projects', {
        method: currentProject ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save project.');
      }

      setMessage(`Project "${formData.title}" saved successfully.`);
      setIsEditing(false);
      fetchProjects();
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
      const res = await fetch(`/api/admin/projects?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete project.');
      }

      setMessage(`Project "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchProjects();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-sky-400" />
            <span>Projects Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create, curate, publish, and reorder engineering projects and case studies.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
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

      {/* Editing Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-sm font-medium text-white">
              {currentProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Project Title <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Distributed Database Engine"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                URL Slug <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase(),
                    slugManuallyEdited: true,
                  }))
                }
                placeholder="distributed-database-engine"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Full Stack / Systems / Security"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Sort Priority</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-6 pt-5">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-0"
                />
                <span>Featured on Home</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
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
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Subtitle / Tagline</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="e.g. High-throughput fault-tolerant consensus implementation"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Brief Summary <span className="text-sky-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.summary}
              onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Card summary shown on project listings..."
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Detailed Architecture & Description <span className="text-sky-400">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Deep dive into system requirements, tradeoffs, database structure, and performance metrics..."
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Technologies (comma separated)
            </label>
            <input
              type="text"
              value={formData.techStack}
              onChange={(e) => setFormData((prev) => ({ ...prev, techStack: e.target.value }))}
              placeholder="Next.js, PostgreSQL, Prisma, Docker, Three.js"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Live Demo URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">GitHub Repository URL</label>
              <input
                type="url"
                value={formData.repoUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, repoUrl: e.target.value }))}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <ImageUploader
            label="Project Feature Image"
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          />

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
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Project</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Projects Table / List */
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400">
                    <th className="pb-3 font-medium">Title & Category</th>
                    <th className="pb-3 font-medium">Slug</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-white/[0.02] group">
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-white">{project.title}</div>
                        <div className="text-[11px] text-slate-400">{project.category}</div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-slate-400">/{project.slug}</td>
                      <td className="py-3.5 pr-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(project)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                            project.isPublished
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {project.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-400">{project.sortOrder}</td>
                      <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewProject(project)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(project)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                          title="Delete"
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
              <FolderGit2 className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No projects created yet.</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-full text-xs font-medium glass-button"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Destructive Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Project"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={deleting}
      />

      {/* Preview Modal */}
      {previewProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0c0d14] border border-white/10 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {previewProject.category}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    previewProject.isPublished ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {previewProject.isPublished ? '● Published' : '● Draft'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProject(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-white">{previewProject.title}</h2>
              {previewProject.subtitle && (
                <p className="text-xs text-slate-400">{previewProject.subtitle}</p>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{previewProject.summary}</p>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Architecture</p>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {previewProject.description}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewProject(null)}
                className="px-4 py-2 rounded-xl text-xs glass-button"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
