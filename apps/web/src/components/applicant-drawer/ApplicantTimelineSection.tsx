'use client';

import React from 'react';
import { History } from 'lucide-react';
import { STATUS_LABELS, type HistoryItem } from './applicantDrawerConstants';

interface ApplicantTimelineSectionProps {
  history?: HistoryItem[];
}

export function ApplicantTimelineSection({ history }: ApplicantTimelineSectionProps) {
  return (
    <div className="p-5 rounded-2xl glass-card space-y-3.5">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center space-x-2">
        <History className="w-4 h-4 text-slate-400" />
        <span>Lịch sử luồng trạng thái ứng tuyển (Audit Trail)</span>
      </h3>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/[0.1]">
        {history?.map((h, idx) => (
          <div key={h.id || idx} className="relative text-xs">
            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{STATUS_LABELS[h.toStatus] || h.toStatus}</span>
              {h.fromStatus && (
                <span className="text-[10px] text-slate-400 font-mono">
                  (từ {STATUS_LABELS[h.fromStatus] || h.fromStatus})
                </span>
              )}
            </div>
            {h.reason && (
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic">
                Lý do: {h.reason}
              </p>
            )}
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              {new Date(h.createdAt).toLocaleString('vi-VN')} • bởi {h.actor?.fullName || h.actor?.email || 'Hệ thống'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
