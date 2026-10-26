import React from 'react';
import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth-guard';
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
  await requireAdminPage();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-300/70 dark:border-forest-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forest dark:text-ivory">
            Executive Control Overview
          </h1>
          <p className="text-xs font-mono text-forest-600 dark:text-sage font-medium mt-1">
            ATHRAV PATHAK PORTFOLIO CONTENT MANAGEMENT & SECURITY HUB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ivory dark:bg-forest-900 hover:bg-cream-200 border border-cream-300 dark:border-forest-700 text-xs font-mono font-semibold text-forest dark:text-ivory transition-colors shadow-sm"
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
            ? 'border-forest-600 bg-sage-50 text-forest'
            : 'border-champagne-400 bg-champagne-50/70 dark:bg-forest-900 text-forest dark:text-champagne-200'
        } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDbConnected
                ? 'bg-forest text-ivory'
                : 'bg-champagne-200 text-champagne-900'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-forest dark:text-ivory">
              {isDbConnected
                ? 'Neon PostgreSQL Connected & Synchronized'
                : 'Local Development Mock Mode (Database Deferred)'}
            </h3>
            <p className="text-xs text-forest-700/80 dark:text-sage-100 mt-0.5">
              {isDbConnected
                ? 'All queries are executing against your live PostgreSQL cluster.'
                : 'The application is running with type-safe local mock fixtures. Connect Neon database later by setting DATABASE_URL.'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/settings"
          className="text-xs font-mono font-semibold text-forest dark:text-champagne-300 hover:underline shrink-0 px-3.5 py-1.5 rounded-lg border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-800 shadow-sm"
        >
          Inspect Connection Settings →
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-forest-600 dark:text-sage font-medium">Total Projects</span>
            <Layers className="w-4 h-4 text-forest dark:text-champagne-300" />
          </div>
          <div className="text-3xl font-extrabold text-forest dark:text-ivory">{projects.length}</div>
          <p className="text-[11px] font-mono text-forest-600 dark:text-sage">
            {projects.filter((p) => p.isPublished).length} published •{' '}
            {projects.filter((p) => !p.isPublished).length} draft
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-forest-600 dark:text-sage font-medium">Certifications</span>
            <Award className="w-4 h-4 text-forest dark:text-champagne-300" />
          </div>
          <div className="text-3xl font-extrabold text-forest dark:text-ivory">{certs.length}</div>
          <p className="text-[11px] font-mono text-forest-600 dark:text-sage">
            {certs.filter((c) => c.isPublished).length} published •{' '}
            {certs.filter((c) => !c.isPublished).length} draft
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-forest-600 dark:text-sage font-medium">Contact Messages</span>
            <Inbox className="w-4 h-4 text-forest dark:text-champagne-300" />
          </div>
          <div className="text-3xl font-extrabold text-forest dark:text-ivory">{messages.length}</div>
          <p className="text-[11px] font-mono text-forest-600 dark:text-sage">
            {unreadMessages.length} unread / awaiting response
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-forest-600 dark:text-sage font-medium">Active Skills</span>
            <Cpu className="w-4 h-4 text-forest dark:text-champagne-300" />
          </div>
          <div className="text-3xl font-extrabold text-forest dark:text-ivory">{skills.length}</div>
          <p className="text-[11px] font-mono text-forest-600 dark:text-sage">
            Across 6 technical categories
          </p>
        </div>
      </div>

      {/* Two-column layout: Recent Messages & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-cream-300/60 dark:border-forest-800">
            <h3 className="text-lg font-bold text-forest dark:text-ivory">Recent Inquiries</h3>
            <Link
              href="/admin/messages"
              className="text-xs font-mono font-semibold text-forest dark:text-champagne-300 hover:underline"
            >
              View all ({messages.length}) →
            </Link>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl border border-cream-300/60 dark:border-forest-800 bg-cream-50 dark:bg-forest-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-forest dark:text-ivory">{msg.name}</span>
                    <span className="text-[10px] font-mono text-forest-600 dark:text-sage">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-champagne-700 dark:text-champagne-300 font-mono truncate">{msg.subject}</p>
                  <p className="text-xs text-forest-700/80 dark:text-sage-100 line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-forest-600 dark:text-sage text-xs font-mono">
              No messages received yet. Submit a test inquiry on the Contact page.
            </div>
          )}
        </div>

        {/* Security Audit Activity */}
        <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-cream-300/60 dark:border-forest-800">
            <h3 className="text-lg font-bold text-forest dark:text-ivory flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-champagne-300" />
              <span>Security Audit Stream</span>
            </h3>
            <Link
              href="/admin/security"
              className="text-xs font-mono font-semibold text-forest dark:text-champagne-300 hover:underline"
            >
              Full log →
            </Link>
          </div>

          {auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-cream-300/60 dark:border-forest-800 bg-cream-50 dark:bg-forest-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-forest dark:text-ivory font-semibold">{log.action}</span>
                    {log.entityType && (
                      <span className="text-forest-600 dark:text-sage ml-2">[{log.entityType}]</span>
                    )}
                  </div>
                  <span className="text-[10px] text-forest-600 dark:text-sage">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-forest-600 dark:text-sage text-xs font-mono">
              Audit stream will record logins, content modifications, and administrative events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
