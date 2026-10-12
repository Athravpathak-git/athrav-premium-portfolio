'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('');

  const fetchLogs = async (page = 1, action = '') => {
    setLoading(true);
    try {
      const url = `/api/admin/audit-logs?page=${page}&limit=25${
        action ? `&action=${encodeURIComponent(action)}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page, selectedAction);
  }, [pagination.page, selectedAction]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
            <span>Security Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable administrative action trails with IP tracking and redacted metadata.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none"
          >
            <option value="" className="bg-[#0c0d14]">All Action Events</option>
            <option value="LOGIN_SUCCESS" className="bg-[#0c0d14]">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED" className="bg-[#0c0d14]">LOGIN_FAILED</option>
            <option value="PASSWORD_CHANGED" className="bg-[#0c0d14]">PASSWORD_CHANGED</option>
            <option value="PROJECT_CREATED" className="bg-[#0c0d14]">PROJECT_CREATED</option>
            <option value="PROJECT_UPDATED" className="bg-[#0c0d14]">PROJECT_UPDATED</option>
            <option value="PROJECT_DELETED" className="bg-[#0c0d14]">PROJECT_DELETED</option>
            <option value="FILE_UPLOADED" className="bg-[#0c0d14]">FILE_UPLOADED</option>
          </select>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400">
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Action Event</th>
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">IP Address</th>
                    <th className="pb-3 font-medium">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.action.includes('FAILED') || log.action.includes('DELETED')
                              ? 'bg-red-500/15 text-red-400'
                              : log.action.includes('SUCCESS') || log.action.includes('BOOTSTRAP')
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-sky-500/15 text-sky-400'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-300 text-[11px]">
                        {log.user?.username || 'system'}
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3 text-slate-400 text-[11px] max-w-xs truncate font-sans">
                        {log.metadata || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <p>
                Showing {logs.length} of {pagination.total} audit events
              </p>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1.5 rounded-lg glass-button disabled:opacity-30"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1.5 rounded-lg glass-button disabled:opacity-30"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-xs text-slate-400">
            No audit logs found matching the criteria.
          </div>
        )}
      </div>
    </div>
  );
}
