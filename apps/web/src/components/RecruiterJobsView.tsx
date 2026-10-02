'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  Building,
  Sparkles,
  Users,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { formatSalary } from './JobCard';

export function RecruiterJobsView({
  onSelectJobForATS,
}: {
  onSelectJobForATS?: (jobId: string) => void;
}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New job state
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
      fetchApi<any[]>('/jobs/recruiter/my-jobs'),
      fetchApi<any[]>('/skills'),
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
      // Reset
      setTitle('');
      setDescription('');
      setSelectedSkills([]);
      loadData();
    } catch (err: any) {
      alert(err.detail || 'Không thể tạo tin tuyển dụng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId);
      if (exists) {
        return prev.filter((s) => s.skillId !== skillId);
      } else {
        return [...prev, { skillId, isRequired: true, weight: 4 }];
      }
    });
  };

  const handleTogglePublish = async (job: any) => {
    try {
      if (job.status === 'PUBLISHED') {
        await fetchApi(`/jobs/${job.id}/close`, { method: 'POST' });
      } else {
        await fetchApi(`/jobs/${job.id}/publish`, { method: 'POST' });
      }
      loadData();
    } catch (err: any) {
      alert(err.detail || 'Không thể thay đổi trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quản lý tin tuyển dụng
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Đăng tin tuyển dụng mới, quản lý trạng thái hiển thị và theo dõi số lượng hồ sơ.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Đăng tin tuyển dụng mới</span>
        </button>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Đang tải tin tuyển dụng...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      job.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {job.location} ({job.workMode})
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-brand-600 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    {job._count?.applications || 0} hồ sơ ứng tuyển
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills?.map((s: any) => (
                    <span
                      key={s.skill.id}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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
                    className="px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 hover:bg-brand-100 transition"
                  >
                    Xem Kanban đơn ({job._count?.applications || 0})
                  </button>
                )}

                <button
                  onClick={() => handleTogglePublish(job)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                    job.status === 'PUBLISHED'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {job.status === 'PUBLISHED' ? 'Đóng tin' : 'Mở lại tin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Tạo tin tuyển dụng mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tiêu đề công việc:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Vd: Senior Full-stack Engineer (React / NestJS)..."
                  required
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Địa điểm:
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  >
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Remote Toàn Quốc">Remote Toàn Quốc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Hình thức:
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  >
                    <option value="ONSITE">ONSITE</option>
                    <option value="HYBRID">HYBRID</option>
                    <option value="REMOTE">REMOTE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Cấp bậc:
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  >
                    <option value="INTERN">INTERN</option>
                    <option value="FRESHER">FRESHER</option>
                    <option value="JUNIOR">JUNIOR</option>
                    <option value="MID">MID</option>
                    <option value="SENIOR">SENIOR</option>
                    <option value="LEAD">LEAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Loại việc:
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  >
                    <option value="FULL_TIME">FULL_TIME</option>
                    <option value="PART_TIME">PART_TIME</option>
                    <option value="CONTRACT">CONTRACT</option>
                    <option value="INTERNSHIP">INTERNSHIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Lương tối thiểu (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Lương tối đa (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kỹ năng yêu cầu (Nhấn chọn):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {skills.map((s) => {
                    const isSelected = selectedSkills.some((sk) => sk.skillId === s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleToggleSkill(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mô tả công việc & Yêu cầu:
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả trách nhiệm công việc, yêu cầu kỹ năng và quyền lợi dành cho ứng viên..."
                  required
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Đăng tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
