'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  MessageSquare,
  History,
  ShieldCheck,
  Send,
  User,
  ArrowRight,
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { InterviewModal } from './InterviewModal';

const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Ứng tuyển mới',
  SCREENING: 'Sơ loại hồ sơ',
  INTERVIEW: 'Phỏng vấn',
  OFFER: 'Đề nghị nhận việc',
  HIRED: 'Đã tuyển dụng',
  REJECTED: 'Từ chối',
  WITHDRAWN: 'Ứng viên đã rút đơn',
};

const NEXT_ALLOWED: Record<string, string[]> = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['INTERVIEW', 'OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

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
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transition state
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [transitionReason, setTransitionReason] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Note state
  const [noteBody, setNoteBody] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Interview modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const loadData = () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    fetchApi(`/recruiter/applications/${applicationId}`)
      .then((data) => {
        setApp(data);
        const allowed = NEXT_ALLOWED[data.status] || [];
        if (allowed.length > 0) {
          setSelectedNextStatus(allowed[0]);
        } else {
          setSelectedNextStatus('');
        }
      })
      .catch((err) => {
        setError(err.detail || 'Không thể tải chi tiết ứng viên (Lỗi truy cập)');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen && applicationId) {
      loadData();
    }
  }, [isOpen, applicationId]);

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
    } catch (err: any) {
      alert(err.detail || 'Lỗi khi chuyển trạng thái');
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
    } catch (err: any) {
      alert(err.detail || 'Lỗi khi thêm ghi chú');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const res = await fetchApi<{ downloadUrl: string; originalFilename: string }>(
        `/recruiter/applications/${applicationId}/resume`
      );
      // Trigger download
      window.open(res.downloadUrl, '_blank');
    } catch (err: any) {
      alert(err.detail || 'Không thể tải CV');
    }
  };

  const allowedStatuses = app ? NEXT_ALLOWED[app.status] || [] : [];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
        <div className="w-full max-w-2xl bg-white dark:bg-obsidian-surface h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-150">
          {/* Top Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-obsidian-card">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Hồ sơ Ứng viên Tuyển dụng
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {applicationId.slice(0, 8)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 border-2 border-cobalt-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Đang tải hồ sơ ứng viên...</p>
              </div>
            ) : error ? (
              <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            ) : app ? (
              <>
                {/* Candidate Overview Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {app.candidate.fullName}
                      </h2>
                      <p className="text-xs text-cobalt-600 dark:text-cobalt-400 font-medium mt-0.5">
                        {app.candidate.headline || 'Ứng viên chưa cập nhật tiêu đề'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {app.candidate.location || 'Việt Nam'} • {app.candidate.yearsExperience} năm kinh nghiệm
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </div>

                  {app.candidate.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
                      {app.candidate.summary}
                    </p>
                  )}
                </div>

                {/* Status Transition Control (State Machine Enforcement) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Điều chuyển trạng thái (ATS State Machine)</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Hiện tại: {app.status}
                    </span>
                  </div>

                  {allowedStatuses.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedNextStatus}
                        onChange={(e) => setSelectedNextStatus(e.target.value)}
                        className="text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
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
                        placeholder="Lý do chuyển trạng thái..."
                        className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 focus:outline-none focus:ring-1 focus:ring-cobalt-500 text-slate-800 dark:text-slate-200"
                      />

                      <button
                        onClick={handleTransition}
                        disabled={isTransitioning}
                        className="px-3.5 py-2 text-xs font-medium rounded-lg bg-cobalt-600 hover:bg-cobalt-700 text-white shadow-sm transition disabled:opacity-50 shrink-0 flex items-center justify-center space-x-1"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Cập nhật</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Đơn này đang ở trạng thái kết thúc ({app.status}). Không có trạng thái tiếp theo hợp lệ.
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsInterviewModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Đặt lịch phỏng vấn</span>
                    </button>
                  </div>
                </div>

                {/* Candidate Skills */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Kỹ năng ứng viên sở hữu
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {app.candidate.skills?.map((cs: any) => (
                      <span
                        key={cs.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        {cs.skill.name} • Level {cs.level}/5 ({cs.years} năm)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Attached Resume */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Hồ sơ CV đính kèm
                  </h4>
                  {app.resume ? (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-brand-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {app.resume.originalFilename}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(app.resume.sizeBytes / 1024).toFixed(0)} KB • Quét an toàn: {app.resume.scanStatus}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadResume}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 flex items-center space-x-1 text-slate-800 dark:text-slate-200 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải CV (Audit Log)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Không có CV đính kèm</div>
                  )}
                </div>

                {/* Scheduled Interviews */}
                {app.interviews?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Lịch phỏng vấn đã lên ({app.interviews.length})
                    </h4>
                    <div className="space-y-2">
                      {app.interviews.map((iv: any) => (
                        <div
                          key={iv.id}
                          className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs space-y-1"
                        >
                          <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-300">
                            <span>Vòng {iv.round}: {iv.mode}</span>
                            <span>{new Date(iv.scheduledAt).toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">Địa điểm/Link: </span>
                            <a
                              href={iv.locationOrLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 underline font-mono text-[11px]"
                            >
                              {iv.locationOrLink}
                            </a>
                          </div>
                          {iv.interviewerNames && (
                            <div className="text-slate-500 text-[11px]">
                              Người phỏng vấn: {iv.interviewerNames}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruiter Internal Notes */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Ghi chú nội bộ nhà tuyển dụng
                  </h4>
                  <div className="space-y-2 mb-3">
                    {app.notes?.map((n: any) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <p>{n.body}</p>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>{n.author?.email}</span>
                          <span>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                    ))}
                    {(!app.notes || app.notes.length === 0) && (
                      <p className="text-xs text-slate-400 italic">Chưa có ghi chú nội bộ nào.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Thêm ghi chú đánh giá ứng viên..."
                      className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                    />
                    <button
                      type="submit"
                      disabled={isAddingNote || !noteBody.trim()}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Audit Trail / History */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1" />
                    Lịch sử thay đổi trạng thái (Audit Trail)
                  </h4>
                  <div className="space-y-1.5 border-l-2 border-slate-200 dark:border-slate-800 ml-2 pl-3">
                    {app.history?.map((h: any) => (
                      <div key={h.id} className="text-xs py-1">
                        <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                          <span>{h.fromStatus}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-brand-600">{h.toStatus}</span>
                        </div>
                        {h.reason && (
                          <div className="text-slate-500 text-[11px] mt-0.5">Lý do: {h.reason}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(h.changedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <InterviewModal
        applicationId={applicationId}
        candidateName={app?.candidate?.fullName || ''}
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSuccess={() => {
          loadData();
          onStatusUpdated();
        }}
      />
    </>
  );
}
