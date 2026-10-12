'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, AlertCircle, Loader2, MailOpen, Reply, Clock } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog.jsx';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      setError('Failed to fetch contact messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (msg) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          id: msg.id,
          isRead: !msg.isRead,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update message status.');
      }

      fetchMessages();
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage((prev) => ({ ...prev, isRead: !prev.isRead }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/messages?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) {
        throw new Error('Failed to delete message.');
      }

      setInfoMessage('Message removed from database.');
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      setDeleteTarget(null);
      fetchMessages();
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
          <Mail className="w-5 h-5 text-sky-400" />
          <span>Inquiries & Messages</span>
        </h1>
        <p className="text-xs text-slate-400">
          Private contact form transmissions received from public visitors.
        </p>
      </div>

      {infoMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : messages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages List Column */}
          <div className="lg:col-span-5 space-y-2">
            {messages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) handleToggleRead(msg);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/10 border-white/20'
                      : msg.isRead
                      ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                      : 'bg-sky-500/[0.04] border-sky-500/20 hover:bg-sky-500/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center space-x-1.5">
                      {!msg.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                      )}
                      <span>{msg.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal mt-1 truncate">
                    {msg.subject}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Message Preview Column */}
          <div className="lg:col-span-7">
            {selectedMessage ? (
              <div className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {selectedMessage.subject}
                    </h2>
                    <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                      <p>
                        From: <span className="text-slate-200">{selectedMessage.name}</span> (
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-sky-400 hover:underline"
                        >
                          {selectedMessage.email}
                        </a>
                        )
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(selectedMessage)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center space-x-1"
                      title={selectedMessage.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <MailOpen className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(selectedMessage)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-light">
                  {selectedMessage.message}
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Masked IP: {selectedMessage.ipAddress || 'Internal'}
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl glass-panel text-center text-xs text-slate-400">
                Select an inquiry from the left to read its contents.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl glass-panel text-center max-w-md mx-auto space-y-3">
          <Mail className="w-8 h-8 text-slate-500 mx-auto" />
          <h2 className="text-sm font-medium text-white">No Inquiries Yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inquiries transmitted through the public contact form will appear securely here.
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Inquiry"
        message={`Delete message from "${deleteTarget?.name}"?`}
        confirmText="Delete Message"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={deleting}
      />
    </div>
  );
}
