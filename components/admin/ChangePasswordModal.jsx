'use client';

import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, Loader2, X } from 'lucide-react';

export default function ChangePasswordModal({
  isOpen,
  mustChange = false,
  onSuccess,
  onClose,
}) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 10) {
      setError('New password must be at least 10 characters long.');
      setLoading(false);
      return;
    }

    if (formData.newPassword === '#Athr2007') {
      setError('You cannot reuse the temporary bootstrap password (#Athr2007).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-pwd-title"
    >
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#0c0d14] border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sky-400">
              <KeyRound className="w-5 h-5" />
              <h2 id="change-pwd-title" className="text-base font-medium text-white">
                {mustChange ? 'Mandatory Password Update' : 'Update Admin Password'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {mustChange
                ? 'Your account was bootstrapped with a temporary password. You must establish a strong private password before proceeding.'
                : 'Replace your current administrator password with a new strong credential.'}
            </p>
          </div>

          {!mustChange && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {mustChange && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              The temporary password <code>#Athr2007</code> is now expired for regular use and cannot be reused.
            </span>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-medium text-white">Password Updated Successfully</h3>
            <p className="text-xs text-slate-400">Unlocking dashboard features...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Current Password <span className="text-sky-400">*</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                autoComplete="current-password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">
                  New Strong Password <span className="text-sky-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Min 10 characters</span>
              </div>
              <input
                type="password"
                name="newPassword"
                required
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Upper, lower, digit, symbol required"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Confirm New Password <span className="text-sky-400">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Retype new password"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validating & Hashing with Argon2id...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
