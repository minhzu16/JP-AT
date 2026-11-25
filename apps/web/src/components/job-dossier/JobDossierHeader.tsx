'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Send,
  Sparkles,
  Bookmark,
  Share2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { JobItem, formatSalary } from '../JobCard';

interface JobDossierHeaderProps {
  job: JobItem;
  userRole?: string;
  hasApplied: boolean;
  appliedStatus?: string;
  isSaved?: boolean;
  showApplyTray: boolean;
  copiedLink: boolean;
  onToggleSave: (jobId: string, current: boolean) => void;
  onToggleApplyTray: () => void;
  onOpenAiMatch: (job: JobItem) => void;
  onCopyLink: () => void;
}

export function JobDossierHeader({
  job,
  userRole,
  hasApplied,
  appliedStatus,
  isSaved,
  showApplyTray,
  copiedLink,
  onToggleSave,
  onToggleApplyTray,
  onOpenAiMatch,
  onCopyLink,
}: JobDossierHeaderProps) {
  return (
    <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-white/[0.06] relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.1] flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            {job.company.logoKey ? (
              <Image
                src={job.company.logoKey}
                alt={job.company.name}
                width={56}
                height={56}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-lg font-mono">
                {job.company.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {job.company.name}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                Doanh nghiệp xác thực
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {job.title}
            </h2>
          </div>
        </div>

        {/* Top Actions: Bookmark & Share */}
        <div className="flex items-center space-x-2 shrink-0">
          {userRole === 'CANDIDATE' && (
            <button
              onClick={() => onToggleSave(job.id, !!isSaved)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              }`}
              title={isSaved ? 'Bỏ lưu' : 'Lưu tin'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
          <button
            onClick={onCopyLink}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
            title="Sao chép đường dẫn"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Technical Role Metric Cards */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block font-mono">Thu nhập đề xuất</span>
          <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block tabular-nums">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block font-mono">Địa điểm</span>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
            {job.location}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block font-mono">Mô hình</span>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
            {job.workMode} • {job.employmentType}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block font-mono">Cấp bậc</span>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
            {job.level}
          </span>
        </div>
      </div>

      {/* Primary Action Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          {hasApplied ? (
            <div className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              <span>Đã nộp đơn ({appliedStatus || 'APPLIED'})</span>
            </div>
          ) : userRole === 'CANDIDATE' ? (
            <button
              onClick={onToggleApplyTray}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{showApplyTray ? 'Thu gọn đơn' : 'Nộp đơn ngay'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-mono italic">
              (Đăng nhập tài khoản Ứng viên để nộp đơn trực tiếp)
            </span>
          )}

          {userRole === 'CANDIDATE' && (
            <button
              onClick={() => onOpenAiMatch(job)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-500/30 dark:border-blue-400/30 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>So khớp năng lực AI</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Đăng ngày: {new Date(job.publishedAt).toLocaleDateString('vi-VN')}
        </div>
      </div>

      {copiedLink && (
        <div className="mt-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>Đã sao chép liên kết vào clipboard!</span>
        </div>
      )}
    </div>
  );
}
