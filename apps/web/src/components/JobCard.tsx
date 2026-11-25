'use client';

import React from 'react';
import Image from 'next/image';
import {
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export interface JobItem {
  id: string;
  title: string;
  description: string;
  location: string;
  workMode: string;
  employmentType: string;
  level: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  status: string;
  publishedAt: string;
  company: {
    id: string;
    name: string;
    logoKey?: string | null;
  };
  skills: Array<{
    isRequired: boolean;
    weight: number;
    skill: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    applications: number;
  };
}

export function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return 'Thoả thuận';
  const formatM = (v: number) => `${(v / 1000000).toFixed(0)} tr`;
  if (min && max) return `${formatM(min)} - ${formatM(max)} VNĐ`;
  if (min) return `Từ ${formatM(min)} VNĐ`;
  if (max) return `Lên đến ${formatM(max)} VNĐ`;
  return 'Thoả thuận';
}

export function JobCard({
  job,
  isSelected = false,
  isSaved,
  hasApplied,
  appliedStatus,
  onSelect,
  onToggleSave,
  onCheckAiMatch,
}: {
  job: JobItem;
  isSelected?: boolean;
  isSaved: boolean;
  hasApplied: boolean;
  appliedStatus?: string;
  onSelect: (job: JobItem) => void;
  onToggleSave: (jobId: string, current: boolean) => void;
  onCheckAiMatch?: (job: JobItem) => void;
}) {
  const { user } = useAuth();

  return (
    <div
      onClick={() => onSelect(job)}
      className={`group relative rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'glass-card-active'
          : 'glass-card'
      }`}
    >
      {/* Left indicator bar for active selection */}
      {isSelected && (
        <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-gradient-to-b from-blue-600 via-indigo-600 to-violet-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
      )}

      {/* Top Header: Company logo & Bookmarking */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.1] flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm group-hover:scale-105 transition-transform">
            {job.company.logoKey ? (
              <Image
                src={job.company.logoKey}
                alt={job.company.name}
                width={44}
                height={44}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600/10 to-indigo-600/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm font-mono">
                {job.company.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors flex items-center gap-1.5">
              <span>{job.title}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-blue-600 dark:text-blue-400 shrink-0" />
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
              <span>{job.company.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[11px] text-slate-400 font-mono">{job.workMode}</span>
            </p>
          </div>
        </div>

        {user?.role === 'CANDIDATE' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job.id, isSaved);
            }}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Bỏ lưu việc làm ${job.title}` : `Lưu việc làm ${job.title}`}
            className={`p-2 rounded-xl border transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
            }`}
            title={isSaved ? 'Bỏ lưu' : 'Lưu tin tuyển dụng'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Badges: Salary, Location, Level */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 tabular-nums shadow-sm text-[11px]">
          <DollarSign className="w-3 h-3 mr-0.5 text-emerald-600 dark:text-emerald-400" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] text-[11px]">
          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
          {job.location}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] text-[11px] font-medium">
          {job.level}
        </span>
      </div>

      {/* Required Skills Chips */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {job.skills.slice(0, 4).map((s) => (
          <span
            key={s.skill.id}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${
              s.isRequired
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60'
                : 'bg-slate-100/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.05]'
            }`}
          >
            {s.skill.name}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-400">
            +{job.skills.length - 4}
          </span>
        )}
      </div>

      {/* Footer Info & Status */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-mono flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(job.publishedAt).toLocaleDateString('vi-VN')}
        </span>

        <div className="flex items-center space-x-2">
          {user?.role === 'CANDIDATE' && onCheckAiMatch && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheckAiMatch(job);
              }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>So khớp AI</span>
            </button>
          )}

          {hasApplied && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-sm">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              Đã nộp
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
