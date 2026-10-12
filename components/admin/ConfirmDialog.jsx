'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Destructive Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="p-0 rounded-2xl bg-[#0d0e15] text-slate-100 border border-red-500/30 shadow-2xl backdrop:bg-black/80 max-w-md w-full m-auto"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3 text-red-400">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 id="dialog-title" className="text-base font-medium text-white">
            {title}
          </h2>
        </div>

        <p id="dialog-desc" className="text-xs text-slate-400 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-medium glass-button"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
