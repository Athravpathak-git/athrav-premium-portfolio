'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Users,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUsers(data.users || []);
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve administrator users.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setStatusMsg({ type: 'success', text: 'Password successfully updated.' });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy">Administrator Accounts</h1>
          <p className="text-xs font-mono text-charcoal/70 mt-1">
            MANAGE AUTHENTICATION ACCESS, ROLES & SUPER ADMIN PRIVILEGES
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs transition-colors"
        >
          <Key className="w-4 h-4" />
          <span>Change Password</span>
        </button>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="p-6 rounded-2xl border border-border-soft bg-white p-6 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            <h3 className="text-base font-semibold text-burgundy flex items-center gap-2">
              <Lock className="w-4 h-4 text-silver-300" />
              <span>Update Administrator Password</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="text-xs text-charcoal/70 hover:text-burgundy"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                New Strong Password * (min 8 chars, uppercase, lowercase, number)
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-charcoal/85 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full bg-cream-50 border border-border-soft rounded-xl px-4 py-2 text-sm text-charcoal"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs"
              >
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Update Password & Revoke Other Sessions</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100/70 border-b border-border-soft font-mono text-charcoal/70 uppercase">
            <tr>
              <th className="p-4">Username</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-cream-50 transition-colors">
                <td className="p-4 font-semibold text-burgundy flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-silver-300" />
                  <span>{u.username}</span>
                </td>
                <td className="p-4 text-charcoal/85 font-mono">{u.email}</td>
                <td className="p-4">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-silver-400/10 border border-silver-400/20 text-silver-300">
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {u.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-charcoal/70">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
