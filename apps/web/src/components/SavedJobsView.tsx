'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Building, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { formatSalary } from './JobCard';

export function SavedJobsView({
  onSelectJob,
}: {
  onSelectJob: (job: any) => void;
}) {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchApi<any[]>('/me/saved-jobs')
      .then((data) => setSaved(data || []))
      .catch(() => setSaved([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnsave = async (jobId: string) => {
    try {
      await fetchApi(`/me/saved-jobs/${jobId}`, { method: 'DELETE' });
      setSaved((prev) => prev.filter((s) => s.jobId !== jobId));
    } catch (err: any) {
      alert(err.detail || 'Không thể bỏ lưu');
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Vị trí kỹ thuật đã lưu
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Danh mục các công việc đang quan tâm và chuẩn bị hồ sơ ứng tuyển.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải danh sách việc đã lưu...</div>
      ) : saved.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface text-center">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Chưa có công việc nào được lưu
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nhấn vào biểu tượng bookmark trên tin tuyển dụng để ghim vào danh sách theo dõi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saved.map((item) => (
            <div
              key={item.jobId}
              className="rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <Building className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4
                        onClick={() => onSelectJob(item.job)}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cobalt-600 dark:hover:text-cobalt-400 cursor-pointer transition-colors"
                      >
                        {item.job.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.job.company.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnsave(item.jobId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Bỏ lưu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2 py-0.5 rounded-md font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 tabular-nums font-medium">
                    {formatSalary(item.job.salaryMin, item.job.salaryMax)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                    {item.job.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                    {item.job.level}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectJob(item.job)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-cobalt-600 hover:bg-cobalt-700 text-white transition shadow-sm"
                >
                  Xem chi tiết & Nộp đơn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
