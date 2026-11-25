'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchApi } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { ApplicantDetailDrawer } from './ApplicantDetailDrawer';
import {
  COLUMNS,
  ApplicationItem,
  JobItem,
  KanbanHeader,
  KanbanMetrics,
  KanbanColumn,
  KanbanTableView,
} from './kanban';

export function KanbanBoard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
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
        fetchApi<JobItem[]>('/jobs/recruiter/my-jobs'),
        fetchApi<ApplicationItem[]>(`/recruiter/applications${selectedJobId ? `?jobId=${selectedJobId}` : ''}`),
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

  const handleSelectApp = (id: string) => {
    setSelectedAppId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ATS Header & Workstation Control Bar */}
      <KanbanHeader
        companyName={user?.company?.name}
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJobId={setSelectedJobId}
        minMatchFilter={minMatchFilter}
        onSelectMinMatchFilter={setMinMatchFilter}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filteredCount={filteredApps.length}
        totalCount={totalApps}
      />

      {/* Recruitment Funnel Metric Cards (Ashby / Linear Style) */}
      <KanbanMetrics
        totalApps={totalApps}
        screeningCount={screeningCount}
        interviewCount={interviewCount}
        interviewRate={interviewRate}
        offerCount={offerCount}
        offerConversion={offerConversion}
        hiredCount={hiredCount}
      />

      {/* Main View: Linear-grade Kanban or High-density Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                applications={colApps}
                onSelectApp={handleSelectApp}
              />
            );
          })}
        </div>
      ) : (
        /* High-density Table View */
        <KanbanTableView
          applications={filteredApps}
          columns={COLUMNS}
          onSelectApp={handleSelectApp}
        />
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
