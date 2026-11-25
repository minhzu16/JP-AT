'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';
import { JobCard, JobItem } from '../JobCard';
import { JobDossier } from '../JobDossier';

interface CandidateApplicationSummary {
  id: string;
  jobId: string;
  status: string;
}

interface JobWorkstationPaneProps {
  loading: boolean;
  jobs: JobItem[];
  selectedJob: JobItem | null;
  mobileDetailOpen: boolean;
  savedJobIds: Set<string>;
  myApplications: CandidateApplicationSummary[];
  onSelectJob: (job: JobItem) => void;
  onToggleSave: (jobId: string, current: boolean) => void;
  onCheckAiMatch: (job: JobItem) => void;
  onApplySuccess: () => void;
  onBackToList: () => void;
}

export function JobWorkstationPane({
  loading,
  jobs,
  selectedJob,
  mobileDetailOpen,
  savedJobIds,
  myApplications,
  onSelectJob,
  onToggleSave,
  onCheckAiMatch,
  onApplySuccess,
  onBackToList,
}: JobWorkstationPaneProps) {
  if (loading) {
    return (
      <div className="py-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface text-center text-xs text-slate-400">
        Đang nạp dữ liệu vị trí kỹ thuật...
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface text-center">
        <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Không tìm thấy tin tuyển dụng phù hợp
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Thử xóa bớt bộ lọc hoặc tìm với từ khóa công nghệ khác.
        </p>
      </div>
    );
  }

  return (
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
              onSelect={onSelectJob}
              onToggleSave={onToggleSave}
              onCheckAiMatch={onCheckAiMatch}
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
          appliedStatus={myApplications.find((a) => a.jobId === selectedJob?.id)?.status}
          isSaved={Boolean(selectedJob && savedJobIds.has(selectedJob.id))}
          onToggleSave={onToggleSave}
          onApplySuccess={onApplySuccess}
          onOpenAiMatch={onCheckAiMatch}
          onBackToList={onBackToList}
        />
      </div>
    </div>
  );
}
