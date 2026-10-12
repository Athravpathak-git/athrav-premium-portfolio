import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  FolderGit2,
  Award,
  Briefcase,
  Wrench,
  Mail,
  ShieldCheck,
  ArrowRight,
  Database,
  CheckCircle,
  Clock,
} from 'lucide-react';
import prisma from '@/lib/prisma.js';
import { getCurrentAdmin } from '@/lib/session.js';

export default async function AdminOverviewPage() {
  const current = await getCurrentAdmin();
  if (!current || !current.user) {
    redirect('/admin/login');
  }

  // Fetch counts safely
  let projectStats = { total: 0, published: 0, drafts: 0 };
  let certCount = 0;
  let expCount = 0;
  let skillCount = 0;
  let unreadMessages = 0;
  let totalMessages = 0;
  let recentAuditLogs = [];
  let recentMessages = [];

  try {
    const [
      totalProjects,
      publishedProjects,
      totalCerts,
      totalExps,
      totalSkills,
      unreadMsgs,
      totalMsgs,
      logs,
      msgs,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { isPublished: true } }),
      prisma.certification.count(),
      prisma.experience.count(),
      prisma.skill.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.contactMessage.count(),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } },
      }),
      prisma.contactMessage.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    projectStats = {
      total: totalProjects,
      published: publishedProjects,
      drafts: totalProjects - publishedProjects,
    };
    certCount = totalCerts;
    expCount = totalExps;
    skillCount = totalSkills;
    unreadMessages = unreadMsgs;
    totalMessages = totalMsgs;
    recentAuditLogs = logs;
    recentMessages = msgs;
  } catch (err) {
    console.error('Error loading dashboard stats:', err.message);
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            System Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-slate-200 font-mono">{current.user.username}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Database Connected</span>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/projects"
          className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Projects</span>
            <FolderGit2 className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">{projectStats.total}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {projectStats.published} published • {projectStats.drafts} drafts
            </p>
          </div>
        </Link>

        <Link
          href="/admin/messages"
          className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Inquiries</span>
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-semibold text-white">{totalMessages}</p>
              {unreadMessages > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium">
                  {unreadMessages} new
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Secure contact form submissions
            </p>
          </div>
        </Link>

        <Link
          href="/admin/skills"
          className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Skills</span>
            <Wrench className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">{skillCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Categorized stack entries</p>
          </div>
        </Link>

        <Link
          href="/admin/certifications"
          className="p-5 rounded-2xl glass-panel glass-panel-hover space-y-3 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Certifications</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">{certCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified credentials</p>
          </div>
        </Link>
      </div>

      {/* Two Column Section: Recent Messages & Security Audit Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Messages Preview */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Recent Inquiries</span>
            </h2>
            <Link
              href="/admin/messages"
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{msg.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate">{msg.subject}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No messages received yet.
            </p>
          )}
        </div>

        {/* Audit Logs Preview */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security Audit Stream</span>
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentAuditLogs.length > 0 ? (
            <div className="space-y-2.5">
              {recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-slate-300 font-medium">
                      {log.action}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      IP: {log.ipAddress || 'Internal'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              No audit entries recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
