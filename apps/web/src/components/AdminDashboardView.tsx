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
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Bảng điều khiển Quản trị & Nhật ký Kiểm toán (Audit Logs)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi toàn vẹn hệ thống, tuân thủ Luật Bảo vệ dữ liệu cá nhân Việt Nam 2026 và kiểm soát quyền truy cập.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Người dùng</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats?.totalUsers || 0}
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Ứng viên</span>
          <div className="text-2xl font-black text-brand-600 mt-1">
            {stats?.totalCandidates || 0}
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Công ty</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {stats?.totalCompanies || 0}
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tin tuyển dụng</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats?.totalJobs || 0}
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Đơn ứng tuyển</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {stats?.totalApplications || 0}
          </div>
        </div>
      </div>

      {/* Live Security Audit Trail */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 text-indigo-600 mr-2" />
            Nhật ký kiểm toán an ninh (Audit Trail)
          </h3>
          <span className="text-xs text-slate-400">Ghi nhận mọi truy cập và chuyển trạng thái</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 font-bold">Thời gian</th>
                <th className="p-3 font-bold">Người thực hiện</th>
                <th className="p-3 font-bold">Hành động (Action)</th>
                <th className="p-3 font-bold">Đối tượng (Entity)</th>
                <th className="p-3 font-bold">Chi tiết / ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recentAudits?.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-slate-400">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.actor?.email || 'System'}
                    </span>
                    {log.actor?.role && (
                      <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {log.actor.role}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                        log.action.includes('DOWNLOAD')
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : log.action.includes('TRANSITION')
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
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
