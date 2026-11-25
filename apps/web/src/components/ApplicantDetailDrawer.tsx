'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, FileText, Download, Calendar, User, MapPin, Zap } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { InterviewModal } from './InterviewModal';
import {
  STATUS_LABELS,
  NEXT_ALLOWED,
  type ApplicantDetail,
} from './applicant-drawer/applicantDrawerConstants';
import { ApplicantNotesSection } from './applicant-drawer/ApplicantNotesSection';
import { ApplicantTimelineSection } from './applicant-drawer/ApplicantTimelineSection';

export function ApplicantDetailDrawer({
  applicationId,
  isOpen,
  onClose,
  onStatusUpdated,
}: {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}) {
  const [app, setApp] = useState<ApplicantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [transitionReason, setTransitionReason] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [noteBody, setNoteBody] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const loadData = useCallback(() => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    fetchApi<ApplicantDetail>(`/recruiter/applications/${applicationId}`)
      .then((data) => {
        setApp(data);
        const allowed = NEXT_ALLOWED[data.status] || [];
        setSelectedNextStatus(allowed.length > 0 ? allowed[0] : '');
      })
      .catch((err) => {
        setError((err as { detail?: string })?.detail || 'Không thể tải chi tiết ứng viên (Lỗi truy cập)');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [applicationId]);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadData();
    }
  }, [isOpen, applicationId, loadData]);

  if (!isOpen || !applicationId) return null;

  const handleTransition = async () => {
    if (!selectedNextStatus) return;
    setIsTransitioning(true);
    try {
      await fetchApi(`/recruiter/applications/${applicationId}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          toStatus: selectedNextStatus,
          reason: transitionReason || undefined,
        }),
      });
      setTransitionReason('');
      loadData();
      onStatusUpdated();
    } catch (err: unknown) {
      alert((err as { detail?: string })?.detail || 'Lỗi khi chuyển trạng thái');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setIsAddingNote(true);
    try {
      await fetchApi(`/recruiter/applications/${applicationId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body: noteBody.trim() }),
      });
      setNoteBody('');
      loadData();
    } catch (err: unknown) {
      alert((err as { detail?: string })?.detail || 'Lỗi khi thêm ghi chú');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const res = await fetchApi<{ downloadUrl: string; originalFilename: string }>(
        `/recruiter/applications/${applicationId}/resume`
      );
      window.open(res.downloadUrl, '_blank');
    } catch (err: unknown) {
      alert((err as { detail?: string })?.detail || 'Không thể tải CV');
    }
  };

  const allowedStatuses = app ? NEXT_ALLOWED[app.status] || [] : [];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicant-drawer-title"
        className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200"
      >
        <div className="w-full max-w-2xl bg-white dark:bg-[#0C101A] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/[0.08] animate-in slide-in-from-right duration-200">
          {/* Top Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.02]">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <User className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id="applicant-drawer-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Hồ sơ Ứng viên Tuyển dụng
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  REF: {applicationId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng chi tiết ứng viên"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Đang đồng bộ hồ sơ ứng viên...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900 font-medium">
                {error}
              </div>
            ) : app ? (
              <>
                {/* Candidate Overview Card */}
                <div className="p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-white/[0.08]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {app.candidate.fullName}
                      </h2>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        {app.candidate.headline || 'Ứng viên kỹ thuật'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.candidate.location || 'Việt Nam'}</span>
                        <span>•</span>
                        <span>{app.candidate.yearsExperience} năm kinh nghiệm</span>
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </div>

                  {app.candidate.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3.5 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] leading-relaxed">
                      {app.candidate.summary}
                    </p>
                  )}

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-1.5 text-blue-500" />
                      Tài liệu đính kèm
                    </span>
                    <button
                      onClick={handleDownloadResume}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 transition flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải file CV</span>
                    </button>
                  </div>
                </div>

                {/* State Machine Transition Control */}
                <div className="p-5 rounded-2xl glass-card border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 space-y-3.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between font-mono">
                    <span className="flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Điều chuyển vòng tuyển dụng</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      State: {app.status}
                    </span>
                  </div>

                  {allowedStatuses.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedNextStatus}
                        onChange={(e) => setSelectedNextStatus(e.target.value)}
                        className="text-xs font-bold rounded-xl border border-slate-300 dark:border-white/[0.15] bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {allowedStatuses.map((st: string) => (
                          <option key={st} value={st}>
                            Chuyển sang: {STATUS_LABELS[st] || st}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={transitionReason}
                        onChange={(e) => setTransitionReason(e.target.value)}
                        placeholder="Lý do chuyển trạng thái (bắt buộc khi Từ chối)..."
                        className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-white/[0.15] bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        onClick={handleTransition}
                        disabled={isTransitioning}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition shrink-0"
                      >
                        {isTransitioning ? 'Đang chuyển...' : 'Xác nhận chuyển'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic p-2 bg-slate-100 dark:bg-white/[0.04] rounded-lg text-center">
                      Hồ sơ đang ở trạng thái kết thúc ({app.status}). Không thể chuyển tiếp theo luật State Machine.
                    </div>
                  )}

                  {app.status === 'SCREENING' && (
                    <button
                      onClick={() => setIsInterviewModalOpen(true)}
                      className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition flex items-center justify-center space-x-1.5"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Lên lịch phỏng vấn chính thức</span>
                    </button>
                  )}
                </div>

                <ApplicantNotesSection
                  notes={app.notes}
                  noteBody={noteBody}
                  isAddingNote={isAddingNote}
                  onNoteBodyChange={setNoteBody}
                  onAddNote={handleAddNote}
                />

                <ApplicantTimelineSection history={app.history} />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {isInterviewModalOpen && app && (
        <InterviewModal
          applicationId={app.id}
          candidateName={app.candidate.fullName}
          jobTitle={app.job?.title || 'Vị trí kỹ thuật'}
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          onSuccess={() => {
            setIsInterviewModalOpen(false);
            loadData();
            onStatusUpdated();
          }}
        />
      )}
    </>
  );
}
