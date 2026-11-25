'use client';

import React, { useState, useEffect } from 'react';
import { listJobs, updateJobStatus, AdminJob, AdminJobStatus } from '../../lib/admin-api';
import { ApiError } from '../../lib/api';

export function AdminJobsPanel() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminJobStatus | ''>('');
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        setDebouncedSearch(search);
        setPage(1);
      }
    }, 300);
    return () => { ignore = true; clearTimeout(timer); };
  }, [search]);

  useEffect(() => {
    let ignore = false;
    listJobs({ search: debouncedSearch || undefined, status: statusFilter || undefined, page, pageSize })
      .then((res) => {
        if (!ignore) {
          setJobs(res.items);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError((err as ApiError)?.detail || 'Lỗi khi tải danh sách tin tuyển dụng');
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [debouncedSearch, statusFilter, page, reloadKey]);

  const handleStatusChange = (id: string, newStatus: AdminJobStatus) => {
    setError(null);
    setSuccess(null);
    setUpdatingId(id);
    updateJobStatus(id, newStatus)
      .then(() => {
        setSuccess('Cập nhật trạng thái tin thành công');
        setReloadKey((k) => k + 1);
      })
      .catch((err: unknown) => {
        setError((err as ApiError)?.detail || 'Lỗi cập nhật trạng thái tin');
      })
      .finally(() => { setUpdatingId(null); });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface p-5 space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
          placeholder="Tìm kiếm tin tuyển dụng theo tiêu đề..."
          aria-label="Tìm tin tuyển dụng"
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            aria-label="Lọc theo trạng thái"
            onChange={(e) => { setStatusFilter(e.target.value as AdminJobStatus | ''); setPage(1); setLoading(true); }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
      </div>

      {error && <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-medium">{error}</div>}
      {success && <div role="status" className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-medium">{success}</div>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
            <tr>
              <th className="p-3 font-medium">Tiêu đề</th>
              <th className="p-3 font-medium">Công ty</th>
              <th className="p-3 font-medium">Trạng thái</th>
              <th className="p-3 font-medium">Ngày đăng</th>
              <th className="p-3 font-medium text-right">Đổi trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Đang tải danh sách tin tuyển dụng...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Không tìm thấy tin tuyển dụng phù hợp</td></tr>
            ) : (
              jobs.map((job) => {
                const isUpdating = updatingId === job.id;
                const badgeClass = job.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50'
                  : job.status === 'CLOSED'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/50'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50';
                const badgeText = job.status === 'PUBLISHED' ? 'Đã xuất bản' : job.status === 'CLOSED' ? 'Đã đóng' : 'Bản nháp';

                return (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{job.title}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{job.company?.name || '---'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${badgeClass}`}>{badgeText}</span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('vi-VN') : 'Chưa đăng'}
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={job.status}
                        disabled={isUpdating}
                        aria-label="Đổi trạng thái tin"
                        onChange={(e) => handleStatusChange(job.id, e.target.value as AdminJobStatus)}
                        className="bg-transparent text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
                      >
                        <option value="DRAFT">Bản nháp</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                        <option value="CLOSED">Đã đóng</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-500 dark:text-slate-400">Trang {page} / {totalPages}</span>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => { setPage((p) => Math.max(1, p - 1)); setLoading(true); }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
          >
            Trước
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => { setPage((p) => p + 1); setLoading(true); }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
