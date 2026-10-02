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
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Công việc đã lưu
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lưu lại các vị trí phù hợp để xem xét và nộp đơn ứng tuyển khi sẵn sàng.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải việc đã lưu...</div>
      ) : saved.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Chưa có công việc nào được lưu
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nhấn vào biểu tượng bookmark trên các tin tuyển dụng để lưu vào danh sách này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saved.map((item) => (
            <div
              key={item.jobId}
              className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Building className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4
                        onClick={() => onSelectJob(item.job)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 cursor-pointer"
                      >
                        {item.job.title}
                      </h4>
                      <p className="text-xs text-slate-500">{item.job.company.name}</p>
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

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    {formatSalary(item.job.salaryMin, item.job.salaryMax)}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.job.location}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                    {item.job.level}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectJob(item.job)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                >
                  Xem & Ứng tuyển ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
