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
  isSaved,
  hasApplied,
  appliedStatus,
  onSelect,
  onToggleSave,
  onCheckAiMatch,
}: {
  job: JobItem;
  isSaved: boolean;
  hasApplied: boolean;
  appliedStatus?: string;
  onSelect: (job: JobItem) => void;
  onToggleSave: (jobId: string, current: boolean) => void;
  onCheckAiMatch?: (job: JobItem) => void;
}) {
  const { user } = useAuth();

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-brand-500/50 hover:shadow-lg transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Company logo & Bookmarking */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0">
              {job.company.logoKey ? (
                <img
                  src={job.company.logoKey}
                  alt={job.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h3
                onClick={() => onSelect(job)}
                className="text-base font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer line-clamp-1 transition-colors"
              >
                {job.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {job.company.name}
              </p>
            </div>
          </div>

          {user?.role === 'CANDIDATE' && (
            <button
              onClick={() => onToggleSave(job.id, isSaved)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={isSaved ? 'Bỏ lưu' : 'Lưu tin tuyển dụng'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>

        {/* Badges: Salary, Location, WorkMode, Level */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            <DollarSign className="w-3.5 h-3.5 mr-0.5" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {job.workMode}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {job.level}
          </span>
        </div>

        {/* Required Skills Chips */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s.skill.id}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                s.isRequired
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {s.skill.name}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(job.publishedAt).toLocaleDateString('vi-VN')}
        </span>

        <div className="flex items-center space-x-2">
          {user?.role === 'CANDIDATE' && onCheckAiMatch && (
            <button
              onClick={() => onCheckAiMatch(job)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition flex items-center space-x-1"
              title="So khớp kỹ năng và gợi ý AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match</span>
            </button>
          )}

          {hasApplied ? (
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Đã nộp ({appliedStatus || 'APPLIED'})</span>
            </div>
          ) : (
            <button
              onClick={() => onSelect(job)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
            >
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
