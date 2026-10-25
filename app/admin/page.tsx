import React from 'react';
import Link from 'next/link';
import {
  getProjectsList,
  getCertificationsList,
  getContactMessages,
  getSkillsList,
  getAuditLogsList,
  getEducationList,
} from '@/lib/data-service';
import { isDatabaseConfigured } from '@/lib/db';
import {
  Layers,
  Award,
  Inbox,
  Cpu,
  ShieldCheck,
  Database,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const isDbConnected = isDatabaseConfigured();
  const projects = await getProjectsList({ publishedOnly: false });
  const certs = await getCertificationsList({ publishedOnly: false });
  const messages = await getContactMessages();
  const skills = await getSkillsList(false);
  const auditLogs = await getAuditLogsList(5);
  const education = await getEducationList(false);

  const unreadMessages = messages.filter((m) => !m.isRead);

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Executive Control Overview
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            ATHRAV PATHAK PORTFOLIO CONTENT MANAGEMENT & SECURITY HUB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-white transition-colors"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Database State Banner */}
      <div
        className={`p-5 rounded-2xl border ${
          isDbConnected
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200'
            : 'border-amber-500/20 bg-amber-500/5 text-amber-200'
        } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDbConnected
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {isDbConnected
                ? 'Neon PostgreSQL Connected & Synchronized'
                : 'Local Development Mock Mode (Database Deferred)'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isDbConnected
                ? 'All queries are executing against your live PostgreSQL cluster.'
                : 'The application is running with type-safe local mock fixtures. Connect Neon database later by setting DATABASE_URL.'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/settings"
          className="text-xs font-mono text-silver-300 hover:text-white shrink-0 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900"
        >
          Inspect Connection Settings →
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Total Projects</span>
            <Layers className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">{projects.length}</div>
          <p className="text-[11px] font-mono text-zinc-400">
            {projects.filter((p) => p.isPublished).length} published •{' '}
            {projects.filter((p) => !p.isPublished).length} draft
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Certifications</span>
            <Award className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">{certs.length}</div>
          <p className="text-[11px] font-mono text-zinc-400">
            {certs.filter((c) => c.isPublished).length} published •{' '}
            {certs.filter((c) => !c.isPublished).length} draft
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Contact Messages</span>
            <Inbox className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">{messages.length}</div>
          <p className="text-[11px] font-mono text-zinc-400">
            {unreadMessages.length} unread / awaiting response
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Active Skills</span>
            <Cpu className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">{skills.length}</div>
          <p className="text-[11px] font-mono text-zinc-400">
            Across 6 technical categories
          </p>
        </div>
      </div>

      {/* Two-column layout: Recent Messages & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Recent Inquiries</h3>
            <Link
              href="/admin/messages"
              className="text-xs font-mono text-silver-300 hover:text-white"
            >
              View all ({messages.length}) →
            </Link>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-zinc-900/40 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{msg.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-silver-300 font-mono truncate">{msg.subject}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs font-mono">
              No messages received yet. Submit a test inquiry on the Contact page.
            </div>
          )}
        </div>

        {/* Security Audit Activity */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security Audit Stream</span>
            </h3>
            <Link
              href="/admin/security"
              className="text-xs font-mono text-silver-300 hover:text-white"
            >
              Full log →
            </Link>
          </div>

          {auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-white font-medium">{log.action}</span>
                    {log.entityType && (
                      <span className="text-zinc-400 ml-2">[{log.entityType}]</span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs font-mono">
              Audit stream will record logins, content modifications, and administrative events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
