'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Upload,
  Link as LinkIcon,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminMediaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // URL registration state
  const [urlAsset, setUrlAsset] = useState({ name: '', url: '', category: 'project' });

  const fetchItems = () => {
    fetch('/api/admin/media')
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
        setStatusMsg({ type: 'error', text: 'Failed to retrieve media library items.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'general');

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload asset.');

      setStatusMsg({ type: 'success', text: `File "${file.name}" uploaded successfully.` });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRegisterUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlAsset.name || !urlAsset.url) return;

    setUploading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urlAsset),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register media URL.');

      setStatusMsg({ type: 'success', text: `Asset reference "${urlAsset.name}" registered.` });
      setUrlAsset({ name: '', url: '', category: 'project' });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">Media & Asset Library</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            LOCAL STORAGE ADAPTER & EXTERNAL MEDIA ASSET REPOSITORY
          </p>
        </div>
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

      {/* Two Upload Options: Direct File Upload & URL Registration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Local File Upload */}
        <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-silver-300" />
            <h3 className="text-sm font-semibold text-burgundy">Direct Local Upload</h3>
          </div>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Upload images (JPEG, PNG, WebP) or PDF documents (max 10MB). Stored safely in local uploads with unique cryptographic names.
          </p>

          <label className="block">
            <div className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-xl p-6 text-center cursor-pointer transition-colors bg-cream-100/50">
              <Upload className="w-6 h-6 text-charcoal/70 mx-auto mb-2" />
              <span className="text-xs font-semibold text-burgundy block">
                {uploading ? 'Processing File...' : 'Select File to Upload'}
              </span>
              <span className="text-[10px] font-mono text-charcoal/60 mt-1 block">
                JPEG, PNG, WebP, GIF, PDF • Max 10MB
              </span>
              <input
                type="file"
                disabled={uploading}
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                className="hidden"
              />
            </div>
          </label>
        </div>

        {/* External URL Registration */}
        <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-silver-300" />
            <h3 className="text-sm font-semibold text-burgundy">Register External Media URL</h3>
          </div>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            Link remote assets from Cloudinary, S3, or verified external hostings without uploading locally.
          </p>

          <form onSubmit={handleRegisterUrl} className="space-y-3">
            <div>
              <input
                type="text"
                required
                value={urlAsset.name}
                onChange={(e) => setUrlAsset({ ...urlAsset, name: e.target.value })}
                placeholder="Asset Label / Project Screenshot"
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <input
                type="url"
                required
                value={urlAsset.url}
                onChange={(e) => setUrlAsset({ ...urlAsset, url: e.target.value })}
                placeholder="https://example.com/asset.png"
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full px-4 py-2 rounded-xl bg-cream-100 hover:bg-zinc-700 text-xs font-mono text-white transition-colors"
            >
              Register URL Asset
            </button>
          </form>
        </div>
      </div>

      {/* Asset Library Grid */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-burgundy">Registered Assets & Documents</h3>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border-soft bg-cream-100/60 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-charcoal/70 truncate max-w-[150px]">{item.originalName}</span>
                  <span className="text-charcoal/60 uppercase">{item.storageProvider}</span>
                </div>

                <div className="h-24 rounded-lg bg-black/60 border border-border-soft flex items-center justify-center overflow-hidden relative">
                  {item.mimeType.includes('pdf') ? (
                    <FileText className="w-8 h-8 text-silver-300" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-silver-400 opacity-60" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-silver-300 hover:text-burgundy"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-charcoal/70 hover:text-burgundy"
                    title="Open asset"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-charcoal/60 text-xs font-mono">
            No media assets registered yet.
          </div>
        )}
      </div>
    </div>
  );
}
