'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  Image as ImageIcon,
  Calendar,
  Hash,
} from 'lucide-react';

export default function AdminCertificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Certificate image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setUploadError(null);
    if (item) {
      setEditingItem({ ...item });
      setImagePreview(item.imageUrl || null);
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
        imageUrl: '',
        description: '',
        relatedSkills: ['Python', 'Machine Learning'],
        isFeatured: false,
        sortOrder: items.length + 1,
        isPublished: false, // Default draft
      });
      setImagePreview(null);
      setSkillsInput('Python, Machine Learning');
      setIsCreating(true);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side validation: format check (JPG, JPEG, PNG, WebP)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setUploadError('Invalid file format. Only JPG, JPEG, PNG, and WebP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Client-side validation: size check (10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(
        `File size exceeds 10MB limit (selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB).`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Show immediate local preview
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Upload to dedicated server endpoint
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (editingItem?.title) {
        formData.append('title', editingItem.title);
      }

      const res = await fetch('/api/admin/certifications/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload certificate image.');
      }

      // Update editing item with saved relative URL
      setEditingItem((prev: any) => ({
        ...prev,
        imageUrl: data.url,
      }));
      setImagePreview(data.url);
      setStatusMsg({
        type: 'success',
        text: 'Certificate image uploaded successfully. Click Save Credential to commit.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setUploadError(msg);
      // Revert preview to previous image if upload failed
      setImagePreview(editingItem?.imageUrl || null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setEditingItem((prev: any) => ({
      ...prev,
      imageUrl: null,
    }));
    setImagePreview(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      setImagePreview(null);
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
      <div className="flex items-center justify-between pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">Certifications Management</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            MANAGE COURSEWORK CREDENTIALS, CERTIFICATE IMAGES & ISSUER METADATA
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenEditor()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Credential Record</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800'
              : 'border-red-500/30 bg-red-500/10 text-red-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor Modal / Inline Form */}
      {(isCreating || editingItem) && (
        <div className="p-6 sm:p-8 rounded-2xl border border-border-soft bg-white space-y-6 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-border-soft">
            <h3 className="text-lg font-serif font-bold text-burgundy flex items-center gap-2">
              <Award className="w-5 h-5 text-rosegold" />
              <span>{editingItem?.id ? `Edit: ${editingItem.title}` : 'Create Certification Record'}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsCreating(false);
                setImagePreview(null);
              }}
              className="p-1.5 rounded-lg text-charcoal/70 hover:text-burgundy hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
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
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.slug || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                  placeholder="e.g. coursera-ml-specialization"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal font-mono focus:outline-hidden focus:border-burgundy"
                />
              </div>
            </div>

            {/* 2. Issuer & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.issuer || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                  placeholder="e.g. Coursera / DeepLearning.AI"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">Category</label>
                <select
                  value={editingItem.category || 'Machine Learning'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-hidden focus:border-burgundy"
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
              </div>
            </div>

            {/* 3. Issue Date & Credential ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                  Issue Date (Optional)
                </label>
                <input
                  type="text"
                  value={editingItem.issueDate || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, issueDate: e.target.value })}
                  placeholder="e.g. 2024-05 or May 2024"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal font-mono focus:outline-hidden focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                  Credential ID (Optional)
                </label>
                <input
                  type="text"
                  value={editingItem.credentialId || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, credentialId: e.target.value })}
                  placeholder="e.g. COURSERA-ML-2024-ABC"
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal font-mono focus:outline-hidden focus:border-burgundy"
                />
              </div>
            </div>

            {/* 4. Online Verification URL */}
            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                Online Verification URL (Optional)
              </label>
              <input
                type="url"
                value={editingItem.credentialUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, credentialUrl: e.target.value })}
                placeholder="https://coursera.org/verify/..."
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal font-mono focus:outline-hidden focus:border-burgundy"
              />
            </div>

            {/* 5. CERTIFICATE IMAGE UPLOAD COMPONENT */}
            <div className="space-y-3 p-5 rounded-xl border border-border-soft bg-cream-50/60">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-mono font-bold text-burgundy uppercase tracking-wider">
                    Certificate Image Document
                  </label>
                  <p className="text-[11px] font-mono text-charcoal/70 mt-0.5">
                    Upload official certificate badge or completion certificate (JPG, PNG, WebP up to 10MB)
                  </p>
                </div>
                {imagePreview && (
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Attached</span>
                  </span>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative max-w-lg h-52 rounded-xl overflow-hidden border border-border-soft bg-white shadow-sm flex items-center justify-center p-2 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Certificate Preview"
                      className="max-h-full max-w-full object-contain rounded"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center gap-2 text-burgundy font-mono text-xs font-semibold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-soft hover:border-burgundy text-charcoal hover:text-burgundy bg-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      <span>Replace Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 hover:border-red-400 text-red-600 hover:bg-red-50 bg-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>

                    {editingItem.imageUrl && (
                      <span className="text-[11px] font-mono text-charcoal/60 truncate max-w-sm">
                        Path: {editingItem.imageUrl}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    className="p-8 rounded-xl border-2 border-dashed border-border-soft hover:border-burgundy/60 bg-white text-center cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy mx-auto mb-2">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-charcoal">
                      {uploadingImage ? 'Uploading image...' : 'Click to select certificate image'}
                    </p>
                    <p className="text-xs font-mono text-charcoal/60 mt-1">
                      Supports JPG, JPEG, PNG, or WEBP (Max 10MB)
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      <span>Upload Certificate Image</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* 6. Description */}
            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                Description / Syllabus Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Comprehensive coverage of supervised and unsupervised learning algorithms..."
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal resize-y focus:outline-hidden focus:border-burgundy"
              />
            </div>

            {/* 7. Related Skills */}
            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1 font-semibold">
                Related Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Python, Scikit-Learn, Linear Regression"
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-hidden focus:border-burgundy"
              />
            </div>

            {/* 8. Checkboxes: Featured & Published */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.isFeatured || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-cream-50 text-burgundy"
                />
                <span>Featured Credential (Homepage priority)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-charcoal/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished || false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 rounded bg-cream-50 text-burgundy"
                />
                <span>Published (Visible on Public Website)</span>
              </label>
            </div>

            {/* 9. Submit & Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border-soft">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Credential</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                  setImagePreview(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-border-soft text-charcoal hover:bg-cream-100 text-xs font-semibold transition-colors"
              >
                Cancel
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
              <th className="p-4 w-16">Preview</th>
              <th className="p-4">Certificate</th>
              <th className="p-4">Issuer</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Category</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                <td className="p-4">
                  {item.imageUrl ? (
                    <div className="w-12 h-9 rounded-lg border border-border-soft overflow-hidden bg-cream-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-9 rounded-lg border border-border-soft/60 bg-cream-50 flex items-center justify-center text-charcoal/40 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="font-semibold text-burgundy">{item.title}</div>
                  <div className="text-[11px] font-mono text-charcoal/50">{item.slug}</div>
                </td>
                <td className="p-4 text-charcoal/85">{item.issuer}</td>
                <td className="p-4 font-mono text-charcoal/70">{item.issueDate || '—'}</td>
                <td className="p-4 font-mono text-charcoal/80">{item.category}</td>
                <td className="p-4">
                  {item.credentialUrl ? (
                    <span className="text-emerald-700 font-mono flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> URL Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-mono">Draft Record</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                      item.isPublished
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold'
                        : 'bg-cream-100 text-charcoal/70 border border-border-soft'
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
                      className="p-1.5 rounded-lg hover:bg-cream-100 text-charcoal/85 hover:text-burgundy inline-block"
                      title="Preview Public Page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEditor(item)}
                    className="p-1.5 rounded-lg hover:bg-cream-100 text-charcoal/85 hover:text-burgundy"
                    title="Edit Credential"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg hover:bg-cream-100 text-charcoal/70 hover:text-red-600"
                    title="Delete Credential"
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
