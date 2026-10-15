'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Sparkles,
  Bookmark,
  Share2,
  Clock,
  Layers,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { JobItem, formatSalary } from './JobCard';
import { useAuth } from '../lib/auth-context';
import { fetchApi } from '../lib/api';

export function JobDossier({
  job,
  hasApplied,
  appliedStatus,
  isSaved,
  onToggleSave,
  onApplySuccess,
  onOpenAiMatch,
  onBackToList,
}: {
  job: JobItem | null;
  hasApplied: boolean;
  appliedStatus?: string;
  isSaved: boolean;
  onToggleSave: (jobId: string, current: boolean) => void;
  onApplySuccess: () => void;
  onOpenAiMatch: (job: JobItem) => void;
  onBackToList?: () => void;
}) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyTray, setShowApplyTray] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (job && user?.role === 'CANDIDATE') {
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
    setShowApplyTray(false);
  }, [job?.id, user]);

  if (!job) {
    return (
      <div className="h-full min-h-[460px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-obsidian-surface/50">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Briefcase className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Chưa chọn tin tuyển dụng
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Chọn một vị trí từ danh sách bên trái để kiểm tra hồ sơ kỹ thuật, ma trận kỹ năng và nộp đơn trực tiếp.
        </p>
      </div>
    );
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
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
          coverLetter: coverLetter.trim() || null,
        }),
      });

      setSuccessMsg('Nộp đơn ứng tuyển thành công! Hồ sơ đã được chuyển tới ATS của nhà tuyển dụng.');
      setShowApplyTray(false);
      onApplySuccess();
    } catch (err: any) {
      if (err.code === 'ALREADY_APPLIED' || err.status === 409) {
        setErrorMsg('Bạn đã nộp đơn cho vị trí này. Hệ thống ngăn chặn nộp trùng lặp.');
      } else {
        setErrorMsg(err.detail || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + `?jobId=${job.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const requiredSkills = job.skills.filter((s) => s.isRequired);
  const optionalSkills = job.skills.filter((s) => !s.isRequired);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface shadow-sm overflow-hidden flex flex-col">
      {/* Mobile Back Button */}
      {onBackToList && (
        <div className="lg:hidden px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-obsidian-card flex items-center">
          <button
            onClick={onBackToList}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
              {job.company.logoKey ? (
                <img
                  src={job.company.logoKey}
                  alt={job.company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {job.company.name}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40">
                  Verified
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {job.title}
              </h2>
            </div>
          </div>

          {/* Top Actions: Bookmark & Share */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {user?.role === 'CANDIDATE' && (
              <button
                onClick={() => onToggleSave(job.id, isSaved)}
                className={`p-2 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title={isSaved ? 'Bỏ lưu việc' : 'Lưu tin tuyển dụng'}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Sao chép đường dẫn"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Technical Role Meta Tags */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Mức lương dự kiến</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block tabular-nums">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Địa điểm</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
              {job.location}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Mô hình làm việc</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {job.workMode} • {job.employmentType}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-obsidian-card border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Cấp bậc</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {job.level}
            </span>
          </div>
        </div>

        {/* Primary Action Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {hasApplied ? (
              <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Đã nộp đơn ({appliedStatus || 'APPLIED'})</span>
              </div>
            ) : user?.role === 'CANDIDATE' ? (
              <button
                onClick={() => setShowApplyTray(!showApplyTray)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-cobalt-600 hover:bg-cobalt-700 text-white shadow-sm transition flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showApplyTray ? 'Đóng đơn ứng tuyển' : 'Nộp đơn ngay'}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                (Đăng nhập tài khoản Ứng viên để nộp đơn)
              </span>
            )}

            {user?.role === 'CANDIDATE' && (
              <button
                onClick={() => onOpenAiMatch(job)}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>So khớp kỹ năng & CV</span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Cập nhật: {new Date(job.publishedAt).toLocaleDateString('vi-VN')}
          </div>
        </div>

        {copiedLink && (
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Đã sao chép liên kết vào clipboard.
          </div>
        )}
      </div>

      {/* Inline Application Tray */}
      {showApplyTray && (
        <div className="p-5 bg-slate-50 dark:bg-obsidian-card border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-150">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Hồ sơ nộp trực tiếp vào hệ thống ATS
          </h3>

          <form onSubmit={handleApply} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Chọn CV đã tải lên trong hệ thống
              </label>
              {documents.length === 0 ? (
                <div className="text-xs text-amber-600 dark:text-amber-400 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  Bạn chưa có file CV trong hồ sơ. Hệ thống sẽ ghi nhận thông tin tài khoản hoặc bạn có thể vào tab "Hồ sơ kỹ thuật" để tải lên file PDF.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.fileName} {doc.isDefault ? '(Mặc định)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Thư ngỏ / Ghi chú năng lực (Cover note)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tóm tắt ngắn gọn các dự án hoặc điểm mạnh kỹ thuật phù hợp với vai trò này..."
                rows={3}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cobalt-500 resize-none"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowApplyTray(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isApplying}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-cobalt-600 hover:bg-cobalt-700 text-white shadow-sm transition disabled:opacity-50"
              >
                {isApplying ? 'Đang gửi hồ sơ...' : 'Xác nhận nộp đơn'}
              </button>
            </div>
          </form>
        </div>
      )}

      {successMsg && (
        <div className="m-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Dossier Scrollable Body */}
      <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Technical Skill Matrix */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Layers className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ma trận kỹ năng chuyên môn
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* Required Skills */}
            {requiredSkills.length > 0 && (
              <div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Kỹ năng bắt buộc (Must-have):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((s) => (
                    <div
                      key={s.skill.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-cobalt-50 dark:bg-cobalt-950/60 text-cobalt-700 dark:text-cobalt-300 border border-cobalt-200/70 dark:border-cobalt-800/60 flex items-center space-x-1.5"
                    >
                      <span>{s.skill.name}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-cobalt-100 dark:bg-cobalt-900/80 text-cobalt-800 dark:text-cobalt-200">
                        w:{s.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Skills */}
            {optionalSkills.length > 0 && (
              <div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Kỹ năng bổ trợ / Ưu tiên (Nice-to-have):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {optionalSkills.map((s) => (
                    <div
                      key={s.skill.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 flex items-center space-x-1.5"
                    >
                      <span>{s.skill.name}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        w:{s.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Role Specifications */}
        <div>
          <div className="flex items-center space-x-2 mb-2.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Mô tả công việc & Yêu cầu chi tiết
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50/50 dark:bg-obsidian-card p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 font-sans">
            {job.description}
          </div>
        </div>

        {/* Compliance & Anti-bias notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Cam kết công bằng & Bảo mật dữ liệu:
            </span>{' '}
            Hồ sơ ứng tuyển được bảo vệ theo Luật An toàn & Bảo vệ dữ liệu cá nhân 91/2025/QH15. Hệ thống không sử dụng thuật toán AI tự động loại trừ ứng viên (AI ban). Đánh giá dựa trên năng lực thực tế.
          </div>
        </div>
      </div>
    </div>
  );
}
