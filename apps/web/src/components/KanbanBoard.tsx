'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Award,
  Zap,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { ApplicantDetailDrawer } from './ApplicantDetailDrawer';

interface ColumnDef {
  id: string;
  title: string;
  dotColor: string;
  badgeBg: string;
  borderColor: string;
  glowClass: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'APPLIED',
    title: 'Hồ sơ mới nộp',
    dotColor: 'bg-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500/30',
    glowClass: 'shadow-blue-500/10',
  },
  {
    id: 'SCREENING',
    title: 'Sơ tuyển & Duyệt',
    dotColor: 'bg-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    glowClass: 'shadow-indigo-500/10',
  },
  {
    id: 'INTERVIEW',
    title: 'Vòng Phỏng vấn',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500/30',
    glowClass: 'shadow-amber-500/10',
  },
  {
    id: 'OFFER',
    title: 'Đề nghị (Offer)',
    dotColor: 'bg-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderColor: 'border-purple-500/30',
    glowClass: 'shadow-purple-500/10',
  },
  {
    id: 'HIRED',
    title: 'Tuyển dụng thành công',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    glowClass: 'shadow-emerald-500/10',
  },
  {
    id: 'REJECTED',
    title: 'Từ chối / Lưu trữ',
    dotColor: 'bg-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderColor: 'border-rose-500/30',
    glowClass: 'shadow-rose-500/10',
  },
];

function getInitials(name: string) {
  if (!name) return 'CV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-violet-600 to-purple-600',
    'from-amber-600 to-orange-600',
    'from-cyan-600 to-blue-600',
    'from-rose-600 to-pink-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function KanbanBoard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const loadData = useCallback(async () => {
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
  }, [selectedJobId]);

  useEffect(() => {
    loadData();
  }, [loadData, user]);

  // Filtered applications based on search query and minimum match score
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = app.candidate?.fullName?.toLowerCase().includes(q);
        const headlineMatch = app.candidate?.headline?.toLowerCase().includes(q);
        const jobMatch = app.job?.title?.toLowerCase().includes(q);
        if (!nameMatch && !headlineMatch && !jobMatch) return false;
      }
      if (minMatchFilter > 0) {
        const score = app.matchScore?.score || 0;
        if (score < minMatchFilter) return false;
      }
      return true;
    });
  }, [applications, searchQuery, minMatchFilter]);

  // Funnel analytics
  const totalApps = applications.length;
  const screeningCount = applications.filter((a) => a.status === 'SCREENING').length;
  const interviewCount = applications.filter((a) => a.status === 'INTERVIEW').length;
  const offerCount = applications.filter((a) => a.status === 'OFFER' || a.status === 'HIRED').length;
  const hiredCount = applications.filter((a) => a.status === 'HIRED').length;
  const interviewRate = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;
  const offerConversion = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ATS Header & Workstation Control Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface/90 backdrop-blur-xl p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                {user?.company?.name || 'Enterprise Recruiter'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono tracking-tight">
                Tenant Isolation • STAR Audit Log
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5">
              Quy trình Theo dõi Tuyển dụng (ATS Pipeline)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Quản lý ứng viên qua từng chặng tuyển dụng với gợi ý độ khớp kỹ năng STAR khách quan và bảo vệ dữ liệu.
            </p>
          </div>

          {/* Action & View Mode Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Job Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-obsidian-card px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">Tất cả vị trí ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j._count?.applications || 0} hồ sơ)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Match Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-obsidian-card p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setMinMatchFilter(0)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                  minMatchFilter === 0
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setMinMatchFilter(70)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition flex items-center space-x-1 ${
                  minMatchFilter === 70
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
                ≥70% Khớp
              </button>
            </div>

            {/* Kanban / Table Toggle */}
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700/80 p-1 bg-slate-100 dark:bg-obsidian-card">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Bảng Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Danh sách Bảng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Realtime Search inside ATS */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lọc tên ứng viên, vị trí tuyển dụng..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Hiển thị <span className="font-bold text-slate-700 dark:text-slate-200">{filteredApps.length}</span> / {totalApps} ứng viên
          </div>
        </div>
      </div>

      {/* Recruitment Funnel Metric Cards (Ashby / Linear Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Tổng tiếp nhận</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {totalApps}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Sơ loại: <strong className="text-slate-800 dark:text-slate-200">{screeningCount}</strong> hồ sơ</span>
          </div>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Đang Phỏng vấn</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {interviewCount}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-amber-600/80 dark:text-amber-400/80">
            <span>Tỷ lệ lọt phỏng vấn: <strong>{interviewRate}%</strong></span>
          </div>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Đề nghị & Tuyển chọn</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
            {offerCount}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-purple-600/80 dark:text-purple-400/80">
            <span>Chuyển đổi từ PV: <strong>{offerConversion}%</strong></span>
          </div>
        </div>

        <div className="relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium">Gia nhập (Hired)</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {hiredCount}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
            <span>Đã hoàn tất onboarding</span>
          </div>
        </div>
      </div>

      {/* Main View: Linear-grade Kanban or High-density Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-slate-50/80 dark:bg-obsidian-surface/60 border border-slate-200 dark:border-slate-800/80 p-3 min-w-[240px] max-w-full backdrop-blur-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shadow-xs`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {col.title}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${col.badgeBg} tabular-nums`}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards Stream */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] p-0.5 custom-scrollbar">
                  {colApps.map((a) => {
                    const matchScore = a.matchScore?.score;
                    const initials = getInitials(a.candidate?.fullName || '');
                    const avatarGradient = getAvatarColor(a.candidate?.fullName || 'User');

                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedAppId(a.id);
                          setIsDrawerOpen(true);
                        }}
                        className="group relative rounded-xl p-3.5 bg-white dark:bg-obsidian-card border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
                      >
                        {/* Candidate Identity */}
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {a.candidate?.fullName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {a.candidate?.headline || 'Ứng viên'}
                            </p>
                          </div>
                        </div>

                        {/* Applied Job Tag */}
                        <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-300 truncate bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 font-mono text-[10px]">Vị trí: </span>
                          <span className="font-semibold">{a.job?.title}</span>
                        </div>

                        {/* Badges & Telemetry Bar */}
                        <div className="mt-3 flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          {matchScore != null ? (
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                matchScore >= 80
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                                  : matchScore >= 50
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Sparkles className="w-2.5 h-2.5 mr-1" />
                              Khớp {matchScore}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">Đang quét AI...</span>
                          )}

                          {a.interviews?.length > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50">
                              <Calendar className="w-2.5 h-2.5 mr-1" />
                              Round {a.interviews[0].round}
                            </span>
                          )}
                        </div>

                        {/* Footer timestamps & Notes count */}
                        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{new Date(a.appliedAt).toLocaleDateString('vi-VN')}</span>
                          {a._count?.notes > 0 && (
                            <span className="text-slate-500 font-medium">{a._count.notes} ghi chú</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="py-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 p-4">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 flex items-center justify-center mx-auto mb-1 text-xs">
                        0
                      </div>
                      <p className="text-[11px] text-slate-400 italic">Không có hồ sơ</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-density Table View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Ứng viên</th>
                  <th className="p-4 font-semibold">Vị trí ứng tuyển</th>
                  <th className="p-4 font-semibold">Trạng thái chặng</th>
                  <th className="p-4 font-semibold">Khớp kỹ năng STAR</th>
                  <th className="p-4 font-semibold">Ngày nộp hồ sơ</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredApps.map((a) => {
                  const matchScore = a.matchScore?.score;
                  const initials = getInitials(a.candidate?.fullName || '');
                  const avatarGradient = getAvatarColor(a.candidate?.fullName || 'User');
                  const colConfig = COLUMNS.find((c) => c.id === a.status);

                  return (
                    <tr
                      key={a.id}
                      onClick={() => {
                        setSelectedAppId(a.id);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {a.candidate?.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {a.candidate?.headline || 'Chưa cập nhật tiêu đề'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                        {a.job?.title}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                            colConfig?.badgeBg || 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${colConfig?.dotColor || 'bg-slate-400'}`} />
                          {colConfig?.title || a.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">
                        {matchScore != null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                              matchScore >= 80
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                                : matchScore >= 50
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                            }`}
                          >
                            {matchScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {new Date(a.appliedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          Chi tiết hồ sơ <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
