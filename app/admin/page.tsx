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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-soft">
        <div>
          <h1 className="text-3xl font-serif font-extrabold tracking-tight text-burgundy">
            Executive Control Overview
          </h1>
          <p className="text-xs font-mono text-rosegold font-semibold tracking-wider mt-1">
            ATHRAV PATHAK PORTFOLIO CONTENT MANAGEMENT & SECURITY HUB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-cream-100 border border-border-soft text-xs font-mono font-semibold text-burgundy transition-colors shadow-sm"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-rosegold" />
          </Link>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="p-5 rounded-2xl border border-border-soft bg-white text-charcoal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-cream-100 text-burgundy border border-border-soft">
            <Database className="w-5 h-5 text-burgundy" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-burgundy">
              {isDbConnected
                ? 'PostgreSQL Database Connected & Synchronized'
                : 'Persistent Storage Engine Active & Operational'}
            </h3>
            <p className="text-xs text-charcoal/80 mt-0.5">
              {isDbConnected
                ? 'All portfolio content and assets are executing against your live database cluster.'
                : 'All changes to portfolio projects, certifications, profile data, and media are safely stored and synchronized.'}
            </p>
          </div>
        </div>

        <Link
          href="/admin/settings"
          className="text-xs font-mono font-semibold text-burgundy hover:underline shrink-0 px-3.5 py-1.5 rounded-lg border border-border-soft bg-cream-50 shadow-sm"
        >
          System Settings →
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-charcoal/70 font-medium">Total Projects</span>
            <Layers className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-serif font-extrabold text-burgundy">{projects.length}</div>
          <p className="text-[11px] font-mono text-charcoal/70">
            {projects.filter((p) => p.isPublished).length} published •{' '}
            {projects.filter((p) => !p.isPublished).length} draft
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-charcoal/70 font-medium">Certifications</span>
            <Award className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-serif font-extrabold text-burgundy">{certs.length}</div>
          <p className="text-[11px] font-mono text-charcoal/70">
            {certs.filter((c) => c.isPublished).length} published •{' '}
            {certs.filter((c) => !c.isPublished).length} draft
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-charcoal/70 font-medium">Contact Messages</span>
            <Inbox className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-serif font-extrabold text-burgundy">{messages.length}</div>
          <p className="text-[11px] font-mono text-charcoal/70">
            {unreadMessages.length} unread / awaiting response
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-charcoal/70 font-medium">Active Skills</span>
            <Cpu className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-serif font-extrabold text-burgundy">{skills.length}</div>
          <p className="text-[11px] font-mono text-charcoal/70">
            Across 6 technical categories
          </p>
        </div>
      </div>

      {/* Two-column layout: Recent Messages & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            <h3 className="text-lg font-serif font-bold text-burgundy">Recent Inquiries</h3>
            <Link
              href="/admin/messages"
              className="text-xs font-mono font-semibold text-burgundy hover:underline"
            >
              View all ({messages.length}) →
            </Link>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl border border-border-soft bg-cream-50 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-burgundy">{msg.name}</span>
                    <span className="text-[10px] font-mono text-charcoal/70">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-rosegold font-mono truncate">{msg.subject}</p>
                  <p className="text-xs text-charcoal/80 line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal/70 text-xs font-mono">
              No messages received yet. Submit a test inquiry on the Contact page.
            </div>
          )}
        </div>

        {/* Security Audit Activity */}
        <div className="rounded-2xl border border-border-soft bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border-soft">
            <h3 className="text-lg font-serif font-bold text-burgundy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rosegold" />
              <span>Security Audit Stream</span>
            </h3>
            <Link
              href="/admin/security"
              className="text-xs font-mono font-semibold text-burgundy hover:underline"
            >
              Full log →
            </Link>
          </div>

          {auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-border-soft bg-cream-50 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-burgundy font-semibold">{log.action}</span>
                    {log.entityType && (
                      <span className="text-charcoal/70 ml-2">[{log.entityType}]</span>
                    )}
                  </div>
                  <span className="text-[10px] text-charcoal/70">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal/70 text-xs font-mono">
              Audit stream will record logins, content modifications, and administrative events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
