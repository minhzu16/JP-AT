'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Building,
  Target,
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Phân tích & Gợi ý nâng cấp CV (AI)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vị trí: <span className="font-semibold text-slate-700 dark:text-slate-200">{jobTitle || data?.job?.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Đang ẩn danh hóa dữ liệu & so khớp kỹ năng...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs">
              {error}
            </div>
          ) : (
            <>
              {/* Match Score Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Điểm số tương thích kỹ năng
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                      {data?.score}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({data?.breakdown?.hasAllRequired ? 'Đạt đủ kỹ năng bắt buộc' : 'Thiếu một số kỹ năng bắt buộc'})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
                    <Target className="w-3.5 h-3.5 mr-1" />
                    Chỉ mang tính tham khảo
                  </span>
                </div>
              </div>

              {/* Matched Skills */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
                  Kỹ năng bạn đã sở hữu ({data?.breakdown?.matched?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data?.breakdown?.matched?.map((m: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                    >
                      {m.name} {m.isRequired ? '(Bắt buộc)' : ''}
                    </span>
                  ))}
                  {(!data?.breakdown?.matched || data.breakdown.matched.length === 0) && (
                    <span className="text-xs text-slate-400 italic">Chưa có kỹ năng nào trùng khớp trong hồ sơ.</span>
                  )}
                </div>
              </div>

              {/* Missing Required Skills */}
              {data?.breakdown?.missingRequired?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2.5 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5" />
                    Kỹ năng bắt buộc còn thiếu ({data.breakdown.missingRequired.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.breakdown.missingRequired.map((m: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Constructive AI Suggestions */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center">
                  <Lightbulb className="w-4 h-4 text-amber-500 mr-1.5" />
                  Gợi ý tối ưu hồ sơ cho vị trí này
                </h4>
                <div className="space-y-2.5">
                  {feedbackData?.suggestions?.map((sug: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start space-x-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Bias & Privacy Guarantee Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex items-start space-x-2.5 text-xs text-indigo-800 dark:text-indigo-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Cam kết công bằng & Không thiên lệch: </span>
                  Mọi dữ liệu cá nhân (tên, số điện thoại, ngày sinh, giới tính) đã được làm mờ (redact) trước khi xử lý. Hệ thống không bao giờ tự động loại bỏ hồ sơ ứng viên; mọi quyết định phỏng vấn đều được đánh giá bởi hội đồng tuyển dụng của công ty.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
