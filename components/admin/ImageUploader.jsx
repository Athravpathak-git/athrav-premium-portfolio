'use client';

import React, { useState } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ value, onChange, label = 'Asset Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300 block">{label}</label>

      {value ? (
        <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-12 h-12 rounded-lg bg-black border border-white/10 overflow-hidden relative flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 font-mono truncate">{value}</p>
            <p className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-0.5">
              <Check className="w-3 h-3" />
              <span>Uploaded safely</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                  <p className="text-xs text-slate-400">Verifying signature & uploading...</p>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-200">
                      Click to upload an image
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      PNG, JPEG, WebP, or GIF (max 5MB)
                    </span>
                  </div>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
