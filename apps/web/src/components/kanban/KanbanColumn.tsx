'use client';

import React from 'react';
import { ColumnDef, ApplicationItem } from './constants';
import { ApplicationCard } from './ApplicationCard';

export interface KanbanColumnProps {
  column: ColumnDef;
  applications: ApplicationItem[];
  onSelectApp: (id: string) => void;
}

export function KanbanColumn({ column, applications, onSelectApp }: KanbanColumnProps) {
  return (
    <div
      className="flex flex-col rounded-2xl bg-slate-50/80 dark:bg-obsidian-surface/60 border border-slate-200 dark:border-slate-800/80 p-3 min-w-[240px] max-w-full backdrop-blur-sm"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor} shadow-xs`} />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {column.title}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${column.badgeBg} tabular-nums`}
        >
          {applications.length}
        </span>
      </div>

      {/* Candidate Cards Stream */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh] p-0.5 custom-scrollbar">
        {applications.map((a) => (
          <ApplicationCard key={a.id} application={a} onSelect={onSelectApp} />
        ))}

        {applications.length === 0 && (
          <div className="py-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 p-4">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 flex items-center justify-center mx-auto mb-1 text-xs">
              0
            </div>
            <p className="text-[11px] text-slate-400 italic">Không có hồ sơ</p>
          </div>
        )}
      </div>
    </div>
  );
}
