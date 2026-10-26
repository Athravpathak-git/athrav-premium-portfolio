import React from 'react';
import { requireAdminPage } from '@/lib/auth-guard';
import { getAnalyticsSummary } from '@/lib/data-service';
import { BarChart3, Database, Eye, Inbox, Layers, ShieldCheck } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  const analytics = await getAnalyticsSummary();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-border-soft dark:border-charcoal-700">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy dark:text-cream">Privacy-Conscious Analytics</h1>
        <p className="text-xs font-mono text-charcoal/70 dark:text-cream/70 mt-1">
          FIRST-PARTY METRICS • NO EXTERNAL TRACKING PIXELS • PRIVACY COMPLIANT
        </p>
      </div>

      {/* Database Integration Notice */}
      <div className="p-5 rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-rosegold" />
          <h3 className="text-sm font-semibold text-burgundy dark:text-cream">Data Collection Architecture</h3>
        </div>
        <p className="text-xs text-charcoal/80 dark:text-cream/80 leading-relaxed">
          {analytics.note}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-charcoal/70 dark:text-cream/70">
            <span>Published Projects</span>
            <Layers className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-bold text-burgundy dark:text-cream">
            {analytics.publishedProjects} / {analytics.totalProjects}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70 dark:text-cream/70">
            Active public showcase implementations
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-charcoal/70 dark:text-cream/70">
            <span>Certifications Listed</span>
            <ShieldCheck className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-bold text-burgundy dark:text-cream">
            {analytics.publishedCertifications} / {analytics.totalCertifications}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70 dark:text-cream/70">
            Machine learning & AI coursework records
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-charcoal/70 dark:text-cream/70">
            <span>Inquiries Received</span>
            <Inbox className="w-4 h-4 text-rosegold" />
          </div>
          <div className="text-3xl font-bold text-burgundy dark:text-cream">
            {analytics.totalMessages}
          </div>
          <p className="text-[11px] font-mono text-charcoal/70 dark:text-cream/70">
            {analytics.unreadMessages} unread contact submissions
          </p>
        </div>
      </div>

      {/* Route Distribution Table */}
      <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-soft dark:border-charcoal-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-burgundy dark:text-cream">Monitored Routes Overview</h3>
          <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70">First-Party Endpoints</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-cream-100/70 dark:bg-charcoal-900/80 border-b border-border-soft dark:border-charcoal-700 font-mono text-charcoal/70 dark:text-cream/70 uppercase">
            <tr>
              <th className="p-4">Path</th>
              <th className="p-4">Section Name</th>
              <th className="p-4 text-right">Privacy Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft dark:divide-charcoal-700">
            {analytics.pageViewsSummary.map((route) => (
              <tr key={route.path} className="hover:bg-cream-50 dark:hover:bg-charcoal-700/50 transition-colors">
                <td className="p-4 font-mono font-medium text-burgundy dark:text-cream">{route.path}</td>
                <td className="p-4 text-charcoal/85 dark:text-cream/85">{route.description}</td>
                <td className="p-4 text-right font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
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
