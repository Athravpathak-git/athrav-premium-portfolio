'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Inbox,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMessages = () => {
    fetch('/api/admin/messages')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login?from=' + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setMessages(data.messages || []);
          if (data.messages && data.messages.length > 0 && !selectedMsg) {
            setSelectedMsg(data.messages[0]);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'Failed to retrieve contact messages.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, patch: any) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update message.');

      fetchMessages();
      if (selectedMsg?.id === id) {
        setSelectedMsg({ ...selectedMsg, ...patch });
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete message.');

      setStatusMsg({ type: 'success', text: 'Message deleted.' });
      setSelectedMsg(null);
      fetchMessages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Contact Submissions</h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            REVIEW, MANAGE & RESOLVE INCOMING PORTFOLIO INQUIRIES
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

      {messages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Messages List Sidebar */}
          <div className="md:col-span-5 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 space-y-2 h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMsg(msg);
                  if (!msg.isRead) handleUpdateStatus(msg.id, { isRead: true });
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedMsg?.id === msg.id
                    ? 'border-white/20 bg-zinc-900 shadow-md'
                    : 'border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-semibold ${!msg.isRead ? 'text-white' : 'text-zinc-400'}`}>
                    {msg.name}
                  </span>
                  {!msg.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </div>
                <h4 className="text-xs font-mono text-silver-300 truncate">{msg.subject}</h4>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{msg.message}</p>
                <span className="text-[10px] font-mono text-zinc-400 mt-2 block">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Message Detail View */}
          <div className="md:col-span-7 rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-6">
            {selectedMsg ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">{selectedMsg.subject}</h3>
                    <p className="text-xs font-mono text-zinc-400">
                      From: <span className="text-white">{selectedMsg.name}</span> &lt;
                      <a
                        href={`mailto:${selectedMsg.email}`}
                        className="text-silver-300 hover:underline"
                      >
                        {selectedMsg.email}
                      </a>
                      &gt;
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(selectedMsg.id, { isResolved: !selectedMsg.isResolved })
                      }
                      className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                        selectedMsg.isResolved
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {selectedMsg.isResolved ? 'Marked Resolved' : 'Mark Resolved'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-zinc-400 flex items-center gap-4">
                  <span>Received: {new Date(selectedMsg.createdAt).toLocaleString()}</span>
                  {selectedMsg.ipAddress && <span>IP: {selectedMsg.ipAddress}</span>}
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/50 border border-white/5 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(
                      selectedMsg.subject
                    )}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-xs transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400 text-xs font-mono">
                Select a message on the left to read its contents.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-24 rounded-2xl border border-white/10 bg-zinc-950/70 p-8 space-y-3">
          <Inbox className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white">No Inquiries Received</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            When users submit the contact form on your portfolio website, messages will securely appear here.
          </p>
        </div>
      )}
    </div>
  );
}
