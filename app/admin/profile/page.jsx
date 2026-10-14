'use client';

import React, { useState, useEffect } from 'react';
import { User, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader.jsx';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Athrav Pathak',
    headline: '',
    bio: '',
    email: '',
    location: '',
    status: '',
    avatarUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
          <User className="w-5 h-5 text-sky-400" />
          <span>Profile Configuration</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage your verified name, headline, bio, contact email, and professional social URLs.
        </p>
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

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Full Legal Name <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={profile.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Direct Contact Email <span className="text-sky-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={profile.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Professional Headline <span className="text-sky-400">*</span>
          </label>
          <input
            type="text"
            name="headline"
            required
            value={profile.headline || ''}
            onChange={handleChange}
            placeholder="e.g. Full-Stack Software Engineer & PostgreSQL Architect"
            className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Location</label>
            <input
              type="text"
              name="location"
              value={profile.location || ''}
              onChange={handleChange}
              placeholder="e.g. India"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Status Indicator</label>
            <input
              type="text"
              name="status"
              value={profile.status || ''}
              onChange={handleChange}
              placeholder="e.g. Available for engineering opportunities"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Bio / Engineering Philosophy <span className="text-sky-400">*</span>
          </label>
          <textarea
            name="bio"
            rows={4}
            required
            value={profile.bio || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Avatar Upload */}
        <ImageUploader
          label="Profile Avatar (Optional)"
          value={profile.avatarUrl || ''}
          onChange={(url) => setProfile((prev) => ({ ...prev, avatarUrl: url }))}
        />

        {/* Social / External Links */}
        <div className="pt-4 border-t border-white/[0.08] space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            External Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={profile.githubUrl || ''}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">LinkedIn URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={profile.linkedinUrl || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Twitter / X URL</label>
              <input
                type="url"
                name="twitterUrl"
                value={profile.twitterUrl || ''}
                onChange={handleChange}
                placeholder="https://x.com/username"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Portfolio / Personal Website URL</label>
              <input
                type="url"
                name="websiteUrl"
                value={profile.websiteUrl || ''}
                onChange={handleChange}
                placeholder="https://athravpathak.com"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.08]">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
