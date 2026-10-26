import React from 'react';
import { requireAdminPage } from '@/lib/auth-guard';
import { getAuditLogsList } from '@/lib/data-service';
import { ShieldAlert, ShieldCheck, Lock, Terminal, Clock } from 'lucide-react';

export default async function AdminSecurityPage() {
  await requireAdminPage();
  const logs = await getAuditLogsList(100);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-border-soft dark:border-charcoal-700">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-burgundy dark:text-cream">Security & Audit Stream</h1>
        <p className="text-xs font-mono text-charcoal/70 dark:text-cream/70 mt-1">
          IMMUTABLE ADMINISTRATIVE AUDIT TRAIL • SESSION REVOCATION & INCIDENT TRACING
        </p>
      </div>

      {/* Security Status Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-charcoal/70 dark:text-cream/70">
            <Lock className="w-3.5 h-3.5 text-rosegold-700 dark:text-rosegold" />
            <span>Hashing Algorithm</span>
          </div>
          <div className="text-lg font-serif font-bold text-burgundy dark:text-cream">Argon2id + Scrypt</div>
          <p className="text-[10px] font-mono text-charcoal/70 dark:text-cream/70">
            High memory cost, timing-safe equality
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-charcoal/70 dark:text-cream/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Session Protection</span>
          </div>
          <div className="text-lg font-serif font-bold text-burgundy dark:text-cream">HttpOnly Cookies</div>
          <p className="text-[10px] font-mono text-charcoal/70 dark:text-cream/70">
            SameSite=Lax • 7-day expiration
          </p>
        </div>

        <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-charcoal/70 dark:text-cream/70">
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            <span>Rate Limiting</span>
          </div>
          <div className="text-lg font-serif font-bold text-burgundy dark:text-cream">5 Attempts / 15m</div>
          <p className="text-[10px] font-mono text-charcoal/70 dark:text-cream/70">
            Active on auth & contact endpoints
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-border-soft dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-soft dark:border-charcoal-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-burgundy dark:text-cream">Recorded Security Events</h3>
          <span className="text-xs font-mono text-charcoal/70 dark:text-cream/70">{logs.length} events logged</span>
        </div>

        {logs.length > 0 ? (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-cream-100/70 dark:bg-charcoal-700 border-b border-border-soft dark:border-charcoal-600 text-charcoal/70 dark:text-cream/70 uppercase text-[10px]">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Metadata</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft dark:divide-charcoal-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700/50">
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                        log.action.includes('SUCCESS')
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : log.action.includes('FAILED')
                          ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                          : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal/80 dark:text-cream/80 border border-border-soft dark:border-charcoal-600'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-charcoal/80 dark:text-cream/80">{log.entityType || '—'}</td>
                  <td className="p-4 text-charcoal/80 dark:text-cream/80">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-4 text-charcoal/80 dark:text-cream/80 truncate max-w-xs">{log.metadata || '—'}</td>
                  <td className="p-4 text-right text-charcoal/80 dark:text-cream/80">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-charcoal/70 text-xs font-mono">
            No audit records recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
