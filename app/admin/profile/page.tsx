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
      text: `Photo selected: "${file.name}". Click "Save Photo Now" below to publish it to your profile.`,
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

  // Handle Saving the Photo via Dedicated Avatar API
  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    setUploadingPhoto(true);
    setStatusMsg(null);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(50);
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      setUploadProgress(100);

      // Clean up object URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);

      // Update local profile state with new avatarUrl
      setProfile((prev: any) => ({
        ...prev,
        avatarUrl: data.avatarUrl,
      }));

      setStatusMsg({
        type: 'success',
        text: 'Profile photo successfully uploaded and published across the website!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(null);
    }
  };

  // Handle Removing the Photo
  const handlePhotoRemove = async () => {
    if (!confirm('Are you sure you want to remove your profile photo? The website will revert to the default stylized badge.')) {
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
        <Loader2 className="w-8 h-8 animate-spin text-forest dark:text-champagne-300" />
        <p className="text-xs font-mono text-forest-600 dark:text-sage">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-300/70 dark:border-forest-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-ivory">Public Profile & Bio</h1>
          <p className="text-xs font-mono text-forest-600 dark:text-sage font-medium mt-1">
            MANAGE ATHRAV PATHAK PUBLIC IDENTITY, PORTRAIT PHOTO & SOCIAL METADATA
          </p>
        </div>

        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory dark:bg-forest-900 hover:bg-cream-200 border border-cream-300 dark:border-forest-700 text-xs font-mono font-semibold text-forest dark:text-ivory transition-colors self-start sm:self-auto shadow-sm"
        >
          <span>View Public About Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 transition-all shadow-sm ${
            statusMsg.type === 'success'
              ? 'border-forest-500 bg-sage-50 dark:bg-forest-900 text-forest dark:text-ivory'
              : 'border-red-300 bg-red-50 text-red-900'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-forest dark:text-sage-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. PROFILE PHOTO MANAGEMENT CARD                                     */}
      {/* ==================================================================== */}
      <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-forest dark:text-ivory flex items-center gap-2">
            <Camera className="w-4 h-4 text-champagne-600" />
            <span>Profile Photo & Portrait</span>
          </h3>
          <p className="text-xs text-forest-700/80 dark:text-sage-100 mt-1">
            Upload your authentic portrait photo. Displayed prominently on the About page and across the portfolio.
            Supports JPG, JPEG, PNG, and WebP (max 5MB).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Avatar Preview Box */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-2 border-cream-300 dark:border-forest-700 bg-cream-100 dark:bg-forest-800 overflow-hidden flex items-center justify-center shadow-md relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected Photo Preview"
                  className="w-full h-full object-cover object-center ring-2 ring-champagne-500"
                />
              ) : profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile?.name || 'Athrav Pathak'}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-forest-400">
                  <User className="w-12 h-12 text-forest-400 mb-1" />
                  <span className="text-[10px] font-mono text-forest-500 uppercase">No Photo</span>
                </div>
              )}

              {/* Uploading Overlay */}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-ivory space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-champagne-300" />
                  <span className="text-[11px] font-mono">
                    {uploadProgress ? `${uploadProgress}%` : 'Processing...'}
                  </span>
                </div>
              )}
            </div>

            {/* Status indicator badge */}
            <div className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono border backdrop-blur-md shadow-sm ${
              selectedFile
                ? 'bg-champagne-100 text-champagne-900 border-champagne-300 font-bold'
                : profile?.avatarUrl
                ? 'bg-sage-100 text-forest border-sage-300 font-bold'
                : 'bg-cream-200 text-forest-600 border-cream-300'
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-600 text-ivory font-bold text-xs transition-colors shadow-md disabled:opacity-50"
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
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest border border-cream-300 font-semibold text-xs transition-colors disabled:opacity-50"
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-600 text-ivory font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
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
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream-100 hover:bg-red-50 text-forest hover:text-red-700 border border-cream-300 hover:border-red-300 font-semibold text-xs transition-colors disabled:opacity-50"
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
              <div className="w-full bg-cream-200 rounded-full h-1.5 overflow-hidden border border-cream-300">
                <div
                  className="bg-forest h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <div className="text-[11px] text-forest-700/80 dark:text-sage-100 font-mono space-y-1">
              <p>• Accepted extensions: .jpg, .jpeg, .png, .webp</p>
              <p>• Maximum file size: 5.00 MB (binary magic-bytes verified on server)</p>
              {profile?.avatarUrl && (
                <p className="text-forest-600 dark:text-sage truncate">
                  • Active saved path: <span className="font-bold text-forest dark:text-champagne-300 font-mono">{profile.avatarUrl}</span>
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
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">Primary Contact Email *</label>
              <input
                type="email"
                required
                value={profile?.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">
              Professional Positioning Headline *
            </label>
            <input
              type="text"
              required
              value={profile?.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">
              Detailed Biography *
            </label>
            <textarea
              rows={4}
              required
              value={profile?.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">Location</label>
              <input
                type="text"
                value={profile?.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="India"
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">Availability Status Tag</label>
              <input
                type="text"
                value={profile?.status || ''}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                placeholder="Available for AI Internships"
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">Active Avatar Image URL / Path</label>
            <input
              type="text"
              value={profile?.avatarUrl || ''}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value || null })}
              placeholder="/uploads/profile-... or https://..."
              className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-xs font-mono text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
        </div>

        {/* Social & External Profiles */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-forest dark:text-ivory">Social Links & External Presence</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">GitHub Profile URL</label>
              <input
                type="url"
                value={profile?.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://github.com/Athravpathak-git"
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">LinkedIn Profile URL</label>
              <input
                type="url"
                value={profile?.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>
          </div>
        </div>

        {/* Resume Controls */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-forest dark:text-ivory">Résumé / Curriculum Vitae Controls</h3>
          <p className="text-xs text-forest-700/80 dark:text-sage-100">
            Per project specifications, the résumé is unpublished and hidden on public pages by default.
            You can specify a document URL or path and toggle visibility here when ready.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-medium text-forest-700 dark:text-sage mb-1.5">Résumé Document URL / Path</label>
              <input
                type="text"
                value={profile?.resumeUrl || ''}
                onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                placeholder="/uploads/... or https://..."
                className="w-full bg-cream-50 dark:bg-forest-950 border border-cream-300 dark:border-forest-700 rounded-xl px-4 py-2.5 text-sm text-forest dark:text-ivory focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="resume_published_check"
                checked={profile?.resumePublished || false}
                onChange={(e) => setProfile({ ...profile, resumePublished: e.target.checked })}
                className="w-4 h-4 rounded bg-cream-50 border-cream-300 text-forest focus:ring-champagne-500"
              />
              <label htmlFor="resume_published_check" className="text-xs font-mono font-semibold text-forest dark:text-ivory cursor-pointer">
                Publish on Website
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploadingPhoto}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-forest hover:bg-forest-600 text-ivory font-bold text-xs transition-colors shadow-md disabled:opacity-60"
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
