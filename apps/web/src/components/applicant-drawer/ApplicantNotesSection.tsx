'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { NoteItem } from './applicantDrawerConstants';

interface ApplicantNotesSectionProps {
  notes?: NoteItem[];
  noteBody: string;
  isAddingNote: boolean;
  onNoteBodyChange: (value: string) => void;
  onAddNote: (e: React.FormEvent) => void;
}

export function ApplicantNotesSection({
  notes,
  noteBody,
  isAddingNote,
  onNoteBodyChange,
  onAddNote,
}: ApplicantNotesSectionProps) {
  return (
    <div className="p-5 rounded-2xl glass-card space-y-4">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <span>Ghi chú nội bộ Hội đồng tuyển dụng ({notes?.length || 0})</span>
      </h3>

      <form onSubmit={onAddNote} className="flex gap-2">
        <input
          type="text"
          value={noteBody}
          onChange={(e) => onNoteBodyChange(e.target.value)}
          placeholder="Thêm nhận xét kỹ thuật, kết quả trao đổi..."
          className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-white/[0.15] bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isAddingNote}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 transition shrink-0"
        >
          {isAddingNote ? 'Lưu...' : 'Gửi'}
        </button>
      </form>

      <div className="space-y-2.5 max-h-48 overflow-y-auto">
        {notes?.map((n) => (
          <div
            key={n.id}
            className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] text-xs"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {n.author?.fullName || n.author?.email}
              </span>
              <span>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
              {n.body}
            </p>
          </div>
        ))}
        {(!notes || notes.length === 0) && (
          <p className="text-xs text-slate-400 italic text-center py-2">
            Chưa có ghi chú nào cho ứng viên này.
          </p>
        )}
      </div>
    </div>
  );
}
