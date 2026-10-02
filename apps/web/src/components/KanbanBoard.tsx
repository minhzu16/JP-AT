'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  LayoutGrid,
  ListFilter,
  Building,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { ApplicantDetailDrawer } from './ApplicantDetailDrawer';

const COLUMNS = [
  { id: 'APPLIED', title: 'Ứng tuyển mới', color: 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' },
  { id: 'SCREENING', title: 'Sơ loại hồ sơ', color: 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20' },
  { id: 'INTERVIEW', title: 'Phỏng vấn', color: 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20' },
  { id: 'OFFER', title: 'Đề nghị (Offer)', color: 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20' },
  { id: 'HIRED', title: 'Đã tuyển dụng', color: 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' },
  { id: 'REJECTED', title: 'Từ chối', color: 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20' },
];

export function KanbanBoard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetchApi<any[]>('/jobs/recruiter/my-jobs'),
        fetchApi<any[]>(`/recruiter/applications${selectedJobId ? `?jobId=${selectedJobId}` : ''}`),
      ]);
      setJobs(jobsRes || []);
      setApplications(appsRes || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJobId, user]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase">
              {user?.company?.name || 'Công ty của bạn'}
            </span>
            <span className="text-xs text-slate-400">
              (Ràng buộc phân quyền: Chỉ hiển thị ứng viên nộp vào tin của công ty này)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Quy trình tuyển dụng (ATS Pipeline)
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Job Filter Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả tin tuyển dụng ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j._count?.applications || 0} đơn)
              </option>
            ))}
          </select>

          {/* Toggle View */}
          <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-3xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-3 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2 border-b-2 border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {col.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm">
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[68vh] p-1">
                  {colApps.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedAppId(a.id);
                        setIsDrawerOpen(true);
                      }}
                      className="glass-card rounded-2xl p-4 cursor-pointer hover:border-brand-500 hover:shadow-md transition-all group"
                    >
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                        {a.candidate.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {a.candidate.headline || 'Ứng viên'}
                      </p>

                      <div className="text-[11px] font-medium text-slate-400 mt-2 line-clamp-1">
                        Ứng tuyển: <span className="font-semibold text-slate-600 dark:text-slate-300">{a.job.title}</span>
                      </div>

                      {/* Advisory Match Score */}
                      {a.matchScore && (
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              a.matchScore.score >= 80
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : a.matchScore.score >= 50
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Khớp kỹ năng: {a.matchScore.score}%
                          </span>

                          {a.interviews?.length > 0 && (
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-0.5" />
                              R{a.interviews[0].round}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>{new Date(a.appliedAt).toLocaleDateString('vi-VN')}</span>
                        {a._count?.notes > 0 && (
                          <span>{a._count.notes} ghi chú</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-bold">Ứng viên</th>
                <th className="p-4 font-bold">Vị trí ứng tuyển</th>
                <th className="p-4 font-bold">Trạng thái</th>
                <th className="p-4 font-bold">Độ khớp kỹ năng (Advisory)</th>
                <th className="p-4 font-bold">Ngày nộp</th>
                <th className="p-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {applications.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => {
                    setSelectedAppId(a.id);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="p-4 font-semibold">
                    <div>{a.candidate.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{a.candidate.headline}</div>
                  </td>
                  <td className="p-4">{a.job.title}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {a.matchScore ? (
                      <span className="font-bold text-amber-600">{a.matchScore.score}%</span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(a.appliedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1 text-xs font-semibold text-brand-600 hover:underline">
                      Xem chi tiết →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant Detail Drawer */}
      <ApplicantDetailDrawer
        applicationId={selectedAppId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={loadData}
      />
    </div>
  );
}
