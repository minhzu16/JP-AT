'use client';

import React from 'react';
import { Users, Calendar, UserCheck, Award } from 'lucide-react';

export interface KanbanMetricsProps {
  totalApps: number;
  screeningCount: number;
  interviewCount: number;
  interviewRate: number;
  offerCount: number;
  offerConversion: number;
  hiredCount: number;
}

export function KanbanMetrics({
  totalApps,
  screeningCount,
  interviewCount,
  interviewRate,
  offerCount,
  offerConversion,
  hiredCount,
}: KanbanMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Tổng tiếp nhận</span>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {totalApps}
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>Sơ loại: <strong className="text-slate-800 dark:text-slate-200">{screeningCount}</strong> hồ sơ</span>
        </div>
      </div>

      <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Đang Phỏng vấn</span>
          <Calendar className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-3xl font-mono font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
          {interviewCount}
        </div>
        <div className="mt-1 flex items-center text-[11px] text-amber-600/80 dark:text-amber-400/80">
          <span>Tỷ lệ lọt phỏng vấn: <strong>{interviewRate}%</strong></span>
        </div>
      </div>

      <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Đề nghị & Tuyển chọn</span>
          <UserCheck className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-3xl font-mono font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
          {offerCount}
        </div>
        <div className="mt-1 flex items-center text-[11px] text-purple-600/80 dark:text-purple-400/80">
          <span>Chuyển đổi từ PV: <strong>{offerConversion}%</strong></span>
        </div>
      </div>

      <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Gia nhập (Hired)</span>
          <Award className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-3xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
          {hiredCount}
        </div>
        <div className="mt-1 flex items-center text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
          <span>Đã hoàn tất onboarding</span>
        </div>
      </div>
    </div>
  );
}
