'use client';

import React from 'react';
import { Search, MapPin, RotateCcw } from 'lucide-react';

interface SkillItem {
  id: string;
  name: string;
}

interface JobFilterBarProps {
  keyword: string;
  location: string;
  workMode: string;
  level: string;
  selectedSkillId: string;
  skills: SkillItem[];
  hasActiveFilters: boolean;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onWorkModeChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onSelectSkill: (skillId: string) => void;
  onClearFilters: () => void;
}

export function JobFilterBar({
  keyword,
  location,
  workMode,
  level,
  selectedSkillId,
  skills,
  hasActiveFilters,
  onKeywordChange,
  onLocationChange,
  onWorkModeChange,
  onLevelChange,
  onSelectSkill,
  onClearFilters,
}: JobFilterBarProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-obsidian-surface/90 backdrop-blur-xl p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5">
        {/* Search input with Spotlight focus */}
        <div className="flex-1 flex items-center px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm kiếm vị trí kỹ thuật, công nghệ (React, NestJS, Go, Kubernetes, Rust)..."
            className="w-full text-xs sm:text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {keyword && (
            <button
              onClick={() => onKeywordChange('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Location dropdown */}
          <div className="flex items-center px-3 py-2 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <select
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="">Tất cả địa điểm</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>

          {/* Work Mode */}
          <div className="flex items-center px-3 py-2 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-xs">
            <select
              value={workMode}
              onChange={(e) => onWorkModeChange(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="">Hình thức</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          {/* Level */}
          <div className="flex items-center px-3 py-2 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-xs">
            <select
              value={level}
              onChange={(e) => onLevelChange(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none text-xs font-medium cursor-pointer"
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
              onClick={onClearFilters}
              className="px-3 py-2 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Skills Quick Chips */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-mono text-slate-400 mr-1.5 font-medium">Chuyên môn:</span>
        {skills.slice(0, 10).map((s) => {
          const isSelected = selectedSkillId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSkill(isSelected ? '' : s.id)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
