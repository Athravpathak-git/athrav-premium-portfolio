'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog.jsx';
import ImageUploader from '@/components/admin/ImageUploader.jsx';

const PREDEFINED_ISSUERS = [
  'Coursera',
  'IBM',
  'Infosys',
  'Forage',
  'Tata',
  'Google',
  'Microsoft',
  'AWS',
  'Cisco',
  'Oracle',
  'Meta',
  'Other',
];

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCert, setCurrentCert] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    customIssuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    imageUrl: '',
    sortOrder: 0,
    isPublished: true,
  });

  const [issuerSearch, setIssuerSearch] = useState('');
  const [issuerDropdownOpen, setIssuerDropdownOpen] = useState(false);
  const issuerDropdownRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Close issuer dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (issuerDropdownRef.current && !issuerDropdownRef.current.contains(event.target)) {
        setIssuerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [allIssuers, setAllIssuers] = useState(PREDEFINED_ISSUERS);

  const fetchCerts = async () => {
    try {
      const [res, sugRes] = await Promise.all([
        fetch('/api/admin/certifications'),
        fetch('/api/admin/suggestions'),
      ]);
      const data = await res.json();
      if (data.certifications) setCertifications(data.certifications);
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        if (sugData.issuers) {
          const merged = Array.from(new Set([...sugData.issuers, ...PREDEFINED_ISSUERS]));
          setAllIssuers(merged);
        }
      }
    } catch (err) {
      setError('Failed to fetch certifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const filteredIssuers = useMemo(() => {
    if (!issuerSearch) return allIssuers;
    return allIssuers.filter((iss) =>
      iss.toLowerCase().includes(issuerSearch.toLowerCase())
    );
  }, [issuerSearch, allIssuers]);

  const handleCreateNew = () => {
    setCurrentCert(null);
    setFormData({
      title: '',
      issuer: 'AWS',
      customIssuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      imageUrl: '',
      sortOrder: 0,
      isPublished: true,
    });
    setIssuerSearch('');
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (cert) => {
    setCurrentCert(cert);
    const isKnown = allIssuers.includes(cert.issuer) && cert.issuer !== 'Other';

    setFormData({
      title: cert.title,
      issuer: isKnown ? cert.issuer : 'Other',
      customIssuer: isKnown ? '' : cert.issuer,
      issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : '',
      expiryDate: cert.expiryDate ? cert.expiryDate.slice(0, 10) : '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      imageUrl: cert.imageUrl || '',
      sortOrder: cert.sortOrder,
      isPublished: cert.isPublished,
    });
    setIssuerSearch(isKnown ? cert.issuer : 'Other');
    setIsEditing(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const finalIssuer =
      formData.issuer === 'Other'
        ? formData.customIssuer.trim()
        : formData.issuer;

    if (!finalIssuer) {
      setError('Please provide an issuing organization or authority.');
      setSaving(false);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      issuer: finalIssuer,
      credentialId: formData.credentialId.trim() || null,
      credentialUrl: formData.credentialUrl.trim() || null,
      imageUrl: formData.imageUrl || null,
      sortOrder: Number(formData.sortOrder) || 0,
      issueDate: formData.issueDate ? `${formData.issueDate}T00:00:00Z` : null,
      expiryDate: formData.expiryDate ? `${formData.expiryDate}T00:00:00Z` : null,
      isPublished: Boolean(formData.isPublished),
    };

    if (currentCert) payload.id = currentCert.id;

    try {
      const res = await fetch('/api/admin/certifications', {
        method: currentCert ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save certification.');
      }

      setMessage(`Certification "${formData.title}" saved successfully.`);
      setIsEditing(false);
      fetchCerts();
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
      const res = await fetch(`/api/admin/certifications?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete certification.');
      }

      setMessage(`Certification "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchCerts();
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
            <Award className="w-5 h-5 text-sky-400" />
            <span>Certifications Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Maintain verified professional credentials, issuers, and verification links.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certification</span>
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-sm font-medium text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-sky-400" />
              <span>{currentCert ? 'Edit Certification' : 'New Certification'}</span>
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
                Certification Title <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. AWS Certified Solutions Architect – Associate"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            {/* Issuer Combobox */}
            <div className="space-y-1.5 relative" ref={issuerDropdownRef}>
              <label className="text-xs font-medium text-slate-300 block">
                Issuing Organization <span className="text-sky-400">*</span>
              </label>
              <div
                onClick={() => setIssuerDropdownOpen((prev) => !prev)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white flex items-center justify-between cursor-pointer hover:border-white/20"
              >
                <span>{formData.issuer || 'Select Issuer'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {issuerDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#0f111a] border border-white/15 shadow-2xl p-2 space-y-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={issuerSearch}
                      onChange={(e) => setIssuerSearch(e.target.value)}
                      placeholder="Search issuer..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1">
                    {filteredIssuers.map((iss) => (
                      <button
                        key={iss}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, issuer: iss }));
                          setIssuerDropdownOpen(false);
                          setIssuerSearch('');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          formData.issuer === iss
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {iss}
                      </button>
                    ))}
                    {filteredIssuers.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            issuer: 'Other',
                            customIssuer: issuerSearch,
                          }));
                          setIssuerDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10"
                      >
                        Use custom issuer: &quot;{issuerSearch}&quot;
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Issuer if Other */}
          {formData.issuer === 'Other' && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Custom Issuing Authority <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customIssuer}
                onChange={(e) => setFormData((prev) => ({ ...prev, customIssuer: e.target.value }))}
                placeholder="Enter organization / certification body..."
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, issueDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Expiry Date <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Credential ID <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) => setFormData((prev) => ({ ...prev, credentialId: e.target.value }))}
                placeholder="e.g. AWS-PSA-129482"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Verification URL <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={formData.credentialUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, credentialUrl: e.target.value }))}
              placeholder="https://www.credly.com/badges/..."
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          {/* Certificate Image Upload */}
          <ImageUploader
            label="Certificate Badge / Document Image (Optional)"
            value={formData.imageUrl || ''}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            helperText="Upload official digital badge or certificate preview (JPEG, PNG, WebP)"
          />

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
                Publish on public website
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
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Certificate</span>}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : certifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400">
                    <th className="pb-3 font-medium">Credential</th>
                    <th className="pb-3 font-medium">Issuer</th>
                    <th className="pb-3 font-medium">Issue Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center space-x-3">
                          {cert.imageUrl ? (
                            <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={cert.imageUrl}
                                alt={cert.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                              <Award className="w-5 h-5 text-sky-400/70" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{cert.title}</p>
                            {cert.credentialId && (
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                ID: {cert.credentialId}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300 font-medium">{cert.issuer}</td>
                      <td className="py-3.5 pr-4 text-slate-400">
                        {cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            cert.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          {cert.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(cert)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                          title="Edit Certification"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cert)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                          title="Delete Certification"
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
              <Award className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No certifications recorded yet.</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-full text-xs font-medium glass-button"
              >
                Add Certification
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Certification"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={deleting}
      />
    </div>
  );
}
