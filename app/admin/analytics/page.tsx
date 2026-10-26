import React from 'react';
import { requireAdminPage } from '@/lib/auth-guard';
import { getAnalyticsSummary } from '@/lib/data-service';
import { BarChart3, Database, Eye, Inbox, Layers, ShieldCheck } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  const analytics = await getAnalyticsSummary();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-white">Privacy-Conscious Analytics</h1>
        <p className="text-xs font-mono text-zinc-400 mt-1">
          FIRST-PARTY METRICS • NO EXTERNAL TRACKING PIXELS • PRIVACY COMPLIANT
        </p>
      </div>

      {/* Database Integration Notice */}
      <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950/70 space-y-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-silver-300" />
          <h3 className="text-sm font-semibold text-white">Data Collection Architecture</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {analytics.note}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Published Projects</span>
            <Layers className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics.publishedProjects} / {analytics.totalProjects}
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Active public showcase implementations
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Certifications Listed</span>
            <ShieldCheck className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics.publishedCertifications} / {analytics.totalCertifications}
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Machine learning & AI coursework records
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Inquiries Received</span>
            <Inbox className="w-4 h-4 text-silver-300" />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics.totalMessages}
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            {analytics.unreadMessages} unread contact submissions
          </p>
        </div>
      </div>

      {/* Route Distribution Table */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Monitored Routes Overview</h3>
          <span className="text-xs font-mono text-zinc-400">First-Party Endpoints</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/60 border-b border-white/10 font-mono text-zinc-400 uppercase">
            <tr>
              <th className="p-4">Path</th>
              <th className="p-4">Section Name</th>
              <th className="p-4 text-right">Privacy Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {analytics.pageViewsSummary.map((route) => (
              <tr key={route.path} className="hover:bg-zinc-900/30">
                <td className="p-4 font-mono text-white">{route.path}</td>
                <td className="p-4 text-zinc-300">{route.description}</td>
                <td className="p-4 text-right font-mono text-emerald-400">
                  Zero Third-Party Cookies
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
