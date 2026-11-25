'use client';

import React from 'react';
import { Zap } from 'lucide-react';

export interface ResumeDocument {
  id: string;
  originalFilename: string;
  isDefault: boolean;
}

interface InlineApplyTrayProps {
  documents: ResumeDocument[];
  selectedResumeId: string;
  coverLetter: string;
  isApplying: boolean;
  errorMsg: string | null;
  onSelectResume: (id: string) => void;
  onCoverLetterChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function InlineApplyTray({
  documents,
  selectedResumeId,
  coverLetter,
  isApplying,
  errorMsg,
  onSelectResume,
  onCoverLetterChange,
  onSubmit,
  onCancel,
}: InlineApplyTrayProps) {
  return (
    <div className="p-6 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-white/[0.08] animate-in slide-in-from-top-2 duration-150">
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          Nộp hồ sơ trực tiếp vào hệ thống tuyển dụng
        </h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Chọn CV đã lưu trong hệ thống
          </label>
          {documents.length === 0 ? (
            <div className="text-xs text-amber-700 dark:text-amber-400 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              Bạn chưa có file CV trong hồ sơ. Hệ thống sẽ ghi nhận thông tin tài khoản hoặc bạn có thể vào tab “Hồ sơ kỹ thuật” để tải lên file PDF.
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => onSelectResume(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.originalFilename} {d.isDefault ? '(Mặc định)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Thư giới thiệu / Lời nhắn tới Nhà tuyển dụng (Tùy chọn)
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => onCoverLetterChange(e.target.value)}
            rows={3}
            placeholder="Tóm tắt ngắn gọn các dự án nổi bật hoặc lý do bạn phù hợp với vị trí này..."
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-600 dark:text-rose-400 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center space-x-3 pt-1">
          <button
            type="submit"
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition"
          >
            {isApplying ? 'Đang gửi...' : 'Xác nhận nộp đơn'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
