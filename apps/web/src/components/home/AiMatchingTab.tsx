'use client';

import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { JobItem } from '../JobCard';

interface AiMatchingTabProps {
  jobs: JobItem[];
  onSelectJobForMatch: (job: JobItem) => void;
}

export function AiMatchingTab({ jobs, onSelectJobForMatch }: AiMatchingTabProps) {
  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cobalt-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              So khớp Kỹ năng & Khuyến nghị Hồ sơ Khách quan (AI)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hệ thống đánh giá độ khớp theo mô hình STAR, loại trừ thiên lệch và tuân thủ chuẩn mực EU AI Act.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelectJobForMatch(job)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface p-4 cursor-pointer hover:border-cobalt-500 transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cobalt-600">
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {job.company.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {job.skills.map((s) => (
                  <span
                    key={s.skill.id}
                    className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 font-medium"
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-cobalt-600 dark:text-cobalt-400">
              <span>Xem báo cáo chẩn đoán</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
