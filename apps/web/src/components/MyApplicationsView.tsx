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
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Đơn ứng tuyển của tôi
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi tiến độ xét duyệt hồ sơ, lịch phỏng vấn và trạng thái ứng tuyển của bạn.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải danh sách đơn...</div>
      ) : applications.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Bạn chưa nộp đơn vào vị trí nào
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Khám phá các tin tuyển dụng hấp dẫn ở tab "Tìm việc làm" và gửi hồ sơ ngay!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4"
            >
              {/* Job info header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Building className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {app.job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {app.job.company.name} • {app.job.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    Trạng thái: {app.status}
                  </span>

                  {app.status !== 'WITHDRAWN' && app.status !== 'HIRED' && app.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-rose-200 dark:border-rose-900"
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
