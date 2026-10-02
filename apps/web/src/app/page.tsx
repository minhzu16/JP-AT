'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { JobCard, JobItem } from '../components/JobCard';
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

  // Modals state
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
      .then((res) => setJobs(res.items || []))
      .catch(() => setJobs([]))
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: PUBLIC JOB SEARCH */}
        {activeTab === 'jobs' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xl bg-gradient-to-br from-indigo-500/10 via-brand-500/5 to-purple-500/10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cổng tuyển dụng thông minh thế hệ mới</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Khám phá việc làm IT & Tối ưu hồ sơ ứng tuyển
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tìm kiếm vị trí phù hợp, theo dõi quy trình phỏng vấn minh bạch và nhận đánh giá độ khớp kỹ năng từ AI mà không lo bị loại tự động.
                </p>
              </div>

              {/* Search Form Bar */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-lg border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center px-3 space-x-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 py-1.5">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Chức danh, từ khóa (React, NestJS, DevOps)..."
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex items-center px-3 space-x-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 py-1.5 min-w-[160px]">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Tất cả địa điểm</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <div className="flex items-center px-3 space-x-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 py-1.5 min-w-[140px]">
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Hình thức</option>
                    <option value="ONSITE">ONSITE</option>
                    <option value="HYBRID">HYBRID</option>
                    <option value="REMOTE">REMOTE</option>
                  </select>
                </div>

                <div className="flex items-center px-3 space-x-2 py-1.5 min-w-[130px]">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Cấp bậc</option>
                    <option value="INTERN">Intern</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Middle</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                  </select>
                </div>
              </div>

              {/* Quick Skill Tags */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium mr-1">Kỹ năng phổ biến:</span>
                {skills.slice(0, 9).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSkillId(selectedSkillId === s.id ? '' : s.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                      selectedSkillId === s.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-white'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs Header & Count */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Danh sách việc làm phù hợp
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tìm thấy <span className="font-bold text-slate-700 dark:text-slate-200">{jobs.length}</span> tin tuyển dụng đang mở
                </p>
              </div>

              {(keyword || location || workMode || level || selectedSkillId) && (
                <button
                  onClick={() => {
                    setKeyword('');
                    setLocation('');
                    setWorkMode('');
                    setLevel('');
                    setSelectedSkillId('');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Jobs Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">Đang tìm kiếm việc làm...</div>
            ) : jobs.length === 0 ? (
              <div className="glass-panel p-16 text-center rounded-3xl">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Không tìm thấy tin tuyển dụng phù hợp
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn một số tiêu chí lọc.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job) => {
                  const appliedApp = myApplications.find((a) => a.jobId === job.id);
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      hasApplied={!!appliedApp}
                      appliedStatus={appliedApp?.status}
                      onSelect={(j) => {
                        setSelectedJob(j);
                        setIsDetailOpen(true);
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
            )}
          </div>
        )}

        {/* TAB 2: CANDIDATE - MY APPLICATIONS */}
        {activeTab === 'my-applications' && <MyApplicationsView />}

        {/* TAB 3: CANDIDATE - SAVED JOBS */}
        {activeTab === 'saved-jobs' && (
          <SavedJobsView
            onSelectJob={(j) => {
              setSelectedJob(j);
              setIsDetailOpen(true);
            }}
          />
        )}

        {/* TAB 4: CANDIDATE - RESUME & PROFILE */}
        {activeTab === 'resumes' && <ResumeManagerView />}

        {/* TAB 5: CANDIDATE - AI MATCHING */}
        {activeTab === 'ai-matching' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
                So khớp Kỹ năng & Gợi ý CV Khách quan (AI)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Chọn bất kỳ công việc nào dưới đây để xem phân tích mức độ đáp ứng kỹ năng và các khuyến nghị viết CV theo phương pháp STAR.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setAiMatchJob(job);
                    setIsAiModalOpen(true);
                  }}
                  className="glass-card p-5 rounded-2xl cursor-pointer hover:border-amber-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company.name}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.skills.map((s) => (
                        <span
                          key={s.skill.id}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600"
                        >
                          {s.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-amber-600">
                    <span>Xem phân tích chi tiết</span>
                    <ChevronRight className="w-4 h-4" />
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-900/40 text-center text-xs text-slate-400">
        <p>
          Job Portal & Application Tracker — Next.js 15 App Router + NestJS REST + PostgreSQL 16 + Redis.
        </p>
        <p className="mt-1">
          Tuân thủ Luật Bảo vệ dữ liệu cá nhân Việt Nam số 91/2025/QH15 & Chuẩn mực đạo đức EU AI Act.
        </p>
      </footer>

      {/* Job Detail & Application Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailOpen}
        hasApplied={myApplications.some((a) => a.jobId === selectedJob?.id)}
        appliedStatus={myApplications.find((a) => a.jobId === selectedJob?.id)?.status}
        onClose={() => setIsDetailOpen(false)}
        onApplySuccess={() => {
          refreshCandidateData();
          fetchJobs();
        }}
        onOpenAiMatch={(j) => {
          setAiMatchJob(j);
          setIsAiModalOpen(true);
        }}
      />

      {/* AI Skill Matching Modal */}
      <AiSkillMatchModal
        jobId={aiMatchJob?.id || null}
        jobTitle={aiMatchJob?.title}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
