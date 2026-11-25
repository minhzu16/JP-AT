'use client';

import React from 'react';
import { Sparkles, LayoutGrid, ListFilter, Search } from 'lucide-react';
import { JobItem } from './constants';

export interface KanbanHeaderProps {
  companyName?: string;
  jobs: JobItem[];
  selectedJobId: string;
  onSelectJobId: (jobId: string) => void;
  minMatchFilter: number;
  onSelectMinMatchFilter: (filter: number) => void;
  viewMode: 'kanban' | 'table';
  onSelectViewMode: (mode: 'kanban' | 'table') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function KanbanHeader({
  companyName,
  jobs,
  selectedJobId,
  onSelectJobId,
  minMatchFilter,
  onSelectMinMatchFilter,
  viewMode,
  onSelectViewMode,
  searchQuery,
  onSearchQueryChange,
  filteredCount,
  totalCount,
}: KanbanHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface/90 backdrop-blur-xl p-6 shadow-sm">
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
              {companyName || 'Enterprise Recruiter'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tracking-tight">
              Tenant Isolation • STAR Audit Log
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5">
            Quy trình Theo dõi Tuyển dụng (ATS Pipeline)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Quản lý ứng viên qua từng chặng tuyển dụng với gợi ý độ khớp kỹ năng STAR khách quan và bảo vệ dữ liệu.
          </p>
        </div>

        {/* Action & View Mode Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => onSelectJobId(e.target.value)}
              className="text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-obsidian-card px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            >
              <option value="">Tất cả vị trí ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j._count?.applications || 0} hồ sơ)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Match Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-obsidian-card p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => onSelectMinMatchFilter(0)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                minMatchFilter === 0
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => onSelectMinMatchFilter(70)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition flex items-center space-x-1 ${
                minMatchFilter === 70
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
              ≥70% Khớp
            </button>
          </div>

          {/* Kanban / Table Toggle */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700/80 p-1 bg-slate-100 dark:bg-obsidian-card">
            <button
              onClick={() => onSelectViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bảng Kanban</span>
            </button>
            <button
              onClick={() => onSelectViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Danh sách Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realtime Search inside ATS */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Lọc tên ứng viên, vị trí tuyển dụng..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Hiển thị <span className="font-bold text-slate-700 dark:text-slate-200">{filteredCount}</span> / {totalCount} ứng viên
        </div>
      </div>
    </div>
  );
}
