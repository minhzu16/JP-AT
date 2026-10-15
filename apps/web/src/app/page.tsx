'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { JobCard, JobItem } from '../components/JobCard';
import { JobDossier } from '../components/JobDossier';
import { JobDetailModal } from '../components/JobDetailModal';
import { AiSkillMatchModal } from '../components/AiSkillMatchModal';
import { KanbanBoard } from '../components/KanbanBoard';
import { MyApplicationsView } from '../components/MyApplicationsView';
import { SavedJobsView } from '../components/SavedJobsView';
import { ResumeManagerView } from '../components/ResumeManagerView';
import { RecruiterJobsView } from '../components/RecruiterJobsView';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { useAuth } from '../lib/auth-context';
import { fetchApi } from '../lib/api';
import {
  Search,
  MapPin,
  Filter,
  Sparkles,
  Briefcase,
  Building,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [level, setLevel] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');

  // Data state
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected job for Workstation Dual-Pane inspection
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Fallback modal state (e.g., from Saved Jobs)
  const [modalJob, setModalJob] = useState<JobItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // AI Match modal state
  const [aiMatchJob, setAiMatchJob] = useState<JobItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Fetch jobs and skills
  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.append('q', keyword);
    if (location) params.append('location', location);
    if (workMode) params.append('workMode', workMode);
    if (level) params.append('level', level);
    if (selectedSkillId) params.append('skillIds', selectedSkillId);

    fetchApi<{ items: JobItem[] }>(`/jobs?${params.toString()}`)
      .then((res) => {
        const items = res.items || [];
        setJobs(items);
        // Default select first job in workstation view if none selected or if selected is not in items
        if (items.length > 0) {
          setSelectedJob((prev) => {
            if (!prev) return items[0];
            const stillExists = items.find((j) => j.id === prev.id);
            return stillExists || items[0];
          });
        } else {
          setSelectedJob(null);
        }
      })
      .catch(() => {
        setJobs([]);
        setSelectedJob(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [keyword, location, workMode, level, selectedSkillId]);

  useEffect(() => {
    fetchApi<any[]>('/skills')
      .then((data) => setSkills(data || []))
      .catch(() => {});
  }, []);

  // Fetch candidate metadata (saved jobs and applications)
  const refreshCandidateData = () => {
    if (user?.role === 'CANDIDATE') {
      fetchApi<any[]>('/me/saved-jobs')
        .then((data) => {
          setSavedJobIds(new Set((data || []).map((s) => s.jobId)));
        })
        .catch(() => {});

      fetchApi<any[]>('/me/applications')
        .then((data) => {
          setMyApplications(data || []);
        })
        .catch(() => {});
    } else {
      setSavedJobIds(new Set());
      setMyApplications([]);
    }
  };

  useEffect(() => {
    refreshCandidateData();
  }, [user]);

  const handleToggleSave = async (jobId: string, current: boolean) => {
    try {
      if (current) {
        await fetchApi(`/me/saved-jobs/${jobId}`, { method: 'DELETE' });
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await fetchApi(`/me/saved-jobs/${jobId}`, { method: 'PUT' });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err: any) {
      alert(err.detail || 'Lỗi khi lưu việc');
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setWorkMode('');
    setLevel('');
    setSelectedSkillId('');
  };

  const hasActiveFilters = Boolean(
    keyword || location || workMode || level || selectedSkillId,
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-obsidian-base">
      {/* Precision Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: DUAL-PANE WORKSTATION - PUBLIC JOB DISCOVERY */}
        {activeTab === 'jobs' && (
          <div className="space-y-5">
            {/* Command & Filter Bar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface p-4 shadow-sm">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Search input */}
                <div className="flex-1 flex items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 focus-within:border-cobalt-500 focus-within:ring-1 focus-within:ring-cobalt-500 transition">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Chức danh, công nghệ kỹ thuật (React, NestJS, Go, Kubernetes)..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                  {keyword && (
                    <button
                      onClick={() => setKeyword('')}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Location dropdown */}
                  <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                    >
                      <option value="">Tất cả địa điểm</option>
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                  </div>

                  {/* Work Mode */}
                  <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-xs">
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                    >
                      <option value="">Hình thức</option>
                      <option value="ONSITE">Onsite</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>

                  {/* Level */}
                  <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-xs">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                    >
                      <option value="">Cấp bậc</option>
                      <option value="INTERN">Intern</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID">Middle</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xóa lọc</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Skills Quick Chips */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-mono text-slate-400 mr-1">Chuyên môn:</span>
                {skills.slice(0, 10).map((s) => {
                  const isSelected = selectedSkillId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSkillId(isSelected ? '' : s.id)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-cobalt-600 text-white'
                          : 'bg-slate-100 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workstation Header Info */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Kết quả tìm kiếm:
                </span>
                <span className="font-mono text-cobalt-600 dark:text-cobalt-400 font-bold tabular-nums">
                  {jobs.length} vị trí
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Workstation Mode • Dual-Pane Explorer
              </div>
            </div>

            {/* DUAL-PANE WORKSTATION LAYOUT */}
            {loading ? (
              <div className="py-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface text-center text-xs text-slate-400">
                Đang nạp dữ liệu vị trí kỹ thuật...
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface text-center">
                <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Không tìm thấy tin tuyển dụng phù hợp
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Thử xóa bớt bộ lọc hoặc tìm với từ khóa công nghệ khác.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT PANE: High-density Job Cards List (~42% desktop width) */}
                <div
                  className={`lg:col-span-5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 ${
                    mobileDetailOpen ? 'hidden lg:block' : 'block'
                  }`}
                >
                  {jobs.map((job) => {
                    const appliedApp = myApplications.find((a) => a.jobId === job.id);
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSelected={isSelected}
                        isSaved={savedJobIds.has(job.id)}
                        hasApplied={!!appliedApp}
                        appliedStatus={appliedApp?.status}
                        onSelect={(j) => {
                          setSelectedJob(j);
                          setMobileDetailOpen(true);
                        }}
                        onToggleSave={handleToggleSave}
                        onCheckAiMatch={(j) => {
                          setAiMatchJob(j);
                          setIsAiModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>

                {/* RIGHT PANE: Sticky Job Dossier (~58% desktop width) */}
                <div
                  className={`lg:col-span-7 sticky top-20 ${
                    mobileDetailOpen ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <JobDossier
                    job={selectedJob}
                    hasApplied={myApplications.some((a) => a.jobId === selectedJob?.id)}
                    appliedStatus={
                      myApplications.find((a) => a.jobId === selectedJob?.id)?.status
                    }
                    isSaved={Boolean(selectedJob && savedJobIds.has(selectedJob.id))}
                    onToggleSave={handleToggleSave}
                    onApplySuccess={() => {
                      refreshCandidateData();
                      fetchJobs();
                    }}
                    onOpenAiMatch={(j) => {
                      setAiMatchJob(j);
                      setIsAiModalOpen(true);
                    }}
                    onBackToList={() => setMobileDetailOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CANDIDATE - MY APPLICATIONS */}
        {activeTab === 'my-applications' && <MyApplicationsView />}

        {/* TAB 3: CANDIDATE - SAVED JOBS */}
        {activeTab === 'saved-jobs' && (
          <SavedJobsView
            onSelectJob={(j) => {
              setModalJob(j);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {/* TAB 4: CANDIDATE - RESUME & PROFILE */}
        {activeTab === 'resumes' && <ResumeManagerView />}

        {/* TAB 5: CANDIDATE - AI MATCHING */}
        {activeTab === 'ai-matching' && (
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
                  onClick={() => {
                    setAiMatchJob(job);
                    setIsAiModalOpen(true);
                  }}
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
        )}

        {/* TAB 6: RECRUITER - ATS KANBAN PIPELINE */}
        {activeTab === 'ats-pipeline' && <KanbanBoard />}

        {/* TAB 7: RECRUITER - JOBS CRUD */}
        {activeTab === 'recruiter-jobs' && (
          <RecruiterJobsView
            onSelectJobForATS={(jobId) => {
              setActiveTab('ats-pipeline');
            }}
          />
        )}

        {/* TAB 8: ADMIN - DASHBOARD & AUDIT */}
        {activeTab === 'admin-dashboard' && <AdminDashboardView />}
      </main>

      {/* Engineering Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-obsidian-surface text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-mono text-[11px]">
            CareerVanguard Terminal • v2.4 Enterprise ATS
          </div>
          <div className="text-[11px] text-slate-400">
            Tuân thủ Luật BVDLCN 91/2025/QH15 & Chuẩn mực đạo đức EU AI Act
          </div>
        </div>
      </footer>

      {/* Fallback Modal for Saved Jobs or standalone view */}
      <JobDetailModal
        job={modalJob}
        isOpen={isDetailModalOpen}
        hasApplied={myApplications.some((a) => a.jobId === modalJob?.id)}
        appliedStatus={myApplications.find((a) => a.jobId === modalJob?.id)?.status}
        onClose={() => setIsDetailModalOpen(false)}
        onApplySuccess={() => {
          refreshCandidateData();
          fetchJobs();
        }}
        onOpenAiMatch={(j) => {
          setAiMatchJob(j);
          setIsAiModalOpen(true);
        }}
      />

      {/* AI Skill Matching Report Modal */}
      <AiSkillMatchModal
        jobId={aiMatchJob?.id || null}
        jobTitle={aiMatchJob?.title}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
