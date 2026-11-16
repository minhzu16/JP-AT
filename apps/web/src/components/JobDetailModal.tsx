'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  ShieldCheck,
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

  const companyInitial = job.company?.name ? job.company.name.charAt(0).toUpperCase() : 'C';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col backdrop-blur-2xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {job.company?.logoKey ? (
                <Image
                  src={job.company.logoKey}
                  alt={job.company.name}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {companyInitial}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {job.title}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job.company?.name}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
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
        <div className="p-6 max-h-[66vh] overflow-y-auto space-y-6 custom-scrollbar">
          {/* Quick Highlight Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">Mức thu nhập</span>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">Hình thức</span>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {job.workMode}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">Cấp bậc</span>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {job.level}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">Hợp đồng</span>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {job.employmentType}
              </div>
            </div>
          </div>

          {/* Required Skills Matrix */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Bộ kỹ năng công nghệ yêu cầu
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <div
                  key={s.skill.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 border ${
                    s.isRequired
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{s.skill.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-bold">
                    w:{s.weight}
                  </span>
                  {s.isRequired && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      (Bắt buộc)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Mô tả vị trí & Mục tiêu bài toán
            </h4>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50/70 dark:bg-obsidian-card p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {job.description}
            </div>
          </div>

          {/* AI Matching Diagnostic Box */}
          {user?.role === 'CANDIDATE' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Kiểm tra độ tương thích năng lực với AI (STAR)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Đánh giá độ khớp khách quan, phát hiện kỹ năng còn thiếu trước khi gửi đơn.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAiMatch(job);
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition shrink-0 ml-3"
              >
                So khớp ngay
              </button>
            </div>
          )}

          {/* Application Form for Candidates */}
          {user?.role === 'CANDIDATE' && !hasApplied && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Gửi hồ sơ ứng tuyển
              </h4>

              {/* CV Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chọn CV đính kèm:
                </label>
                {documents.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.originalFilename} {d.isDefault ? '(Mặc định)' : ''} ({(d.sizeBytes / 1024).toFixed(0)} KB)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 border border-slate-200 dark:border-slate-700">
                    Bạn chưa tải CV lên thư viện hồ sơ. Hệ thống sẽ tạo đơn với dữ liệu kinh nghiệm trong tài khoản của bạn.
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Thông điệp gửi nhà tuyển dụng (Cover Letter - Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Nêu bật dự án tiêu biểu và lý do năng lực của bạn tạo ra giá trị cho công ty..."
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="text-sm font-bold">Hồ sơ đã được tiếp nhận thành công</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Trạng thái hiện tại: <span className="font-bold underline">{appliedStatus || 'APPLIED'}</span>. Nhà tuyển dụng sẽ gửi thông báo lịch phỏng vấn qua email và tab &quot;Đơn của tôi&quot;.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Đóng cửa sổ
          </button>

          {user?.role === 'CANDIDATE' && !hasApplied && (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isApplying ? 'Đang gửi hồ sơ...' : 'Xác nhận nộp đơn ứng tuyển'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
