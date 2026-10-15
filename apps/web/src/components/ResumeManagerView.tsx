'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  Star,
  Trash2,
  ShieldCheck,
  Hash,
  Download,
  Plus,
} from 'lucide-react';
import { fetchApi } from '../lib/api';

export function ResumeManagerView() {
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newCvName, setNewCvName] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchApi('/me/profile'),
      fetchApi<any[]>('/me/documents'),
    ])
      .then(([prof, docs]) => {
        setProfile(prof);
        setDocuments(docs || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCvName.trim()) return;

    setIsUploading(true);
    try {
      const filename = newCvName.endsWith('.pdf') ? newCvName : `${newCvName}.pdf`;

      // 1. Get presigned upload URL
      const presigned = await fetchApi('/me/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          filename,
          mimeType: 'application/pdf',
          sizeBytes: 215000,
        }),
      });

      // 2. Confirm document metadata
      await fetchApi('/me/documents', {
        method: 'POST',
        body: JSON.stringify({
          storageKey: presigned.storageKey,
          originalFilename: filename,
          mimeType: 'application/pdf',
          sizeBytes: 215000,
          isDefault: documents.length === 0,
        }),
      });

      setNewCvName('');
      loadData();
    } catch (err: any) {
      alert(err.detail || 'Lỗi khi upload CV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetchApi(`/me/documents/${id}/set-default`, { method: 'POST' });
      loadData();
    } catch (err: any) {
      alert(err.detail || 'Không thể đặt làm mặc định');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa CV này?')) return;
    try {
      await fetchApi(`/me/documents/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.detail || 'Không thể xóa');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Hồ sơ Kỹ thuật & Thư viện CV
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quản lý tài liệu ứng tuyển, kỹ năng chuyên môn và chứng chỉ bảo mật của bạn.
        </p>
      </div>

      {/* Candidate Profile Summary */}
      {profile && (
        <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {profile.fullName}
              </h3>
              <p className="text-xs text-cobalt-600 dark:text-cobalt-400 font-medium mt-0.5">
                {profile.headline || 'Lập trình viên'}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-1">
                {profile.location || 'Việt Nam'} • {profile.yearsExperience} năm kinh nghiệm
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 self-start">
              Verified Profile
            </span>
          </div>

          {profile.summary && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-obsidian-card p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {profile.summary}
            </p>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Kỹ năng đã khai báo ({profile.skills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills?.map((s: any) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-md bg-cobalt-50 dark:bg-cobalt-950/60 text-cobalt-700 dark:text-cobalt-300 text-xs font-medium border border-cobalt-200/60 dark:border-cobalt-800/60"
                >
                  {s.skill.name} • Level {s.level}/5 ({s.years} năm)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload New CV Box */}
      <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
          <Upload className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400 mr-2" />
          Tải lên bản CV kỹ thuật mới (PDF)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hệ thống tự động quét an toàn (ClamAV), băm SHA-256 xác thực và lưu trữ bảo mật (Private Storage).
        </p>

        <form onSubmit={handleSimulatedUpload} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newCvName}
            onChange={(e) => setNewCvName(e.target.value)}
            placeholder="Tên file CV (Vd: Tran_Minh_Quan_CV_2026.pdf)..."
            required
            className="flex-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-obsidian-card p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
          />
          <button
            type="submit"
            disabled={isUploading || !newCvName.trim()}
            className="px-4 py-2.5 text-xs font-medium rounded-lg bg-cobalt-600 hover:bg-cobalt-700 text-white shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Đang tải lên...' : 'Tải lên CV'}</span>
          </button>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Thư viện CV của bạn ({documents.length})
        </h3>

        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-obsidian-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {doc.originalFilename}
                  </h4>
                  {doc.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 mt-1 font-mono">
                  <span>{(doc.sizeBytes / 1024).toFixed(0)} KB</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                    Quét: {doc.scanStatus}
                  </span>
                  <span>•</span>
                  <span className="text-[10px]">
                    SHA256: {doc.sha256 ? doc.sha256.slice(0, 12) + '...' : '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              {!doc.isDefault && (
                <button
                  onClick={() => handleSetDefault(doc.id)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1 transition"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Đặt mặc định</span>
                </button>
              )}

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Xóa CV"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
