'use client';

import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { ApplicationItem, getInitials, getAvatarColor } from './constants';

export interface ApplicationCardProps {
  application: ApplicationItem;
  onSelect: (id: string) => void;
}

export function ApplicationCard({ application, onSelect }: ApplicationCardProps) {
  const a = application;
  const matchScore = a.matchScore?.score;
  const initials = getInitials(a.candidate?.fullName || '');
  const avatarGradient = getAvatarColor(a.candidate?.fullName || 'User');

  return (
    <div
      onClick={() => {
        onSelect(a.id);
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

        {a.interviews && a.interviews.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50">
            <Calendar className="w-2.5 h-2.5 mr-1" />
            Round {a.interviews[0].round}
          </span>
        )}
      </div>

      {/* Footer timestamps & Notes count */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>{new Date(a.appliedAt).toLocaleDateString('vi-VN')}</span>
        {a._count && a._count.notes > 0 && (
          <span className="text-slate-500 font-medium">{a._count.notes} ghi chú</span>
        )}
      </div>
    </div>
  );
}
