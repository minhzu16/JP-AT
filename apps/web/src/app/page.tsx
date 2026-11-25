'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { JobItem } from '../components/JobCard';
import { JobDetailModal } from '../components/JobDetailModal';
import { AiSkillMatchModal } from '../components/AiSkillMatchModal';
import { KanbanBoard } from '../components/KanbanBoard';
import { MyApplicationsView } from '../components/MyApplicationsView';
import { SavedJobsView } from '../components/SavedJobsView';
import { ResumeManagerView } from '../components/ResumeManagerView';
import { RecruiterJobsView } from '../components/RecruiterJobsView';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { JobFilterBar } from '../components/home/JobFilterBar';
import { JobWorkstationPane } from '../components/home/JobWorkstationPane';
import { AiMatchingTab } from '../components/home/AiMatchingTab';
import { useAuth } from '../lib/auth-context';
import { fetchApi } from '../lib/api';

interface SkillItem {
  id: string;
  name: string;
}

interface SavedJobRef {
  jobId: string;
}

interface CandidateApplicationSummary {
  id: string;
  jobId: string;
  status: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [level, setLevel] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [myApplications, setMyApplications] = useState<CandidateApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const [modalJob, setModalJob] = useState<JobItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [aiMatchJob, setAiMatchJob] = useState<JobItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const fetchJobs = useCallback(() => {
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
  }, [keyword, location, workMode, level, selectedSkillId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchApi<SkillItem[]>('/skills')
      .then((data) => setSkills(data || []))
      .catch(() => {});
  }, []);

  const refreshCandidateData = useCallback(() => {
    if (user?.role === 'CANDIDATE') {
      fetchApi<SavedJobRef[]>('/me/saved-jobs')
        .then((data) => setSavedJobIds(new Set((data || []).map((s) => s.jobId))))
        .catch(() => {});

      fetchApi<CandidateApplicationSummary[]>('/me/applications')
        .then((data) => setMyApplications(data || []))
        .catch(() => {});
    } else {
      setSavedJobIds(new Set());
      setMyApplications([]);
    }
  }, [user]);

  useEffect(() => {
    refreshCandidateData();
  }, [refreshCandidateData]);

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
    } catch (err: unknown) {
      alert((err as { detail?: string })?.detail || 'Lỗi khi lưu việc');
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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <JobFilterBar
              keyword={keyword}
              location={location}
              workMode={workMode}
              level={level}
              selectedSkillId={selectedSkillId}
              skills={skills}
              hasActiveFilters={hasActiveFilters}
              onKeywordChange={setKeyword}
              onLocationChange={setLocation}
              onWorkModeChange={setWorkMode}
              onLevelChange={setLevel}
              onSelectSkill={setSelectedSkillId}
              onClearFilters={handleClearFilters}
            />

            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Kết quả tuyển dụng:
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tabular-nums">
                  {jobs.length} vị trí đang mở
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Dual-Pane Workstation • Live Pipeline</span>
              </div>
            </div>

            <JobWorkstationPane
              loading={loading}
              jobs={jobs}
              selectedJob={selectedJob}
              mobileDetailOpen={mobileDetailOpen}
              savedJobIds={savedJobIds}
              myApplications={myApplications}
              onSelectJob={(j) => {
                setSelectedJob(j);
                setMobileDetailOpen(true);
              }}
              onToggleSave={handleToggleSave}
              onCheckAiMatch={(j) => {
                setAiMatchJob(j);
                setIsAiModalOpen(true);
              }}
              onApplySuccess={() => {
                refreshCandidateData();
                fetchJobs();
              }}
              onBackToList={() => setMobileDetailOpen(false)}
            />
          </div>
        )}

        {activeTab === 'my-applications' && <MyApplicationsView />}

        {activeTab === 'saved-jobs' && (
          <SavedJobsView
            onSelectJob={(j) => {
              setModalJob(j);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {activeTab === 'resumes' && <ResumeManagerView />}

        {activeTab === 'ai-matching' && (
          <AiMatchingTab
            jobs={jobs}
            onSelectJobForMatch={(job) => {
              setAiMatchJob(job);
              setIsAiModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ats-pipeline' && <KanbanBoard />}

        {activeTab === 'recruiter-jobs' && (
          <RecruiterJobsView onSelectJobForATS={() => setActiveTab('ats-pipeline')} />
        )}

        {activeTab === 'admin-dashboard' && <AdminDashboardView />}
      </main>

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

      <AiSkillMatchModal
        jobId={aiMatchJob?.id || null}
        jobTitle={aiMatchJob?.title}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
