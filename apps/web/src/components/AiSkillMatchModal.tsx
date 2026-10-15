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
  HelpCircle,
} from 'lucide-react';
import { fetchApi } from '../lib/api';

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
  const [data, setData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && jobId) {
      setLoading(true);
      setError(null);
      Promise.all([
        fetchApi(`/matching/compare/${jobId}`),
        fetchApi(`/matching/ai-feedback/${jobId}`, { method: 'POST' }),
      ])
        .then(([compareRes, feedbackRes]) => {
          setData(compareRes);
          setFeedbackData(feedbackRes);
        })
        .catch((err) => {
          setError(err.detail || 'Không thể tính toán so khớp lúc này.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, jobId]);

  if (!isOpen || !jobId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-obsidian-surface border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-obsidian-card">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cobalt-600 text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Báo cáo Phân tích Tương thích Hồ sơ & Kỹ thuật
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  EU AI Act Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vị trí: <span className="font-semibold text-slate-800 dark:text-slate-200">{jobTitle || data?.job?.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 border-2 border-cobalt-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Đang ẩn danh hóa dữ liệu & chạy thuật toán so khớp...</p>
            </div>
          ) : error ? (
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          ) : (
            <>
              {/* Technical Score Panel */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                    Độ tương thích kỹ năng tính toán
                  </span>
                  <div className="flex items-baseline space-x-2.5 mt-1">
                    <span className="text-3xl font-mono font-extrabold text-cobalt-600 dark:text-cobalt-400 tabular-nums">
                      {data?.score}%
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      ({data?.breakdown?.hasAllRequired ? 'Đạt toàn bộ kỹ năng cốt lõi' : 'Cần bổ sung một số kỹ năng yêu cầu'})
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Định lượng khách quan
                  </span>
                  <span className="text-[10px] mt-1 text-slate-400">
                    Trọng số: Kỹ năng cốt lõi chiếm 70%
                  </span>
                </div>
              </div>

              {/* Matched Skills */}
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Kỹ năng đã xác nhận trong hồ sơ ({data?.breakdown?.matched?.length || 0})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data?.breakdown?.matched?.map((m: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 text-xs font-medium"
                    >
                      {m.name} {m.isRequired ? '(Bắt buộc)' : ''}
                    </span>
                  ))}
                  {(!data?.breakdown?.matched || data.breakdown.matched.length === 0) && (
                    <span className="text-xs text-slate-400 italic">Chưa tìm thấy kỹ năng khớp trong hồ sơ đã lưu.</span>
                  )}
                </div>
              </div>

              {/* Missing Required Skills */}
              {data?.breakdown?.missingRequired?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                      Kỹ năng tiên quyết chưa có trong hồ sơ ({data.breakdown.missingRequired.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.breakdown.missingRequired.map((m: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Constructive AI Suggestions (STAR Method) */}
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Gợi ý tối ưu hóa mô tả kinh nghiệm (Phương pháp STAR)
                  </h4>
                </div>
                <div className="space-y-2">
                  {feedbackData?.suggestions?.map((sug: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-obsidian-card border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start space-x-2.5"
                    >
                      <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono font-bold shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Human-in-the-loop Box */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-slate-600 dark:text-slate-300" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Nguyên tắc kiểm soát con người (Human-in-the-loop):{' '}
                  </span>
                  Báo cáo này đóng vai trò trợ lý tham khảo cho ứng viên nhằm tinh chỉnh CV. Hệ thống không thiết lập cơ chế tự động từ chối hồ sơ bằng thuật toán (Tuân thủ Điều 14 EU AI Act & Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15).
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-obsidian-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Đóng báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
