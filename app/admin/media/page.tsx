'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  FolderOpen,
  ArrowUpDown,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface MediaReference {
  type: 'profile' | 'project' | 'certification';
  title: string;
  location: string;
}

interface MediaItemRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  storageProvider: string;
  altText?: string;
  description?: string;
  category: string;
  createdAt: string;
  references?: MediaReference[];
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: '',
    altText: '',
    description: '',
    category: 'general',
  });
  const [urlAsset, setUrlAsset] = useState({
    name: '',
    url: '',
    altText: '',
    description: '',
    category: 'general',
  });

  // Edit Metadata Modal State
  const [editingItem, setEditingItem] = useState<MediaItemRecord | null>(null);
  const [editForm, setEditForm] = useState({
    originalName: '',
    altText: '',
    description: '',
    category: 'general',
  });
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<MediaItemRecord | null>(null);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Image Preview Lightbox State
  const [previewLightbox, setPreviewLightbox] = useState<MediaItemRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

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
        if (data && data.items) setItems(data.items);
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve media library assets.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Upload Handlers
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!uploadMetadata.title) {
      setUploadMetadata((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''),
      }));
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadMetadata.category);
    formData.append('altText', uploadMetadata.altText || uploadMetadata.title);
    formData.append('description', uploadMetadata.description);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload asset.');

      setStatusMsg({ type: 'success', text: `Asset "${selectedFile.name}" uploaded successfully.` });
      setShowUploadModal(false);
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setUploadMetadata({ title: '', altText: '', description: '', category: 'general' });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlAsset.url || !urlAsset.name) return;

    setUploading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urlAsset),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register media asset URL.');

      setStatusMsg({ type: 'success', text: `Asset "${urlAsset.name}" registered.` });
      setShowUploadModal(false);
      setUrlAsset({ name: '', url: '', altText: '', description: '', category: 'general' });
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setUploading(false);
    }
  };

  // Edit Handlers
  const handleOpenEdit = (item: MediaItemRecord) => {
    setEditingItem(item);
    setEditForm({
      originalName: item.originalName,
      altText: item.altText || '',
      description: item.description || '',
      category: item.category || 'general',
    });
    setReplacementFile(null);
    setReplacementPreview(null);
    setStatusMsg(null);
  };

  const handleReplacementSelect = (file: File) => {
    setReplacementFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setReplacementPreview(url);
    } else {
      setReplacementPreview(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    setStatusMsg(null);

    try {
      if (replacementFile) {
        // Multipart update with replacement file
        const formData = new FormData();
        formData.append('id', editingItem.id);
        formData.append('file', replacementFile);
        formData.append('originalName', editForm.originalName);
        formData.append('altText', editForm.altText);
        formData.append('description', editForm.description);
        formData.append('category', editForm.category);

        const res = await fetch(`/api/admin/media/${editingItem.id}`, {
          method: 'PUT',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update media file.');
      } else {
        // Metadata JSON update
        const res = await fetch(`/api/admin/media/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            originalName: editForm.originalName,
            altText: editForm.altText,
            description: editForm.description,
            category: editForm.category,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update metadata.');
      }

      setStatusMsg({ type: 'success', text: `Media asset "${editForm.originalName}" updated successfully.` });
      setEditingItem(null);
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating media item.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (item: MediaItemRecord) => {
    setDeletingItem(item);
    setForceDelete(false);
    setStatusMsg(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setDeleting(true);
    setStatusMsg(null);

    try {
      const url = `/api/admin/media/${deletingItem.id}${forceDelete ? '?force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.referenced) {
          // If referenced, refresh item references and require explicit force
          setDeletingItem({
            ...deletingItem,
            references: data.references,
          });
          throw new Error('This asset is referenced in your active portfolio content. Confirm force deletion below.');
        }
        throw new Error(data.error || 'Failed to delete asset.');
      }

      setStatusMsg({ type: 'success', text: `Asset "${deletingItem.originalName}" removed from repository.` });
      setDeletingItem(null);
      fetchItems();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting asset.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setDeleting(false);
    }
  };

  // Filtering and Sorting
  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'image' && item.mimeType.startsWith('image/')) ||
        (typeFilter === 'document' && item.mimeType.includes('pdf'));

      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return a.originalName.localeCompare(b.originalName);
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
      return 0;
    });

  const categories = ['all', 'profile', 'project', 'certification', 'general'];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight text-burgundy">
            Media & Asset Library
          </h1>
          <p className="text-xs font-mono text-rosegold font-semibold tracking-wider mt-1">
            ATHRAV PATHAK PORTFOLIO CMS • CENTRALIZED DIGITAL ASSET REPOSITORY
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setUploadTab('file');
              setShowUploadModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-sm ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-50 text-emerald-900'
              : 'border-red-500/30 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-charcoal/50 hover:text-charcoal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Storage Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Total Assets</span>
          <div className="text-2xl font-serif font-bold text-burgundy">{items.length}</div>
          <p className="text-[11px] font-mono text-charcoal/70">
            {items.filter((i) => i.storageProvider === 'local').length} local •{' '}
            {items.filter((i) => i.storageProvider !== 'local').length} external
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Total Size</span>
          <div className="text-2xl font-serif font-bold text-burgundy">
            {formatFileSize(items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0))}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70">Saved in /public/uploads</p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Active References</span>
          <div className="text-2xl font-serif font-bold text-burgundy">
            {items.filter((i) => i.references && i.references.length > 0).length}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70">Used across portfolio</p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Profile Images</span>
          <div className="text-2xl font-serif font-bold text-burgundy">
            {items.filter((i) => i.category === 'profile').length}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70">Portraits & avatars</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="rounded-2xl border border-border-soft bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-rosegold absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name, label, or alt text..."
              className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 pl-10 text-xs text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-burgundy"
            />
          </div>

          {/* Type & Sort Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by file type"
              className="bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs font-mono text-charcoal focus:ring-2 focus:ring-burgundy"
            >
              <option value="all">All File Types</option>
              <option value="image">Images Only</option>
              <option value="document">PDF / Documents</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort media items"
              className="bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs font-mono text-charcoal focus:ring-2 focus:ring-burgundy"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Alphabetical</option>
              <option value="size">Sort: File Size</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-border-soft overflow-x-auto pb-1">
          <span className="text-[10px] font-mono text-charcoal/60 uppercase shrink-0">Category:</span>
          {categories.map((cat) => {
            const count =
              cat === 'all'
                ? items.length
                : items.filter((i) => i.category === cat).length;
            const isActive = categoryFilter === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors shrink-0 capitalize ${
                  isActive
                    ? 'bg-burgundy text-white font-bold shadow-sm'
                    : 'bg-cream-100 hover:bg-cream-200 text-charcoal/80'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy mx-auto" />
          <p className="text-xs font-mono text-charcoal/60">Scanning digital asset repository...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isImage = item.mimeType.startsWith('image/');
            const hasReferences = item.references && item.references.length > 0;

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-border-soft bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Media Preview Box */}
                  <div className="h-44 bg-cream-100/70 border-b border-border-soft relative overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={() => setPreviewLightbox(item)}
                        onError={(e) => {
                          // Fallback icon on error
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-charcoal/60">
                        <FileText className="w-12 h-12 text-burgundy/80" />
                        <span className="text-[10px] font-mono uppercase bg-burgundy/10 text-burgundy px-2 py-0.5 rounded">
                          PDF Document
                        </span>
                      </div>
                    )}

                    {/* Category Tag (Top Left) */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/95 text-burgundy font-bold shadow-sm border border-border-soft">
                        {item.category}
                      </span>
                    </div>

                    {/* Reference Status (Top Right) */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {hasReferences && (
                        <span
                          title={item.references?.map((r) => `${r.title} (${r.location})`).join('\n')}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rosegold-50 text-burgundy border border-rosegold/50 font-semibold shadow-sm flex items-center gap-1 cursor-help"
                        >
                          <Check className="w-3 h-3 text-rosegold" />
                          <span>In Use</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreviewLightbox(item)}
                        title="Quick View"
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-charcoal/70 hover:text-burgundy flex items-center justify-center shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Content */}
                  <div className="p-4 space-y-2">
                    <div className="space-y-0.5">
                      <h4
                        className="text-xs font-bold text-burgundy truncate"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </h4>
                      <p className="text-[10px] font-mono text-charcoal/50 truncate">
                        {item.filename}
                      </p>
                    </div>

                    {item.altText && (
                      <p className="text-[11px] text-charcoal/70 line-clamp-1 italic">
                        "{item.altText}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-mono text-charcoal/60 pt-1 border-t border-border-soft">
                      <span>{formatFileSize(item.sizeBytes)}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Active References Preview */}
                    {hasReferences && (
                      <div className="pt-1.5">
                        <div className="p-2 rounded-lg bg-cream-50 border border-border-soft text-[10px] font-mono text-charcoal/80 space-y-0.5">
                          <span className="font-bold text-burgundy block">Linked In:</span>
                          {item.references?.slice(0, 2).map((ref, idx) => (
                            <div key={idx} className="truncate">
                              • {ref.location}
                            </div>
                          ))}
                          {item.references && item.references.length > 2 && (
                            <div className="text-charcoal/50">+{item.references.length - 2} more references</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-3 bg-cream-50/70 border-t border-border-soft flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-charcoal/80 hover:text-burgundy transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-rosegold" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Metadata & File"
                      className="p-1.5 rounded-lg text-charcoal/60 hover:text-burgundy hover:bg-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Original"
                      className="p-1.5 rounded-lg text-charcoal/60 hover:text-burgundy hover:bg-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(item)}
                      title="Delete Asset"
                      className="p-1.5 rounded-lg text-charcoal/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-soft bg-white p-16 text-center space-y-4">
          <FolderOpen className="w-12 h-12 text-rosegold mx-auto opacity-60" />
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-burgundy">No Media Assets Found</h3>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              No files match your current search query or filter selection.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setTypeFilter('all');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-burgundy hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD MEDIA MODAL */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-border-soft shadow-2xl p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-burgundy">Upload Media Asset</h3>
                  <p className="text-[11px] font-mono text-charcoal/60">
                    Upload new file with metadata or link external URL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-cream-100 p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  uploadTab === 'file'
                    ? 'bg-white text-burgundy font-bold shadow-sm'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                Local File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  uploadTab === 'url'
                    ? 'bg-white text-burgundy font-bold shadow-sm'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                External URL Registration
              </button>
            </div>

            {uploadTab === 'file' ? (
              <form onSubmit={handleFileUploadSubmit} className="space-y-4 text-xs">
                {/* File Dropzone */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-soft hover:border-burgundy/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-cream-50/60 hover:bg-cream-50"
                  >
                    {filePreviewUrl ? (
                      <div className="space-y-2">
                        <img
                          src={filePreviewUrl}
                          alt="Upload preview"
                          className="h-32 mx-auto object-contain rounded-lg border border-border-soft shadow-sm"
                        />
                        <p className="text-xs font-bold text-burgundy">{selectedFile?.name}</p>
                        <p className="text-[10px] font-mono text-charcoal/60">
                          {formatFileSize(selectedFile?.size || 0)} • Click to change file
                        </p>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="w-10 h-10 text-burgundy mx-auto" />
                        <p className="text-xs font-bold text-burgundy">{selectedFile.name}</p>
                        <p className="text-[10px] font-mono text-charcoal/60">
                          {formatFileSize(selectedFile.size)} • Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-rosegold mx-auto" />
                        <div>
                          <span className="font-bold text-burgundy text-xs">
                            Click to select a file or drag and drop
                          </span>
                          <p className="text-[11px] text-charcoal/60 mt-0.5">
                            Supported: JPG, JPEG, PNG, WebP, GIF, PDF • Max 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-charcoal/80 mb-1">Asset Title / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hero Architecture Diagram"
                      value={uploadMetadata.title}
                      onChange={(e) => setUploadMetadata({ ...uploadMetadata, title: e.target.value })}
                      className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-charcoal/80 mb-1">Category *</label>
                    <select
                      value={uploadMetadata.category}
                      onChange={(e) => setUploadMetadata({ ...uploadMetadata, category: e.target.value })}
                      className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                    >
                      <option value="general">General Asset</option>
                      <option value="project">Project Image</option>
                      <option value="profile">Profile Photo / Avatar</option>
                      <option value="certification">Certification Badge / Credential</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Alt Text (Accessibility & SEO)</label>
                  <input
                    type="text"
                    placeholder="Descriptive text for screen readers"
                    value={uploadMetadata.altText}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, altText: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Description / Caption (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description or context"
                    value={uploadMetadata.description}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, description: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading & Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUrlRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Asset Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Architecture Diagram"
                    value={urlAsset.name}
                    onChange={(e) => setUrlAsset({ ...urlAsset, name: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Direct Media URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... or https://cdn..."
                    value={urlAsset.url}
                    onChange={(e) => setUrlAsset({ ...urlAsset, url: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal font-mono focus:ring-2 focus:ring-burgundy"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-charcoal/80 mb-1">Category *</label>
                    <select
                      value={urlAsset.category}
                      onChange={(e) => setUrlAsset({ ...urlAsset, category: e.target.value })}
                      className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                    >
                      <option value="general">General Asset</option>
                      <option value="project">Project Image</option>
                      <option value="profile">Profile Photo / Avatar</option>
                      <option value="certification">Certification Badge / Credential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-charcoal/80 mb-1">Alt Text</label>
                    <input
                      type="text"
                      placeholder="Descriptive alt text"
                      value={urlAsset.altText}
                      onChange={(e) => setUrlAsset({ ...urlAsset, altText: e.target.value })}
                      className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !urlAsset.url || !urlAsset.name}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>Register Asset URL</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT METADATA & REPLACE FILE MODAL */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-border-soft shadow-2xl p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-burgundy">Edit Media Asset</h3>
                  <p className="text-[11px] font-mono text-charcoal/60">Update asset metadata or replace underlying file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Asset Preview Box */}
              <div className="p-3 bg-cream-50 rounded-xl border border-border-soft flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-black/5 border border-border-soft overflow-hidden flex items-center justify-center shrink-0">
                  {replacementPreview ? (
                    <img src={replacementPreview} alt="Replacement" className="w-full h-full object-cover" />
                  ) : editingItem.mimeType.startsWith('image/') ? (
                    <img src={editingItem.url} alt={editingItem.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-8 h-8 text-burgundy" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-charcoal/50 block">Current File:</span>
                  <div className="text-xs font-bold text-burgundy truncate">{editingItem.filename}</div>
                  <div className="text-[11px] font-mono text-charcoal/70">
                    {formatFileSize(editingItem.sizeBytes)} • {editingItem.mimeType}
                  </div>
                </div>
              </div>

              {/* Replace File Action */}
              <div className="p-3.5 bg-cream-100/50 rounded-xl border border-dashed border-border-soft space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-burgundy font-mono text-xs">Replace Underlying File</span>
                  {replacementFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplacementFile(null);
                        setReplacementPreview(null);
                      }}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Clear Replacement
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-charcoal/70">
                  Upload a new file to replace this asset while maintaining portfolio references.
                </p>

                <input
                  type="file"
                  ref={replaceInputRef}
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleReplacementSelect(f);
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-border-soft bg-white hover:bg-cream-100 text-xs font-mono text-burgundy font-semibold transition-colors"
                >
                  {replacementFile ? `Selected: ${replacementFile.name}` : 'Select Replacement File...'}
                </button>
              </div>

              <div>
                <label className="block font-mono text-charcoal/80 mb-1">Asset Title / Original Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.originalName}
                  onChange={(e) => setEditForm({ ...editForm, originalName: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                  >
                    <option value="general">General Asset</option>
                    <option value="project">Project Image</option>
                    <option value="profile">Profile Photo / Avatar</option>
                    <option value="certification">Certification Badge / Credential</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Alt Text (Accessibility & SEO)</label>
                  <input
                    type="text"
                    value={editForm.altText}
                    onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-charcoal/80 mb-1">Description / Caption</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL WITH ACTIVE REFERENCE SAFEGUARD */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-red-200 shadow-2xl p-6 space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-red-950">Delete Media Asset</h3>
                <p className="text-xs text-charcoal/70">Confirm file removal from the repository</p>
              </div>
            </div>

            {/* Asset Preview Box */}
            <div className="p-3 bg-cream-50 rounded-xl border border-border-soft flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-black/5 border border-border-soft overflow-hidden flex items-center justify-center shrink-0">
                {deletingItem.mimeType.startsWith('image/') ? (
                  <img src={deletingItem.url} alt={deletingItem.originalName} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-7 h-7 text-burgundy" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-burgundy truncate">{deletingItem.originalName}</div>
                <div className="text-[10px] font-mono text-charcoal/60 truncate">{deletingItem.filename}</div>
                <div className="text-[10px] font-mono text-charcoal/60">{formatFileSize(deletingItem.sizeBytes)}</div>
              </div>
            </div>

            {/* In-Use Reference Warning Alert */}
            {deletingItem.references && deletingItem.references.length > 0 ? (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Warning: This asset is currently in active use!</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900/90">
                  Deleting this file will cause broken images or missing documents on your live portfolio in the following sections:
                </p>
                <ul className="text-xs font-mono space-y-1 list-disc list-inside text-amber-950 pl-1">
                  {deletingItem.references.map((ref, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{ref.location}</span>: {ref.title}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer text-xs font-bold text-red-900 select-none">
                    <input
                      type="checkbox"
                      checked={forceDelete}
                      onChange={(e) => setForceDelete(e.target.checked)}
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>I understand this asset is in active use and want to force deletion anyway.</span>
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Are you sure you want to delete this media file? The local file on disk and its metadata record will be permanently deleted.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || (Boolean(deletingItem.references && deletingItem.references.length > 0) && !forceDelete)}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK VIEW LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {previewLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewLightbox(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-border-soft flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border-soft flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-burgundy">{previewLightbox.originalName}</h3>
                <p className="text-[10px] font-mono text-charcoal/60">
                  {formatFileSize(previewLightbox.sizeBytes)} • {previewLightbox.mimeType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLightbox(null)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-cream-50 max-h-[70vh]">
              {previewLightbox.mimeType.startsWith('image/') ? (
                <img
                  src={previewLightbox.url}
                  alt={previewLightbox.altText || previewLightbox.originalName}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow"
                />
              ) : (
                <div className="text-center p-12 space-y-3">
                  <FileText className="w-16 h-16 text-burgundy mx-auto" />
                  <p className="text-xs font-mono text-charcoal/80">PDF Document Preview</p>
                  <a
                    href={previewLightbox.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-burgundy text-white text-xs font-bold"
                  >
                    <span>Open Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-border-soft flex items-center justify-between">
              <span className="text-xs font-mono text-charcoal/60 truncate max-w-md">
                {previewLightbox.url}
              </span>
              <button
                type="button"
                onClick={() => handleCopyUrl(previewLightbox.url, previewLightbox.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-burgundy text-white text-xs font-mono"
              >
                {copiedId === previewLightbox.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === previewLightbox.id ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
