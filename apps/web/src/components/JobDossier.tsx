'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Check,
  Award,
  Zap,
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
  isSaved?: boolean;
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
  }, [job, user]);

  if (!job) {
    return (
      <div className="h-full min-h-[500px] rounded-3xl glass-panel flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
          <Briefcase className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Chưa chọn tin tuyển dụng
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm leading-relaxed">
          Chọn một vị trí kỹ thuật từ danh sách bên trái để khám phá ma trận yêu cầu chuyên môn, đánh giá năng lực AI và nộp đơn trực tiếp.
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

      setSuccessMsg('Nộp đơn ứng tuyển thành công! Hồ sơ đã được chuyển tiếp vào hệ thống ATS tuyển dụng.');
      setShowApplyTray(false);
      onApplySuccess();
    } catch (err: any) {
      if (err.code === 'ALREADY_APPLIED' || err.status === 409) {
        setErrorMsg('Bạn đã nộp đơn cho vị trí này. Hệ thống đã lưu trữ bản ghi trước đó.');
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
    <div className="rounded-3xl glass-panel shadow-xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-white/[0.08]">
      {/* Mobile Back Button */}
      {onBackToList && (
        <div className="lg:hidden px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] flex items-center">
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
      <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-white/[0.06] relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.1] flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {job.company.logoKey ? (
                <Image
                  src={job.company.logoKey}
                  alt={job.company.name}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-lg font-mono">
                  {job.company.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {job.company.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Doanh nghiệp xác thực
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                {job.title}
              </h2>
            </div>
          </div>

          {/* Top Actions: Bookmark & Share */}
          <div className="flex items-center space-x-2 shrink-0">
            {user?.role === 'CANDIDATE' && (
              <button
                onClick={() => onToggleSave(job.id, !!isSaved)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }`}
                title={isSaved ? 'Bỏ lưu' : 'Lưu tin'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
              title="Sao chép đường dẫn"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Technical Role Metric Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block font-mono">Thu nhập đề xuất</span>
            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block tabular-nums">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block font-mono">Địa điểm</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
              {job.location}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block font-mono">Mô hình</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
              {job.workMode} • {job.employmentType}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <span className="text-[11px] font-medium text-slate-400 block font-mono">Cấp bậc</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">
              {job.level}
            </span>
          </div>
        </div>

        {/* Primary Action Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            {hasApplied ? (
              <div className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700 shadow-sm">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                <span>Đã nộp đơn ({appliedStatus || 'APPLIED'})</span>
              </div>
            ) : user?.role === 'CANDIDATE' ? (
              <button
                onClick={() => setShowApplyTray(!showApplyTray)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showApplyTray ? 'Thu gọn đơn' : 'Nộp đơn ngay'}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-mono italic">
                (Đăng nhập tài khoản Ứng viên để nộp đơn trực tiếp)
              </span>
            )}

            {user?.role === 'CANDIDATE' && (
              <button
                onClick={() => onOpenAiMatch(job)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-500/30 dark:border-blue-400/30 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>So khớp năng lực AI</span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Đăng ngày: {new Date(job.publishedAt).toLocaleDateString('vi-VN')}
          </div>
        </div>

        {copiedLink && (
          <div className="mt-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Đã sao chép liên kết vào clipboard!</span>
          </div>
        )}
      </div>

      {/* Inline Application Tray */}
      {showApplyTray && (
        <div className="p-6 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-white/[0.08] animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Nộp hồ sơ trực tiếp vào hệ thống tuyển dụng
            </h3>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
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
                  onChange={(e) => setSelectedResumeId(e.target.value)}
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
                onChange={(e) => setCoverLetter(e.target.value)}
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
                onClick={() => setShowApplyTray(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Body Content */}
      <div className="p-6 sm:p-7 space-y-7 flex-1 overflow-y-auto">
        {/* Skills Evaluation Matrix */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Ma trận Năng lực & Công nghệ</span>
          </h3>

          <div className="mt-3.5 space-y-3">
            {requiredSkills.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono block mb-2">
                  Bắt buộc ({requiredSkills.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requiredSkills.map((s) => (
                    <div
                      key={s.skill.id}
                      className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {s.skill.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                        Trọng số: {s.weight}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {optionalSkills.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                  Ưu tiên / Lợi thế ({optionalSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {optionalSkills.map((s) => (
                    <span
                      key={s.skill.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]"
                    >
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-3">
            Mô tả Chi tiết Vị trí & Trách nhiệm
          </h3>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed space-y-2">
            {job.description}
          </div>
        </div>

        {/* Company Compliance & Safety */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-xs space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cam kết Bảo vệ Dữ liệu Cá nhân & Tuyển dụng Công bằng</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống áp dụng thuật toán so khớp kỹ năng tất định (Deterministic Skill Matching), tuân thủ Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân Việt Nam (91/2025/QH15). Ứng viên có quyền tra cứu toàn bộ hồ sơ hoặc yêu cầu xóa dữ liệu bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
}
