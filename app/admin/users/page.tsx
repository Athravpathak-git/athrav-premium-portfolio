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
  UserPlus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  ShieldAlert,
  Search,
  Check,
} from 'lucide-react';

interface AdminUserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN',
    status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED',
  });

  // Edit Admin Modal State
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN',
    status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED',
  });

  // Reset / Change Password Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<AdminUserRecord | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
        if (data && data.users) setUsers(data.users);
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve administrator records.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setCurrentAdmin(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenAddModal = () => {
    setAddForm({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    setStatusMsg(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.password !== addForm.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setAddingUser(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          username: addForm.username,
          email: addForm.email,
          password: addForm.password,
          role: addForm.role,
          status: addForm.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create administrator account.');

      setStatusMsg({ type: 'success', text: `Administrator "${data.user.username}" created successfully.` });
      setShowAddModal(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating administrator.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setAddingUser(false);
    }
  };

  const handleOpenEditModal = (user: AdminUserRecord) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || user.username,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setStatusMsg(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editForm.name,
          username: editForm.username,
          email: editForm.email,
          role: editForm.role,
          status: editForm.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update administrator account.');

      setStatusMsg({ type: 'success', text: `Administrator "${data.user.username}" updated successfully.` });
      setEditingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating administrator.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenPasswordModal = (user: AdminUserRecord) => {
    setPasswordModalUser(user);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setStatusMsg(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    setStatusMsg(null);

    const isOwnAccount = currentAdmin && currentAdmin.id === passwordModalUser.id;

    try {
      if (isOwnAccount && passwordForm.currentPassword) {
        // Use auth change password endpoint with current password verification
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update password.');
      } else {
        // Administrative password reset via users API
        const res = await fetch(`/api/admin/users/${passwordModalUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: passwordModalUser.id,
            password: passwordForm.newPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      }

      setStatusMsg({
        type: 'success',
        text: `Password for "${passwordModalUser.username}" updated successfully. Active sessions revoked.`,
      });
      setPasswordModalUser(null);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing password.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setConfirmingDelete(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete administrator.');

      setStatusMsg({ type: 'success', text: `Administrator "${deletingUser.username}" removed.` });
      setDeletingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting administrator.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setConfirmingDelete(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight text-burgundy">
            Admin Management
          </h1>
          <p className="text-xs font-mono text-rosegold font-semibold tracking-wider mt-1">
            ATHRAV PATHAK PORTFOLIO CMS • ADMINISTRATIVE ACCESS & ROLE GOVERNANCE
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
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

      {/* Search & Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Total Administrators</span>
          <div className="text-2xl font-serif font-bold text-burgundy">{users.length}</div>
          <p className="text-[11px] font-mono text-charcoal/70">
            {users.filter((u) => u.status === 'ACTIVE').length} active • {users.filter((u) => u.status === 'SUSPENDED').length} suspended
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Super Administrators</span>
          <div className="text-2xl font-serif font-bold text-burgundy">
            {users.filter((u) => u.role === 'SUPER_ADMIN').length}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70">Full executive access</p>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-mono text-charcoal/60 uppercase">Standard Administrators</span>
          <div className="text-2xl font-serif font-bold text-burgundy">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70">Content management tier</p>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-rosegold absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search administrators by name, username, email, or role..."
            className="w-full bg-white border border-border-soft rounded-xl px-4 py-2.5 pl-10 text-xs text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-burgundy shadow-sm"
          />
        </div>
      </div>

      {/* Administrators Table */}
      <div className="rounded-2xl border border-border-soft bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-charcoal/60">
            <Loader2 className="w-6 h-6 animate-spin text-burgundy" />
            <span className="text-xs font-mono">Loading administrator directory...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100/70 border-b border-border-soft font-mono text-charcoal/70 uppercase">
                <tr>
                  <th className="p-4 font-semibold">Administrator</th>
                  <th className="p-4 font-semibold">Username</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Created</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredUsers.map((user) => {
                  const isCurrent = currentAdmin && currentAdmin.id === user.id;
                  const isSuper = user.role === 'SUPER_ADMIN';
                  const isActive = user.status === 'ACTIVE';

                  return (
                    <tr key={user.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-burgundy/10 border border-burgundy/20 flex items-center justify-center text-burgundy font-serif font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-burgundy flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rosegold-50 text-burgundy border border-rosegold/40">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-charcoal/90">{user.username}</td>
                      <td className="p-4 font-mono text-charcoal/70">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                            isSuper
                              ? 'bg-burgundy/10 dark:bg-burgundy/30 border-burgundy/30 text-burgundy dark:text-cream font-bold'
                              : 'bg-cream-100 dark:bg-charcoal-700 border-border-soft dark:border-charcoal-600 text-charcoal dark:text-cream'
                          }`}
                        >
                          <Shield className="w-3 h-3 text-rosegold" />
                          <span>{user.role}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          {isActive ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{user.status}</span>
                        </span>
                      </td>
                      <td className="p-4 font-mono text-charcoal/60">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(user)}
                            title="Reset or Change Password"
                            className="p-1.5 rounded-lg border border-border-soft bg-white hover:bg-cream-100 text-charcoal/70 hover:text-burgundy transition-colors shadow-sm"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit Administrator"
                            className="p-1.5 rounded-lg border border-border-soft bg-white hover:bg-cream-100 text-charcoal/70 hover:text-burgundy transition-colors shadow-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(isCurrent)}
                            onClick={() => setDeletingUser(user)}
                            title={isCurrent ? 'Cannot delete your own logged in account' : 'Delete Administrator'}
                            className={`p-1.5 rounded-lg border transition-colors shadow-sm ${
                              isCurrent
                                ? 'border-border-soft dark:border-charcoal-700 bg-cream-100 dark:bg-charcoal-800 text-charcoal/30 dark:text-cream/30 cursor-not-allowed'
                                : 'border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-charcoal/60 dark:text-cream/60 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-charcoal/60 space-y-2">
            <Users className="w-8 h-8 text-rosegold mx-auto opacity-50" />
            <p className="text-sm font-serif">No administrators match your search.</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD ADMINISTRATOR MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-border-soft shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-burgundy">Add New Administrator</h3>
                  <p className="text-[11px] font-mono text-charcoal/60">Issue credentials with role-based access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-charcoal/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Athrav Pathak"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. athrav_dev"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal font-mono focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                  />
                  <span className="text-[10px] text-charcoal/50 mt-0.5 block">Alphanumeric, underscores, hyphens</span>
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal font-mono focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Role *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                  >
                    <option value="ADMIN">ADMIN (Content Management)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Governance)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Status *</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized to login)</option>
                    <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
                >
                  {addingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Create Administrator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT ADMINISTRATOR MODAL */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-border-soft shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-burgundy">Edit Administrator</h3>
                  <p className="text-[11px] font-mono text-charcoal/60">Update details for {editingUser.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-charcoal/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal font-mono focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal font-mono focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Role *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                  >
                    <option value="ADMIN">ADMIN (Content Management)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Governance)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-burgundy"
                  >
                    <option value="ACTIVE">ACTIVE (Authorized to login)</option>
                    <option value="SUSPENDED">SUSPENDED (Access blocked)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHANGE / RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border-soft shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-soft">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-burgundy/10 text-burgundy flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-burgundy">
                    {currentAdmin?.id === passwordModalUser.id ? 'Change Your Password' : `Reset Password: ${passwordModalUser.username}`}
                  </h3>
                  <p className="text-[11px] font-mono text-charcoal/60">
                    Will terminate all existing active sessions for this account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              {currentAdmin?.id === passwordModalUser.id && (
                <div>
                  <label className="block font-mono text-charcoal/80 mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-charcoal/80 mb-1">
                  New Password * (min 8 chars, 1 uppercase, 1 symbol)
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                />
              </div>

              <div>
                <label className="block font-mono text-charcoal/80 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-cream-50 border border-border-soft rounded-xl px-3.5 py-2 text-sm text-charcoal focus:ring-2 focus:ring-burgundy"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
                >
                  {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-red-200 shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-red-950">Delete Administrator</h3>
                <p className="text-xs text-charcoal/70">This action will permanently revoke access.</p>
              </div>
            </div>

            <p className="text-xs text-charcoal/80 leading-relaxed bg-cream-50 p-3.5 rounded-xl border border-border-soft">
              Are you sure you want to delete <span className="font-bold text-burgundy">{deletingUser.name}</span> (<code className="font-mono">{deletingUser.username}</code>)? All active sessions and authentication tokens will be immediately invalidated.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-border-soft bg-white hover:bg-cream-100 text-xs font-semibold text-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingDelete}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-60"
              >
                {confirmingDelete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
