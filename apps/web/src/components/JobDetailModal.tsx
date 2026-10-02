'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react';
import { JobItem, formatSalary } from './JobCard';
import { useAuth } from '../lib/auth-context';
import { fetchApi } from '../lib/api';

export function JobDetailModal({
  job,
  isOpen,
  hasApplied,
  appliedStatus,
  onClose,
  onApplySuccess,
  onOpenAiMatch,
}: {
  job: JobItem | null;
  isOpen: boolean;
  hasApplied: boolean;
  appliedStatus?: string;
  onClose: () => void;
  onApplySuccess: () => void;
  onOpenAiMatch: (job: JobItem) => void;
}) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.role === 'CANDIDATE') {
      fetchApi<any[]>('/me/documents')
        .then((docs) => {
          setDocuments(docs || []);
          const def = docs.find((d) => d.isDefault);
          if (def) setSelectedResumeId(def.id);
          else if (docs.length > 0) setSelectedResumeId(docs[0].id);
        })
        .catch(() => {});
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [isOpen, user]);

  if (!isOpen || !job) return null;

  const handleApply = async () => {
    if (!user || user.role !== 'CANDIDATE') {
      setErrorMsg('Vui lòng đăng nhập với tài khoản Ứng viên (Candidate) để nộp đơn.');
      return;
    }

    setIsApplying(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await fetchApi(`/jobs/${job.id}/applications`, {
        method: 'POST',
        body: JSON.stringify({
          resumeDocumentId: selectedResumeId || null,
          coverLetter: coverLetter || null,
        }),
      });

      setSuccessMsg('Nộp đơn ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.');
      onApplySuccess();
    } catch (err: any) {
      if (err.code === 'ALREADY_APPLIED' || err.status === 409) {
        setErrorMsg('RÀNG BUỘC NGHIỆP VỤ (409): Bạn đã ứng tuyển vào vị trí này rồi. Hệ thống chặn nộp trùng lặp.');
      } else {
        setErrorMsg(err.detail || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {job.company.logoKey ? (
                <img
                  src={job.company.logoKey}
                  alt={job.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {job.title}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job.company.name}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* Quick Highlight Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Mức lương</span>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Hình thức</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {job.workMode}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Cấp bậc</span>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {job.level}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 uppercase">Loại hợp đồng</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {job.employmentType}
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Kỹ năng yêu cầu
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <div
                  key={s.skill.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 ${
                    s.isRequired
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{s.skill.name}</span>
                  <span className="text-[10px] px-1 rounded bg-black/10 dark:bg-white/10">
                    Trọng số: {s.weight}
                  </span>
                  {s.isRequired && (
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                      (Bắt buộc)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Mô tả công việc & Quyền lợi
            </h4>
            <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {job.description}
            </div>
          </div>

          {/* AI Matching Banner */}
          {user?.role === 'CANDIDATE' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Kiểm tra độ tương thích kỹ năng với AI
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Hệ thống đánh giá độ khớp kỹ năng & gợi ý nâng cấp CV (Không thiên lệch)
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAiMatch(job);
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
              >
                So khớp ngay
              </button>
            </div>
          )}

          {/* Application Form for Candidates */}
          {user?.role === 'CANDIDATE' && !hasApplied && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Ứng tuyển cho vị trí này
              </h4>

              {/* CV Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Chọn CV đính kèm:
                </label>
                {documents.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.originalFilename} {d.isDefault ? '(Mặc định)' : ''} ({(d.sizeBytes / 1024).toFixed(0)} KB)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                    Bạn chưa tải CV lên thư viện. Hệ thống sẽ tạo đơn với thông tin hồ sơ của bạn.
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Thư giới thiệu (Cover Letter - Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Giới thiệu ngắn gọn lý do bạn phù hợp với vị trí này..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Messages */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Already Applied Message */}
          {hasApplied && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-sm font-bold">Bạn đã ứng tuyển vị trí này</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Trạng thái hiện tại: <span className="font-bold underline">{appliedStatus || 'APPLIED'}</span>. Kiểm tra tab "Đơn của tôi" để theo dõi quy trình phỏng vấn.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Đóng
          </button>

          {user?.role === 'CANDIDATE' && !hasApplied && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isApplying ? 'Đang gửi đơn...' : 'Xác nhận nộp đơn ứng tuyển'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
