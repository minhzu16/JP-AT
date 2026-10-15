'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { formatSalary } from './JobCard';

export function MyApplicationsView() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchApi<any[]>('/me/applications')
      .then((data) => setApplications(data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển này không? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await fetchApi(`/me/applications/${applicationId}/withdraw`, { method: 'POST' });
      loadData();
    } catch (err: any) {
      alert(err.detail || 'Không thể rút đơn');
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Tiến trình hồ sơ ứng tuyển của tôi
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Theo dõi minh bạch lịch phỏng vấn và các bước chuyển trạng thái hồ sơ trực tiếp từ ATS doanh nghiệp.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải danh sách hồ sơ...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface text-center">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Bạn chưa nộp đơn vào vị trí nào
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Khám phá các vị trí kỹ thuật đang tuyển dụng và gửi hồ sơ trực tiếp.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface space-y-3.5"
            >
              {/* Job info header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                    <Building className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {app.job.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {app.job.company.name} • {app.job.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {app.status}
                  </span>

                  {app.status !== 'WITHDRAWN' && app.status !== 'HIRED' && app.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-rose-200 dark:border-rose-900"
                    >
                      Rút đơn
                    </button>
                  )}
                </div>
              </div>

              {/* Scheduled Interview Alert */}
              {app.interviews?.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Lịch phỏng vấn đã được xác nhận (Vòng {app.interviews[0].round})
                  </div>
                  <div>
                    Thời gian: <span className="font-semibold">{new Date(app.interviews[0].scheduledAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div>
                    Hình thức: {app.interviews[0].mode} • Link/Địa chỉ: <a href={app.interviews[0].locationOrLink} target="_blank" rel="noreferrer" className="underline font-bold">{app.interviews[0].locationOrLink}</a>
                  </div>
                </div>
              )}

              {/* Status Timeline / History */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Tiến trình xét duyệt hồ sơ
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {app.history?.map((h: any, idx: number) => (
                    <React.Fragment key={h.id}>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        <span className="font-bold">{h.toStatus}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          {new Date(h.changedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {idx < app.history.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
