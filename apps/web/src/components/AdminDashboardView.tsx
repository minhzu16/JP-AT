'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building,
  Briefcase,
  FileCheck,
  History,
  Activity,
  Lock,
} from 'lucide-react';
import { fetchApi } from '../lib/api';

export function AdminDashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/dashboard')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Bảng điều khiển Quản trị & Nhật ký Kiểm toán (Audit Logs)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Theo dõi an toàn dữ liệu, tuân thủ Luật Bảo vệ dữ liệu cá nhân Việt Nam 91/2025/QH15 và ghi nhận vết truy cập.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Người dùng</span>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats?.totalUsers || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Ứng viên</span>
          <div className="text-2xl font-mono font-bold text-cobalt-600 dark:text-cobalt-400 mt-1 tabular-nums">
            {stats?.totalCandidates || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Công ty</span>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats?.totalCompanies || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Vị trí mở</span>
          <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {stats?.totalJobs || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Đơn nộp</span>
          <div className="text-2xl font-mono font-bold text-cobalt-600 dark:text-cobalt-400 mt-1 tabular-nums">
            {stats?.totalApplications || 0}
          </div>
        </div>
      </div>

      {/* Live Security Audit Trail */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Activity className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400 mr-2" />
            Nhật ký kiểm toán an ninh (Audit Trail)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Tenant Event Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="p-3 font-medium">Thời gian</th>
                <th className="p-3 font-medium">Người thực hiện</th>
                <th className="p-3 font-medium">Hành động</th>
                <th className="p-3 font-medium">Đối tượng</th>
                <th className="p-3 font-medium">Mã tham chiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recentAudits?.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {log.actor?.email || 'System'}
                    </span>
                    {log.actor?.role && (
                      <span className="text-[10px] font-mono ml-1.5 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                        {log.actor.role}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium ${
                        log.action.includes('DOWNLOAD')
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50'
                          : log.action.includes('TRANSITION')
                          ? 'bg-cobalt-50 text-cobalt-700 dark:bg-cobalt-950/60 dark:text-cobalt-300 border border-cobalt-200/50'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {log.entity}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {log.entityId ? log.entityId.slice(0, 16) + '...' : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
