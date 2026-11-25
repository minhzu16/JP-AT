'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Users } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { formatSalary } from './JobCard';
import { CreateJobModal } from './recruiter/CreateJobModal';

interface JobSkillItem {
  isRequired?: boolean;
  skill: { id: string; name: string };
}

interface SkillItem {
  id: string;
  name: string;
}

interface RecruiterJobItem {
  id: string;
  title: string;
  status: string;
  location: string;
  workMode: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills?: JobSkillItem[];
  _count?: {
    applications: number;
  };
}

export function RecruiterJobsView({
  onSelectJobForATS,
}: {
  onSelectJobForATS?: (jobId: string) => void;
}) {
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Hồ Chí Minh');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [level, setLevel] = useState('MID');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState<number | ''>(30000000);
  const [salaryMax, setSalaryMax] = useState<number | ''>(50000000);
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: string; isRequired: boolean; weight: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchApi<RecruiterJobItem[]>('/jobs/recruiter/my-jobs'),
      fetchApi<SkillItem[]>('/skills'),
    ])
      .then(([jobsRes, skillsRes]) => {
        setJobs(jobsRes || []);
        setSkills(skillsRes || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      await fetchApi('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          location,
          workMode,
          level,
          employmentType,
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
          skills: selectedSkills,
        }),
      });

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setSelectedSkills([]);
      loadData();
    } catch (err: unknown) {
      alert((err as { detail?: string })?.detail || 'Không thể tạo tin tuyển dụng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId);
      if (exists) {
        return prev.filter((s) => s.skillId !== skillId);
      }
      return [...prev, { skillId, isRequired: true, weight: 4 }];
    });
  };

  const handleTogglePublish = async (job: RecruiterJobItem) => {
    try {
      if (job.status === 'PUBLISHED') {
        await fetchApi(`/jobs/${job.id}/close`, { method: 'POST' });
      } else {
        await fetchApi(`/jobs/${job.id}/publish`, { method: 'POST' });
      }
      loadData();
    } catch (err: unknown) {
      alert((err as { detail?: string })?.detail || 'Không thể thay đổi trạng thái');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quản lý Vị trí Tuyển dụng Doanh nghiệp
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Đăng tin tuyển dụng kỹ thuật, thiết lập ma trận trọng số kỹ năng và điều phối hồ sơ.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-cobalt-600 hover:bg-cobalt-700 text-white shadow-sm flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Đăng tin tuyển dụng mới</span>
        </button>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải danh sách vị trí...</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-medium ${
                      job.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.location} ({job.workMode})
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-cobalt-600 dark:text-cobalt-400 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    {job._count?.applications || 0} hồ sơ ứng tuyển
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {job.skills?.map((s: JobSkillItem) => (
                    <span
                      key={s.skill.id}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                    >
                      {s.skill.name} {s.isRequired ? '(Bắt buộc)' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                {onSelectJobForATS && (
                  <button
                    onClick={() => onSelectJobForATS(job.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cobalt-50 text-cobalt-700 dark:bg-cobalt-950/60 dark:text-cobalt-300 hover:bg-cobalt-100 transition border border-cobalt-200/50"
                  >
                    Xem Kanban đơn ({job._count?.applications || 0})
                  </button>
                )}

                <button
                  onClick={() => handleTogglePublish(job)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                    job.status === 'PUBLISHED'
                      ? 'border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      : 'border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  {job.status === 'PUBLISHED' ? 'Đóng tin' : 'Mở lại tin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateJobModal
        isOpen={showCreateModal}
        title={title}
        location={location}
        workMode={workMode}
        level={level}
        employmentType={employmentType}
        salaryMin={salaryMin}
        salaryMax={salaryMax}
        description={description}
        skills={skills}
        selectedSkills={selectedSkills}
        isSubmitting={isSubmitting}
        onTitleChange={setTitle}
        onLocationChange={setLocation}
        onWorkModeChange={setWorkMode}
        onLevelChange={setLevel}
        onEmploymentTypeChange={setEmploymentType}
        onSalaryMinChange={setSalaryMin}
        onSalaryMaxChange={setSalaryMax}
        onDescriptionChange={setDescription}
        onToggleSkill={handleToggleSkill}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateJob}
      />
    </div>
  );
}
