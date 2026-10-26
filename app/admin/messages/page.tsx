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
      <div className="flex items-center justify-between pb-6 border-b border-border-soft dark:border-charcoal-700">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy dark:text-cream">Contact Submissions</h1>
          <p className="text-xs font-mono text-charcoal/70 dark:text-cream/70 mt-1">
            REVIEW, MANAGE & RESOLVE INCOMING PORTFOLIO INQUIRIES
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {messages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Messages List Sidebar */}
          <div className="md:col-span-5 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-4 space-y-2 h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMsg(msg);
                  if (!msg.isRead) handleUpdateStatus(msg.id, { isRead: true });
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedMsg?.id === msg.id
                    ? 'border-rosegold-700/50 dark:border-rosegold/50 bg-cream-100 dark:bg-charcoal-700 shadow-sm'
                    : 'border-border-soft dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-800/80 hover:bg-cream-100/70 dark:hover:bg-charcoal-700/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-semibold ${!msg.isRead ? 'text-burgundy dark:text-cream font-bold' : 'text-charcoal/80 dark:text-cream/80'}`}>
                    {msg.name}
                  </span>
                  {!msg.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <h4 className="text-xs font-mono text-charcoal/80 dark:text-cream/80 truncate">{msg.subject}</h4>
                <p className="text-xs text-charcoal/70 dark:text-cream/70 line-clamp-1 mt-1">{msg.message}</p>
                <span className="text-[10px] font-mono text-charcoal/60 dark:text-cream/60 mt-2 block">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Message Detail View */}
          <div className="md:col-span-7 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-6 sm:p-8 space-y-6">
            {selectedMsg ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-soft dark:border-charcoal-700">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-burgundy dark:text-cream">{selectedMsg.subject}</h3>
                    <p className="text-xs font-mono text-charcoal/70 dark:text-cream/70">
                      From: <span className="text-burgundy dark:text-cream font-semibold">{selectedMsg.name}</span> &lt;
                      <a
                        href={`mailto:${selectedMsg.email}`}
                        className="text-rosegold-700 dark:text-rosegold hover:underline"
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
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-border-soft dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-700 text-charcoal/80 dark:text-cream/80 hover:text-burgundy dark:hover:text-cream'
                      }`}
                    >
                      {selectedMsg.isResolved ? 'Marked Resolved' : 'Mark Resolved'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="p-1.5 rounded hover:bg-cream-100 dark:hover:bg-charcoal-700 text-charcoal/70 dark:text-cream/70 hover:text-red-500"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-charcoal/70 dark:text-cream/70 flex items-center gap-4">
                  <span>Received: {new Date(selectedMsg.createdAt).toLocaleString()}</span>
                  {selectedMsg.ipAddress && <span>IP: {selectedMsg.ipAddress}</span>}
                </div>

                <div className="p-5 rounded-xl bg-cream-100/60 dark:bg-charcoal-900/60 border border-border-soft dark:border-charcoal-700 text-sm text-charcoal dark:text-cream leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(
                      selectedMsg.subject
                    )}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-500 text-cream font-bold text-xs transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-charcoal/70 dark:text-cream/70 text-xs font-mono">
                Select a message on the left to read its contents.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-24 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-8 space-y-3">
          <Inbox className="w-10 h-10 text-charcoal/40 dark:text-cream/40 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-burgundy dark:text-cream">No Inquiries Received</h3>
          <p className="text-xs text-charcoal/70 dark:text-cream/70 max-w-sm mx-auto">
            When users submit the contact form on your portfolio website, messages will securely appear here.
          </p>
        </div>
      )}
    </div>
  );
}
