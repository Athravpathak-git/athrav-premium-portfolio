import React from 'react';
import { requireAdminPage } from '@/lib/auth-guard';
import { getAuditLogsList } from '@/lib/data-service';
import { ShieldAlert, ShieldCheck, Lock, Terminal, Clock } from 'lucide-react';

export default async function AdminSecurityPage() {
  await requireAdminPage();
  const logs = await getAuditLogsList(100);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-white">Security & Audit Stream</h1>
        <p className="text-xs font-mono text-zinc-400 mt-1">
          IMMUTABLE ADMINISTRATIVE AUDIT TRAIL • SESSION REVOCATION & INCIDENT TRACING
        </p>
      </div>

      {/* Security Status Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-silver-300" />
            <span>Hashing Algorithm</span>
          </div>
          <div className="text-lg font-bold text-white">Argon2id + Scrypt</div>
          <p className="text-[10px] font-mono text-zinc-400">
            High memory cost, timing-safe equality
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Session Protection</span>
          </div>
          <div className="text-lg font-bold text-white">HttpOnly Cookies</div>
          <p className="text-[10px] font-mono text-zinc-400">
            SameSite=Lax • 7-day expiration
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Rate Limiting</span>
          </div>
          <div className="text-lg font-bold text-white">5 Attempts / 15m</div>
          <p className="text-[10px] font-mono text-zinc-400">
            Active on auth & contact endpoints
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/70 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recorded Security Events</h3>
          <span className="text-xs font-mono text-zinc-400">{logs.length} events logged</span>
        </div>

        {logs.length > 0 ? (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/60 border-b border-white/10 text-zinc-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Metadata</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/30">
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                        log.action.includes('SUCCESS')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.action.includes('FAILED')
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-zinc-800 text-silver-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400">{log.entityType || '—'}</td>
                  <td className="p-4 text-zinc-400">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-4 text-zinc-400 truncate max-w-xs">{log.metadata || '—'}</td>
                  <td className="p-4 text-right text-zinc-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-zinc-400 text-xs font-mono">
            No audit records recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
