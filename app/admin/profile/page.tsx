'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
  Trash2,
  RefreshCw,
  Camera,
  User,
  ExternalLink,
} from 'lucide-react';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = () => {
    fetch('/api/admin/profile')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve profile data from server.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Photo File Selection -> Shows immediate preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file triggers change
    e.target.value = '';

    // Client-side validation: file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStatusMsg({
        type: 'error',
        text: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB). Please choose a smaller photo.`,
      });
      return;
    }

    // Client-side validation: file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatusMsg({
        type: 'error',
        text: `Unsupported image format: "${file.type}". Allowed formats are JPG, JPEG, PNG, and WebP.`,
      });
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setStatusMsg({
      type: 'success',
      text: `Photo selected: "${file.name}". Click "Save Photo" below to publish it to your profile.`,
    });
  };

  // Handle Discarding Selected Photo
  const handleCancelPhotoSelect = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatusMsg(null);
  };

  // Handle Photo Save (Upload to server and persist to profile)
  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    setUploadingPhoto(true);
    setUploadProgress(25);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadProgress(60);
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      setUploadProgress(100);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);

      setProfile((prev: any) => ({
        ...prev,
        avatarUrl: data.avatarUrl,
      }));

      setStatusMsg({
        type: 'success',
        text: 'Profile photo successfully uploaded, validated, and saved.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  // Handle Photo Removal
  const handlePhotoRemove = async () => {
    if (!profile?.avatarUrl && !selectedFile) return;

    if (selectedFile) {
      handleCancelPhotoSelect();
      return;
    }

    if (!confirm('Are you sure you want to remove the current profile photo? The website will revert to the default stylized avatar.')) {
      return;
    }

    setUploadingPhoto(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove photo.');
      }

      setProfile((prev: any) => ({
        ...prev,
        avatarUrl: null,
      }));

      setStatusMsg({
        type: 'success',
        text: 'Profile photo removed. The website will display the default stylized badge.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo removal failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Profile Text Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      // If there is an unsaved photo selected, save it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const avatarRes = await fetch('/api/admin/profile/avatar', {
          method: 'POST',
          body: formData,
        });
        const avatarData = await avatarRes.json();
        if (avatarRes.ok && avatarData.avatarUrl) {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setSelectedFile(null);
          setPreviewUrl(null);
          profile.avatarUrl = avatarData.avatarUrl;
        }
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const firstErr = Object.values(data.details)[0];
          throw new Error(Array.isArray(firstErr) ? firstErr[0] : data.error || 'Validation error.');
        }
        throw new Error(data.error || 'Failed to update profile.');
      }

      setStatusMsg({ type: 'success', text: 'All profile details successfully updated and saved.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-silver-300" />
        <p className="text-xs font-mono text-zinc-400">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Public Profile & Bio</h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            MANAGE ATHRAV PATHAK PUBLIC IDENTITY, PORTRAIT PHOTO & SOCIAL METADATA
          </p>
        </div>

        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-white transition-colors self-start sm:self-auto"
        >
          <span>View Public About Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 transition-all ${
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

      {/* ==================================================================== */}
      {/* 1. PROFILE PHOTO MANAGEMENT CARD                                     */}
      {/* ==================================================================== */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-silver-300" />
            <span>Profile Photo & Portrait</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Upload your authentic portrait photo. Displayed prominently on the About page and across the portfolio.
            Supports JPG, JPEG, PNG, and WebP (max 5MB).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Avatar Preview Box */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black overflow-hidden flex items-center justify-center shadow-xl shadow-black/80 relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected Photo Preview"
                  className="w-full h-full object-cover object-center ring-2 ring-emerald-500/50"
                />
              ) : profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile?.name || 'Athrav Pathak'}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-500">
                  <User className="w-12 h-12 text-zinc-600 mb-1" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">No Photo</span>
                </div>
              )}

              {/* Uploading Overlay */}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-silver-300" />
                  <span className="text-[11px] font-mono">
                    {uploadProgress ? `${uploadProgress}%` : 'Processing...'}
                  </span>
                </div>
              )}
            </div>

            {/* Status indicator badge */}
            <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono border backdrop-blur-md ${
              selectedFile
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : profile?.avatarUrl
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-900/90 text-zinc-400 border-white/20'
            }`}>
              {selectedFile ? 'Unsaved Photo' : profile?.avatarUrl ? 'Photo Active' : 'Default Avatar'}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handlePhotoSelect}
                disabled={uploadingPhoto || saving}
              />

              {/* Save Photo button (Visible when a file is selected) */}
              {selectedFile ? (
                <>
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    disabled={uploadingPhoto || saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Photo Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelPhotoSelect}
                    disabled={uploadingPhoto || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-medium text-xs transition-colors disabled:opacity-50"
                  >
                    <span>Cancel Selection</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto || saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-md shadow-white/10 disabled:opacity-50"
                  >
                    {profile?.avatarUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Photo</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo from Computer</span>
                      </>
                    )}
                  </button>

                  {profile?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handlePhotoRemove}
                      disabled={uploadingPhoto || saving}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-white/10">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="text-[11px] text-zinc-400 font-mono space-y-1">
              <p>• Accepted extensions: .jpg, .jpeg, .png, .webp</p>
              <p>• Maximum file size: 5.00 MB (binary magic-bytes verified on server)</p>
              {profile?.avatarUrl && (
                <p className="text-zinc-400 truncate">
                  • Active saved path: <span className="text-silver-300 font-mono">{profile.avatarUrl}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. PROFILE DETAILS FORM                                              */}
      {/* ==================================================================== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">Primary Contact Email *</label>
              <input
                type="email"
                required
                value={profile?.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Professional Positioning Headline *
            </label>
            <input
              type="text"
              required
              value={profile?.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Detailed Biography *
            </label>
            <textarea
              rows={4}
              required
              value={profile?.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">Location</label>
              <input
                type="text"
                value={profile?.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="India"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">Availability Status Tag</label>
              <input
                type="text"
                value={profile?.status || ''}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                placeholder="Available for AI Internships"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">Active Avatar Image URL / Path</label>
            <input
              type="text"
              value={profile?.avatarUrl || ''}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value || null })}
              placeholder="/uploads/profile-... or https://..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
            />
          </div>
        </div>

        {/* Social & External Profiles */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-semibold text-white">Social Links & External Presence</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">GitHub Profile URL</label>
              <input
                type="url"
                value={profile?.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://github.com/Athravpathak-git"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">LinkedIn Profile URL</label>
              <input
                type="url"
                value={profile?.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>
          </div>
        </div>

        {/* Resume Controls */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-semibold text-white">Résumé / Curriculum Vitae Controls</h3>
          <p className="text-xs text-zinc-400">
            Per project specifications, the résumé is unpublished and hidden on public pages by default.
            You can specify a document URL or path and toggle visibility here when ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">Résumé Document URL / Path</label>
              <input
                type="text"
                value={profile?.resumeUrl || ''}
                onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                placeholder="/uploads/... or https://..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-silver-400"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="resume_published_check"
                checked={profile?.resumePublished || false}
                onChange={(e) => setProfile({ ...profile, resumePublished: e.target.checked })}
                className="w-4 h-4 rounded bg-zinc-900 border-white/20 text-silver-400 focus:ring-silver-400"
              />
              <label htmlFor="resume_published_check" className="text-xs font-mono text-zinc-200 cursor-pointer">
                Publish on Website
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingPhoto}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors shadow-lg shadow-white/10 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Profile Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
