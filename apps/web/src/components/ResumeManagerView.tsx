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
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Hồ sơ & Quản lý CV
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin ứng viên, kỹ năng cá nhân và các phiên bản CV đính kèm.
        </p>
      </div>

      {/* Candidate Profile Summary */}
      {profile && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile.fullName}
              </h3>
              <p className="text-xs text-brand-600 font-semibold mt-0.5">
                {profile.headline || 'Lập trình viên'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {profile.location || 'Việt Nam'} • {profile.yearsExperience} năm kinh nghiệm
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 self-start">
              Hồ sơ công khai
            </span>
          </div>

          {profile.summary && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              {profile.summary}
            </p>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kỹ năng đã khai báo ({profile.skills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((s: any) => (
                <span
                  key={s.id}
                  className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200/60 dark:border-brand-800/60"
                >
                  {s.skill.name} • Level {s.level}/5 ({s.years} năm)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload New CV Box */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
          <Upload className="w-5 h-5 text-brand-600 mr-2" />
          Tải lên bản CV mới (PDF / DOCX)
        </h3>
        <p className="text-xs text-slate-500">
          Hệ thống tự động quét virus (ClamAV), băm SHA-256 xác thực và lưu trữ bảo mật (Private Storage).
        </p>

        <form onSubmit={handleSimulatedUpload} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCvName}
            onChange={(e) => setNewCvName(e.target.value)}
            placeholder="Tên file CV (Vd: Tran_Minh_Quan_CV_2026.pdf)..."
            required
            className="flex-1 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
          />
          <button
            type="submit"
            disabled={isUploading || !newCvName.trim()}
            className="px-5 py-3 text-xs font-bold rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isUploading ? 'Đang tải lên...' : 'Tải lên CV'}</span>
          </button>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Thư viện CV của bạn ({documents.length})
        </h3>

        {documents.map((doc) => (
          <div
            key={doc.id}
            className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {doc.originalFilename}
                  </h4>
                  {doc.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>{(doc.sizeBytes / 1024).toFixed(0)} KB</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                    Quét an toàn: {doc.scanStatus}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[10px]">
                    SHA256: {doc.sha256 ? doc.sha256.slice(0, 12) + '...' : '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              {!doc.isDefault && (
                <button
                  onClick={() => handleSetDefault(doc.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Đặt mặc định</span>
                </button>
              )}

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
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
