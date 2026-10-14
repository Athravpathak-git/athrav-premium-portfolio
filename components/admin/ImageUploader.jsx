'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, RefreshCw, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({
  value,
  onChange,
  label = 'Asset Image',
  aspect = 'square',
  helperText = 'PNG, JPEG, WebP, or GIF (max 5MB)',
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB maximum limit.');
      return;
    }

    // Validate mime
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid format. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    setError(null);
    setImgError(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setError(null);
    setImgError(false);
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300 block">{label}</label>

      {/* Hidden file input for programmatically triggering replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-white/5 border border-white/10">
          {/* Thumbnail preview */}
          <div className="w-14 h-14 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative flex items-center justify-center shrink-0 shadow-inner">
            {!imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Preview"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 p-1">
                <ImageIcon className="w-5 h-5" />
                <span className="text-[9px] text-center mt-0.5">Missing</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 font-mono truncate">{value}</p>
            <p className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-0.5">
              <Check className="w-3 h-3" />
              <span>Verified asset stored securely</span>
            </p>
          </div>

          {/* Actions: Replace & Remove */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={triggerUpload}
              disabled={uploading}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 transition-colors disabled:opacity-50"
              title="Replace this image"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Replace</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onClick={triggerUpload}
            className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 cursor-pointer transition-all"
          >
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                  <p className="text-xs text-slate-400">Verifying signature & uploading...</p>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 border border-white/10">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">
                      Click to upload an image
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {helperText}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center space-x-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
