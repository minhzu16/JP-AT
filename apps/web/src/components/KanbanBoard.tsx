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
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { ApplicantDetailDrawer } from './ApplicantDetailDrawer';

const COLUMNS = [
  { id: 'APPLIED', title: 'Ứng tuyển mới', color: 'border-cobalt-500' },
  { id: 'SCREENING', title: 'Sơ loại hồ sơ', color: 'border-slate-500' },
  { id: 'INTERVIEW', title: 'Phỏng vấn', color: 'border-amber-500' },
  { id: 'OFFER', title: 'Đề nghị (Offer)', color: 'border-purple-500' },
  { id: 'HIRED', title: 'Đã tuyển dụng', color: 'border-emerald-500' },
  { id: 'REJECTED', title: 'Từ chối', color: 'border-rose-500' },
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

  // Stage funnel statistics
  const totalApps = applications.length;
  const interviewCount = applications.filter((a) => a.status === 'INTERVIEW').length;
  const offerCount = applications.filter((a) => a.status === 'OFFER' || a.status === 'HIRED').length;
  const interviewRate = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Recruiter Header & Job Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              {user?.company?.name || 'Doanh nghiệp'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              [Tenant RBAC Isolation Active]
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Hệ thống Theo dõi Tuyển dụng (ATS Pipeline)
          </h2>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Job Filter Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-obsidian-card px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
          >
            <option value="">Tất cả vị trí ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j._count?.applications || 0} hồ sơ)
              </option>
            ))}
          </select>

          {/* Toggle View */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-obsidian-card">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment Funnel Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Tổng hồ sơ ứng tuyển</span>
          <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5 block tabular-nums">
            {totalApps}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Đang phỏng vấn</span>
          <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 block tabular-nums">
            {interviewCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Đã gửi Offer / Tuyển dụng</span>
          <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block tabular-nums">
            {offerCount}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">Tỷ lệ tiến vào Phỏng vấn</span>
          <span className="text-2xl font-mono font-bold text-cobalt-600 dark:text-cobalt-400 mt-0.5 block tabular-nums">
            {interviewRate}%
          </span>
        </div>
      </div>

      {/* Kanban Board Columns View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-xl bg-slate-50/70 dark:bg-obsidian-card/60 border border-slate-200 dark:border-slate-800 p-2.5 min-w-[230px]"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between px-2 py-2 mb-2 border-b-2 ${col.color}`}>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {col.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded font-mono text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 tabular-nums">
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards in Column */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[66vh] p-0.5">
                  {colApps.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedAppId(a.id);
                        setIsDrawerOpen(true);
                      }}
                      className="rounded-lg p-3 bg-white dark:bg-obsidian-surface border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer shadow-xs transition group"
                    >
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                        {a.candidate.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {a.candidate.headline || 'Ứng viên kỹ thuật'}
                      </p>

                      <div className="text-[11px] text-slate-400 mt-2 truncate">
                        Vị trí: <span className="font-medium text-slate-700 dark:text-slate-300">{a.job.title}</span>
                      </div>

                      {/* Advisory Match Score */}
                      {a.matchScore && (
                        <div className="mt-2.5 flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                              a.matchScore.score >= 80
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50'
                                : a.matchScore.score >= 50
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Khớp: {a.matchScore.score}%
                          </span>

                          {a.interviews?.length > 0 && (
                            <span className="text-[10px] font-mono font-medium text-cobalt-600 dark:text-cobalt-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-0.5" />
                              Round {a.interviews[0].round}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>{new Date(a.appliedAt).toLocaleDateString('vi-VN')}</span>
                        {a._count?.notes > 0 && (
                          <span>{a._count.notes} ghi chú</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-slate-400 italic">
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
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="p-3.5 font-medium">Ứng viên</th>
                <th className="p-3.5 font-medium">Vị trí</th>
                <th className="p-3.5 font-medium">Trạng thái</th>
                <th className="p-3.5 font-medium">Độ khớp kỹ năng</th>
                <th className="p-3.5 font-medium">Ngày nộp</th>
                <th className="p-3.5 font-medium text-right">Chi tiết</th>
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
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <td className="p-3.5 font-semibold">
                    <div>{a.candidate.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{a.candidate.headline}</div>
                  </td>
                  <td className="p-3.5">{a.job.title}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">
                    {a.matchScore ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{a.matchScore.score}%</span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {new Date(a.appliedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-3.5 text-right font-medium text-cobalt-600 dark:text-cobalt-400">
                    Mở hồ sơ →
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
