'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ColumnDef, ApplicationItem, COLUMNS, getInitials, getAvatarColor } from './constants';

export interface KanbanTableViewProps {
  applications: ApplicationItem[];
  columns?: ColumnDef[];
  onSelectApp: (id: string) => void;
}

export function KanbanTableView({
  applications,
  columns = COLUMNS,
  onSelectApp,
}: KanbanTableViewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Bảng danh sách ứng viên tuyển dụng</caption>
          <thead className="bg-slate-50 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th scope="col" className="p-4 font-semibold">Ứng viên</th>
              <th scope="col" className="p-4 font-semibold">Vị trí ứng tuyển</th>
              <th scope="col" className="p-4 font-semibold">Trạng thái chặng</th>
              <th scope="col" className="p-4 font-semibold">Khớp kỹ năng STAR</th>
              <th scope="col" className="p-4 font-semibold">Ngày nộp hồ sơ</th>
              <th scope="col" className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {applications.map((a) => {
              const matchScore = a.matchScore?.score;
              const initials = getInitials(a.candidate?.fullName || '');
              const avatarGradient = getAvatarColor(a.candidate?.fullName || 'User');
              const colConfig = columns.find((c) => c.id === a.status);

              return (
                <tr
                  key={a.id}
                  onClick={() => {
                    onSelectApp(a.id);
                  }}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {a.candidate?.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {a.candidate?.headline || 'Chưa cập nhật tiêu đề'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                    {a.job?.title}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                        colConfig?.badgeBg || 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${colConfig?.dotColor || 'bg-slate-400'}`} />
                      {colConfig?.title || a.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    {matchScore != null ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                          matchScore >= 80
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                            : matchScore >= 50
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {matchScore}%
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-slate-500">
                    {new Date(a.appliedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      Chi tiết hồ sơ <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
