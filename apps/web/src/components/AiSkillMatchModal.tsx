'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  FileCheck2,
  Cpu,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { fetchApi } from '../lib/api';

interface SkillItem {
  name: string;
  isRequired?: boolean;
}

interface SkillMatchBreakdown {
  hasAllRequired?: boolean;
  matched?: SkillItem[];
  missingRequired?: SkillItem[];
}

interface SkillMatchData {
  score: number;
  job?: {
    id?: string;
    title: string;
  };
  breakdown?: SkillMatchBreakdown;
}

interface AiFeedbackData {
  suggestions?: string[];
}

export function AiSkillMatchModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
}: {
  jobId: string | null;
  jobTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SkillMatchData | null>(null);
  const [feedbackData, setFeedbackData] = useState<AiFeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && jobId) {
      setLoading(true);
      setError(null);
      Promise.all([
        fetchApi<SkillMatchData>(`/matching/compare/${jobId}`),
        fetchApi<AiFeedbackData>(`/matching/ai-feedback/${jobId}`, { method: 'POST' }),
      ])
        .then(([compareRes, feedbackRes]) => {
          setData(compareRes);
          setFeedbackData(feedbackRes);
        })
        .catch((err) => {
          setError((err as { detail?: string })?.detail || 'Không thể tính toán so khớp kỹ năng lúc này.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, jobId]);

  if (!isOpen || !jobId) return null;

  const score = data?.score || 0;
  const isHighMatch = score >= 80;
  const isMidMatch = score >= 50;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col backdrop-blur-2xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  So khớp Năng lực Kỹ thuật (STAR Model)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50 font-medium">
                  EU AI Act • Điều 14
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vị trí: <span className="font-semibold text-slate-800 dark:text-slate-200">{jobTitle || data?.job?.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <Sparkles className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Đang ẩn danh hóa dữ liệu & phân tích Vector Semantic...
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kiểm tra độ tương thích theo mô hình STAR không thiên lệch
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          ) : (
            <>
              {/* Radial / Metric Gauge Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
                <div>
                  <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Điểm số tương thích kỹ năng
                  </span>
                  <div className="flex items-baseline space-x-3 mt-1.5">
                    <span
                      className={`text-4xl font-mono font-black tracking-tight tabular-nums ${
                        isHighMatch
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isMidMatch
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {score}%
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {data?.breakdown?.hasAllRequired
                        ? 'Đáp ứng đầy đủ yêu cầu cốt lõi của bài toán'
                        : 'Cần bổ sung một số kỹ năng tiên quyết'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-750 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHighMatch
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isMidMatch
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Khách quan 100%
                  </span>
                  <span className="text-[10px] mt-1 text-slate-400">
                    Trọng số: Core Skills (70%) + Exp (30%)
                  </span>
                </div>
              </div>

              {/* Matched Skills Pill Cluster */}
              <div>
                <div className="flex items-center space-x-2 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Kỹ năng hồ sơ của bạn đã đáp ứng ({data?.breakdown?.matched?.length || 0})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data?.breakdown?.matched?.map((m: SkillItem, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-medium flex items-center space-x-1.5 shadow-2xs"
                    >
                      <span>{m.name}</span>
                      {m.isRequired && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded-full">
                          Cốt lõi
                        </span>
                      )}
                    </span>
                  ))}
                  {(!data?.breakdown?.matched || data.breakdown.matched.length === 0) && (
                    <span className="text-xs text-slate-400 italic">
                      Chưa ghi nhận kỹ năng khớp trong hồ sơ lưu trữ.
                    </span>
                  )}
                </div>
              </div>

              {/* Missing Required Skills */}
              {data?.breakdown?.missingRequired && data.breakdown.missingRequired.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                      Kỹ năng tiên quyết cần bổ sung ({data.breakdown.missingRequired.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.breakdown.missingRequired.map((m: SkillItem, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-xs font-medium"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* STAR Actionable Advice Cards */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Khuyến nghị cải thiện hồ sơ theo mô hình STAR
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {feedbackData?.suggestions?.map((sug: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start space-x-3 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold shrink-0 text-xs mt-0.5 border border-blue-200/50 dark:border-blue-900/50">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethical AI & Human-in-the-Loop Statement */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Nguyên tắc kiểm soát bởi con người (Human-in-the-loop):{' '}
                  </span>
                  Độ khớp này chỉ mang tính tham khảo kỹ thuật nhằm giúp ứng viên hoàn thiện CV và chuẩn bị phỏng vấn tốt nhất. Toàn bộ quyết định tuyển dụng đều do đội ngũ nhân sự và ban lãnh đạo đưa ra, tuyệt đối không bị từ chối tự động bằng thuật toán (Tuân thủ Điều 14 EU AI Act & Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15).
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white transition shadow-xs"
          >
            Đóng báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
