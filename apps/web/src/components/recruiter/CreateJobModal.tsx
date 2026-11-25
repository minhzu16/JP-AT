'use client';

import React from 'react';

interface SkillItem {
  id: string;
  name: string;
}

interface SelectedSkill {
  skillId: string;
  isRequired: boolean;
  weight: number;
}

interface CreateJobModalProps {
  isOpen: boolean;
  title: string;
  location: string;
  workMode: string;
  level: string;
  employmentType: string;
  salaryMin: number | '';
  salaryMax: number | '';
  description: string;
  skills: SkillItem[];
  selectedSkills: SelectedSkill[];
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onWorkModeChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onEmploymentTypeChange: (value: string) => void;
  onSalaryMinChange: (value: number | '') => void;
  onSalaryMaxChange: (value: number | '') => void;
  onDescriptionChange: (value: string) => void;
  onToggleSkill: (skillId: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateJobModal({
  isOpen,
  title,
  location,
  workMode,
  level,
  employmentType,
  salaryMin,
  salaryMax,
  description,
  skills,
  selectedSkills,
  isSubmitting,
  onTitleChange,
  onLocationChange,
  onWorkModeChange,
  onLevelChange,
  onEmploymentTypeChange,
  onSalaryMinChange,
  onSalaryMaxChange,
  onDescriptionChange,
  onToggleSkill,
  onClose,
  onSubmit,
}: CreateJobModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Tạo tin tuyển dụng mới
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Tiêu đề công việc:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
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
                onChange={(e) => onLocationChange(e.target.value)}
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
                onChange={(e) => onWorkModeChange(e.target.value)}
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
                onChange={(e) => onLevelChange(e.target.value)}
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
                onChange={(e) => onEmploymentTypeChange(e.target.value)}
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
                onChange={(e) => onSalaryMinChange(e.target.value ? Number(e.target.value) : '')}
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
                onChange={(e) => onSalaryMaxChange(e.target.value ? Number(e.target.value) : '')}
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
                    onClick={() => onToggleSkill(s.id)}
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
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả trách nhiệm công việc, yêu cầu kỹ năng và quyền lợi dành cho ứng viên..."
              required
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
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
  );
}
