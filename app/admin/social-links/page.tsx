'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Globe,
  Loader2,
  Linkedin,
  Github,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  X,
} from 'lucide-react';
import { SocialIcon } from '@/components/common/SocialIcon';

interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  username?: string | null;
  icon: string;
  isEnabled: boolean;
  isPublished: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
  showInContact: boolean;
  showInAbout: boolean;
  showInHero: boolean;
  sortOrder: number;
}

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Custom Link Form state
  const [newPlatform, setNewPlatform] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('Link');
  const [newPlacements, setNewPlacements] = useState({
    showInHeader: false,
    showInFooter: true,
    showInContact: true,
    showInAbout: false,
    showInHero: false,
  });

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/admin/social-links');
      if (res.status === 401) {
        window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
        return;
      }
      const data = await res.json();
      if (data && data.links) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error('Failed to load social links:', err);
      setStatusMsg({ type: 'error', text: 'Failed to retrieve social links from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleUpdateField = (id: string, field: keyof SocialLinkItem, value: any) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveItem = async (item: SocialLinkItem) => {
    setSavingId(item.id);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save social link.');

      setStatusMsg({
        type: 'success',
        text: `"${item.label}" updated successfully.`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Error updating social link.',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    // Update sortOrder
    const updatedOrder = newLinks.map((item, idx) => ({ ...item, sortOrder: idx }));
    setLinks(updatedOrder);

    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: updatedOrder.map((i) => i.id) }),
      });
      if (!res.ok) throw new Error('Failed to persist order');
      setStatusMsg({ type: 'success', text: 'Display order updated successfully.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Could not save new ordering to server.' });
      fetchLinks(); // rollback
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Please provide both a label and a destination URL.' });
      return;
    }

    const platformKey = newPlatform.trim()
      ? `custom-${newPlatform.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : `custom-${Date.now()}`;

    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformKey,
          label: newLabel.trim(),
          url: newUrl.trim(),
          icon: newIcon,
          isEnabled: true,
          isPublished: true,
          ...newPlacements,
          sortOrder: links.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create custom link');

      setStatusMsg({ type: 'success', text: `Custom link "${newLabel}" created successfully.` });
      setShowAddModal(false);
      setNewPlatform('');
      setNewLabel('');
      setNewUrl('');
      fetchLinks();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error creating custom link' });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/social-links?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete link');

      setStatusMsg({ type: 'success', text: 'Social link removed successfully.' });
      setDeleteConfirmId(null);
      fetchLinks();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error deleting link' });
    }
  };

  // Find LinkedIn special item
  const linkedInItem = links.find((l) => l.platform === 'linkedin');
  const isLinkedInConfigured = Boolean(
    linkedInItem && linkedInItem.url.trim().length > 0 && linkedInItem.isPublished && linkedInItem.isEnabled
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-charcoal/70 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        <p className="text-sm font-mono">Loading social media and contact settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-burgundy/10 text-burgundy border border-burgundy/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-burgundy">
                Social & Contact Channels
              </h1>
              <p className="text-xs font-mono text-charcoal/70 mt-1">
                MANAGE SOCIAL PROFILES, CHANNELS, PLACEMENTS, AND VISIBILITY
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-sm w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Channel</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-mono animate-fade-in border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800'
              : 'bg-red-500/10 border-red-500/30 text-red-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          )}
          <span className="flex-1">{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:text-charcoal ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Prominent LinkedIn Easy-Config Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 shadow-inner">
              <Linkedin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-serif font-bold text-burgundy tracking-tight">LinkedIn Integration</h2>
                {isLinkedInConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Live on Portfolio
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Draft / Unpublished
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal/80 mt-1 max-w-2xl leading-relaxed">
                Connect your professional network. The LinkedIn badge is{' '}
                <strong className="text-burgundy font-bold">
                  strictly hidden from the public website
                </strong>{' '}
                until you input your URL and enable publishing.
              </p>
            </div>
          </div>

          {linkedInItem && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveItem(linkedInItem)}
                disabled={savingId === linkedInItem.id}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
              >
                {savingId === linkedInItem.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save LinkedIn Settings</span>
              </button>
            </div>
          )}
        </div>

        {linkedInItem && (
          <div className="mt-6 pt-6 border-t border-border-soft grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-charcoal/80 mb-1.5">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={linkedInItem.url}
                  onChange={(e) => handleUpdateField(linkedInItem.id, 'url', e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-profile-slug"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-border-soft text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-burgundy transition-all"
                />
                {linkedInItem.url && (
                  <a
                    href={linkedInItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-2.5 text-charcoal/60 hover:text-burgundy transition-colors"
                    title="Test Open URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-[11px] font-mono text-charcoal/60 mt-1">
                Example: <code className="text-burgundy font-bold">https://www.linkedin.com/in/athrav-pathak</code>
              </p>
            </div>

            <div className="flex flex-col justify-end gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-charcoal/85">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedInItem.isEnabled}
                    onChange={(e) => handleUpdateField(linkedInItem.id, 'isEnabled', e.target.checked)}
                    className="rounded border-border-soft text-burgundy focus:ring-burgundy"
                  />
                  <span>Channel Enabled</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedInItem.isPublished}
                    onChange={(e) => handleUpdateField(linkedInItem.id, 'isPublished', e.target.checked)}
                    className="rounded border-border-soft text-burgundy focus:ring-burgundy"
                  />
                  <span>Publish to Website</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedInItem.showInHeader}
                    onChange={(e) => handleUpdateField(linkedInItem.id, 'showInHeader', e.target.checked)}
                    className="rounded border-border-soft text-burgundy focus:ring-burgundy"
                  />
                  <span>Navbar</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedInItem.showInFooter}
                    onChange={(e) => handleUpdateField(linkedInItem.id, 'showInFooter', e.target.checked)}
                    className="rounded border-border-soft text-burgundy focus:ring-burgundy"
                  />
                  <span>Footer</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedInItem.showInContact}
                    onChange={(e) => handleUpdateField(linkedInItem.id, 'showInContact', e.target.checked)}
                    className="rounded border-border-soft text-burgundy focus:ring-burgundy"
                  />
                  <span>Contact Page</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Configured Channels List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-burgundy tracking-tight">
            All Channels & Placements ({links.length})
          </h2>
          <span className="text-xs font-mono text-charcoal/70">
            Reorder items using the arrows to adjust display priority
          </span>
        </div>

        <div className="space-y-3">
          {links.map((item, index) => {
            const isCustom = item.platform.startsWith('custom-');
            const isSaving = savingId === item.id;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-border-soft bg-white p-4 sm:p-5 hover:border-burgundy/30 transition-all shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Icon, Platform & Reordering */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded text-charcoal/60 hover:text-burgundy disabled:opacity-20 hover:bg-cream-100 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === links.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-charcoal/60 hover:text-burgundy disabled:opacity-20 hover:bg-cream-100 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-border-soft bg-cream-100 text-burgundy shadow-inner">
                      <SocialIcon platform={item.platform} iconName={item.icon} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-burgundy text-sm capitalize">
                          {item.platform.replace('custom-', '')}
                        </span>
                        {item.isEnabled && item.isPublished && item.url ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cream-200 text-charcoal/70 border border-border-soft">
                            Draft / Off
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-charcoal/60">
                        #{index + 1} • {item.icon}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Editable Label & URL */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-charcoal/70 mb-1">
                        Display Label
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateField(item.id, 'label', e.target.value)}
                        placeholder="Label"
                        className="w-full px-3 py-1.5 rounded-lg bg-cream-50 border border-border-soft text-charcoal text-sm focus:outline-none focus:ring-1 focus:ring-burgundy transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-charcoal/70 mb-1">
                        Target URL / Value
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleUpdateField(item.id, 'url', e.target.value)}
                          placeholder={
                            item.platform === 'email'
                              ? 'athravpathak07@gmail.com'
                              : item.platform === 'whatsapp'
                              ? 'https://wa.me/91...'
                              : 'https://...'
                          }
                          className="w-full px-3 py-1.5 pr-8 rounded-lg bg-cream-50 border border-border-soft text-charcoal text-sm focus:outline-none focus:ring-1 focus:ring-burgundy transition-all font-mono text-xs"
                        />
                        {item.url && (
                          <a
                            href={
                              item.platform === 'email' && !item.url.startsWith('mailto:')
                                ? `mailto:${item.url}`
                                : item.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-2.5 top-2 text-charcoal/60 hover:text-burgundy transition-colors"
                            title="Test Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Placements & Action Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-border-soft">
                    {/* Placements pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {[
                        { key: 'showInHeader', label: 'Navbar' },
                        { key: 'showInFooter', label: 'Footer' },
                        { key: 'showInContact', label: 'Contact' },
                        { key: 'showInAbout', label: 'About' },
                        { key: 'showInHero', label: 'Hero' },
                      ].map((p) => {
                        const active = Boolean((item as any)[p.key]);
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => handleUpdateField(item.id, p.key as keyof SocialLinkItem, !active)}
                            className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium transition-all ${
                              active
                                ? 'bg-burgundy/10 text-burgundy border-burgundy/30'
                                : 'bg-cream-100 text-charcoal/60 border-border-soft hover:text-charcoal'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Controls: Published Switch, Save, Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleUpdateField(item.id, 'isPublished', !item.isPublished)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                          item.isPublished
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-cream-100 text-charcoal/70 border-border-soft'
                        }`}
                        title={item.isPublished ? 'Published: click to unpublish' : 'Draft: click to publish'}
                      >
                        {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{item.isPublished ? 'Public' : 'Draft'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveItem(item)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-burgundy hover:bg-burgundy-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-charcoal/60 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete Custom Channel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div>
                <h3 className="text-lg font-serif font-bold text-burgundy">Add Custom Channel</h3>
                <p className="text-xs font-mono text-charcoal/70">
                  CREATE A LINK FOR ANY PLATFORM, PORTFOLIO, OR COMMUNITY
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-charcoal/70 hover:text-burgundy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-charcoal/80 mb-1">
                  Platform Name / Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  placeholder="e.g. Kaggle, Medium, Discord, Dribbble"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-border-soft text-charcoal text-sm focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-charcoal/80 mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Kaggle Notebooks, Read my Articles"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-border-soft text-charcoal text-sm focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-charcoal/80 mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-50 border border-border-soft text-charcoal text-sm focus:outline-none focus:ring-1 focus:ring-burgundy font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-charcoal/80 mb-1.5">
                  Choose Representative Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Globe', 'Link', 'MessageCircle', 'Mail', 'Share2'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewIcon(ic)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        newIcon === ic
                          ? 'bg-burgundy text-white border-burgundy'
                          : 'bg-cream-100 text-charcoal/70 border-border-soft hover:text-charcoal'
                      }`}
                    >
                      <SocialIcon platform="custom" iconName={ic} className="w-3.5 h-3.5" />
                      <span>{ic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-charcoal/80 mb-1.5">
                  Display Placements
                </label>
                <div className="flex flex-wrap gap-3 text-xs font-mono">
                  {[
                    { key: 'showInHeader', label: 'Navbar' },
                    { key: 'showInFooter', label: 'Footer' },
                    { key: 'showInContact', label: 'Contact Page' },
                    { key: 'showInAbout', label: 'About Page' },
                    { key: 'showInHero', label: 'Hero Section' },
                  ].map((p) => (
                    <label key={p.key} className="inline-flex items-center gap-1.5 text-charcoal/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(newPlacements as any)[p.key]}
                        onChange={(e) =>
                          setNewPlacements((prev) => ({ ...prev, [p.key]: e.target.checked }))
                        }
                        className="rounded border-border-soft text-burgundy focus:ring-burgundy"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-charcoal/70 hover:text-charcoal text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border-soft bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-burgundy mb-2">Delete Custom Link?</h3>
            <p className="text-xs text-charcoal/80 mb-6">
              Are you sure you want to remove this channel? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-charcoal/70 hover:text-charcoal text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
