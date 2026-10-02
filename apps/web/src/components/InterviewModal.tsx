'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, Users, Send } from 'lucide-react';
import { fetchApi } from '../lib/api';

export function InterviewModal({
  applicationId,
  candidateName,
  isOpen,
  onClose,
  onSuccess,
}: {
  applicationId: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [round, setRound] = useState(1);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [mode, setMode] = useState<'ONLINE' | 'ONSITE'>('ONLINE');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [interviewerNames, setInterviewerNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt || !locationOrLink) {
      setError('Vui lòng nhập thời gian và đường dẫn/địa điểm phỏng vấn.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchApi('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          applicationId,
          round: Number(round),
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMin: Number(durationMin),
          mode,
          locationOrLink,
          interviewerNames: interviewerNames || undefined,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.detail || 'Không thể tạo lịch phỏng vấn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Lên lịch phỏng vấn
              </h3>
              <p className="text-xs text-slate-500">Ứng viên: {candidateName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Vòng phỏng vấn (Round)
              </label>
              <select
                value={round}
                onChange={(e) => setRound(Number(e.target.value))}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              >
                <option value={1}>Vòng 1 - Phỏng vấn sơ loại kỹ thuật</option>
                <option value={2}>Vòng 2 - Chuyên môn & Live Coding</option>
                <option value={3}>Vòng 3 - Phỏng vấn Văn hoá / Giám đốc</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Thời gian bắt đầu:
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Hình thức
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'ONLINE'}
                  onChange={() => setMode('ONLINE')}
                  className="mr-2 text-brand-600"
                />
                Trực tuyến (Online Meet)
              </label>
              <label className="flex items-center text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'ONSITE'}
                  onChange={() => setMode('ONSITE')}
                  className="mr-2 text-brand-600"
                />
                Trực tiếp tại văn phòng
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {mode === 'ONLINE' ? 'Link Google Meet / Zoom:' : 'Địa chỉ phòng họp / Văn phòng:'}
            </label>
            <input
              type="text"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder={mode === 'ONLINE' ? 'https://meet.google.com/abc-xyz' : 'Phòng 402, Tòa nhà Innovation'}
              required
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Người phỏng vấn (Họ tên):
            </label>
            <input
              type="text"
              value={interviewerNames}
              onChange={(e) => setInterviewerNames(e.target.value)}
              placeholder="Vd: Nguyễn Văn A (Tech Lead), Trần Thị B (HR)"
              className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Xác nhận đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
