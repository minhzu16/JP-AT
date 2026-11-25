'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { JobItem } from './JobCard';
import { useAuth } from '../lib/auth-context';
import { fetchApi } from '../lib/api';
import { JobDossierHeader } from './job-dossier/JobDossierHeader';
import { InlineApplyTray, ResumeDocument } from './job-dossier/InlineApplyTray';

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
  const [documents, setDocuments] = useState<ResumeDocument[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyTray, setShowApplyTray] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (job && user?.role === 'CANDIDATE') {
      fetchApi<ResumeDocument[]>('/me/documents')
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
    } catch (err: unknown) {
      const error = err as { code?: string; status?: number; detail?: string };
      if (error.code === 'ALREADY_APPLIED' || error.status === 409) {
        setErrorMsg('Bạn đã nộp đơn cho vị trí này. Hệ thống đã lưu trữ bản ghi trước đó.');
      } else {
        setErrorMsg(error.detail || 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại.');
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

      <JobDossierHeader
        job={job}
        userRole={user?.role}
        hasApplied={hasApplied}
        appliedStatus={appliedStatus}
        isSaved={isSaved}
        showApplyTray={showApplyTray}
        copiedLink={copiedLink}
        onToggleSave={onToggleSave}
        onToggleApplyTray={() => setShowApplyTray(!showApplyTray)}
        onOpenAiMatch={onOpenAiMatch}
        onCopyLink={handleCopyLink}
      />

      {showApplyTray && (
        <InlineApplyTray
          documents={documents}
          selectedResumeId={selectedResumeId}
          coverLetter={coverLetter}
          isApplying={isApplying}
          errorMsg={errorMsg}
          onSelectResume={setSelectedResumeId}
          onCoverLetterChange={setCoverLetter}
          onSubmit={handleApply}
          onCancel={() => setShowApplyTray(false)}
        />
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
