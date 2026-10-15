'use client';

import React from 'react';
import {
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Clock,
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
      className={`relative rounded-xl p-4 sm:p-5 cursor-pointer transition-all border ${
        isSelected
          ? 'bg-white dark:bg-obsidian-surface border-cobalt-600 dark:border-cobalt-500 shadow-sm ring-1 ring-cobalt-600/20 dark:ring-cobalt-500/20'
          : 'bg-white dark:bg-obsidian-surface border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Header: Company logo & Bookmarking */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
            {job.company.logoKey ? (
              <img
                src={job.company.logoKey}
                alt={job.company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cobalt-600 dark:hover:text-cobalt-400 line-clamp-1 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {job.company.name}
            </p>
          </div>
        </div>

        {user?.role === 'CANDIDATE' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job.id, isSaved);
            }}
            className={`p-1.5 rounded-lg border transition-all shrink-0 ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
            title={isSaved ? 'Bỏ lưu' : 'Lưu tin tuyển dụng'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>

      {/* Badges: Salary, Location, Mode, Level */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 tabular-nums">
          <DollarSign className="w-3 h-3 mr-0.5" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
          {job.location}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          {job.workMode}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          {job.level}
        </span>
      </div>

      {/* Required Skills Chips */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {job.skills.slice(0, 4).map((s) => (
          <span
            key={s.skill.id}
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
              s.isRequired
                ? 'bg-cobalt-50 dark:bg-cobalt-950/60 text-cobalt-700 dark:text-cobalt-300 border border-cobalt-200/70 dark:border-cobalt-800/60'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
            }`}
          >
            {s.skill.name}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-400">
            +{job.skills.length - 4}
          </span>
        )}
      </div>

      {/* Footer Info & Status */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
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
              className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Khớp AI</span>
            </button>
          )}

          {hasApplied && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Đã nộp
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
