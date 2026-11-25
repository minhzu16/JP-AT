'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { listUsers, updateUser, AdminUser, AdminUserRole, UpdateUserBody } from '../../lib/admin-api';
import { ApiError } from '../../lib/api';

export function AdminUsersPanel() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
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
    listUsers({ search: debouncedSearch || undefined, role: roleFilter || undefined, status: statusFilter || undefined, page, pageSize })
      .then((res) => {
        if (!ignore) {
          setUsers(res.items);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError((err as ApiError)?.detail || 'Lỗi khi tải danh sách người dùng');
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [debouncedSearch, roleFilter, statusFilter, page, reloadKey]);

  const handleUpdate = (id: string, body: UpdateUserBody, msg: string) => {
    setError(null);
    setSuccess(null);
    setUpdatingId(id);
    updateUser(id, body)
      .then(() => { setSuccess(msg); setReloadKey((k) => k + 1); })
      .catch((err: unknown) => { setError((err as ApiError)?.detail || 'Lỗi cập nhật người dùng'); })
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
          placeholder="Tìm kiếm người dùng theo email..."
          aria-label="Tìm người dùng theo email"
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            aria-label="Lọc theo vai trò"
            onChange={(e) => { setRoleFilter(e.target.value as AdminUserRole | ''); setPage(1); setLoading(true); }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả vai trò</option>
            <option value="CANDIDATE">Ứng viên</option>
            <option value="RECRUITER">Nhà tuyển dụng</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
          <select
            value={statusFilter}
            aria-label="Lọc theo trạng thái"
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setLoading(true); }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="SUSPENDED">Đã khoá</option>
            <option value="ERASED">Đã xoá</option>
          </select>
        </div>
      </div>

      {error && <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-medium">{error}</div>}
      {success && <div role="status" className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-medium">{success}</div>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-obsidian-card text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
            <tr>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Vai trò</th>
              <th className="p-3 font-medium">Trạng thái</th>
              <th className="p-3 font-medium">Ngày tạo</th>
              <th className="p-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Đang tải danh sách người dùng...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Không tìm thấy người dùng phù hợp</td></tr>
            ) : (
              users.map((u) => {
                const isSelf = user?.id === u.id;
                const isRowDisabled = isSelf || u.status === 'ERASED' || updatingId === u.id;
                const selfTitle = isSelf ? 'Không thể tự thay đổi tài khoản của mình' : undefined;
                const badgeClass = u.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50'
                  : u.status === 'SUSPENDED'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/50'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/50';
                const badgeText = u.status === 'ACTIVE' ? 'Hoạt động' : u.status === 'SUSPENDED' ? 'Đã khoá' : u.status === 'ERASED' ? 'Đã xoá' : u.status;
                const btnClass = u.status === 'ACTIVE'
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900';

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                      {u.email}
                      {isSelf && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50">Bạn</span>}
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        disabled={isRowDisabled}
                        title={selfTitle}
                        aria-label={`Vai trò của ${u.email}`}
                        onChange={(e) => handleUpdate(u.id, { role: e.target.value as AdminUserRole }, 'Cập nhật vai trò thành công')}
                        className="bg-transparent text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                      >
                        <option value="CANDIDATE">Ứng viên</option>
                        <option value="RECRUITER">Nhà tuyển dụng</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${badgeClass}`}>{badgeText}</span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        disabled={isRowDisabled}
                        title={selfTitle}
                        onClick={() => handleUpdate(u.id, { status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }, u.status === 'ACTIVE' ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${btnClass}`}
                      >
                        {u.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'}
                      </button>
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
