'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, DEMO_ACCOUNTS } from '../lib/auth-context';
import {
  Briefcase,
  UserCheck,
  Building2,
  FileText,
  Bookmark,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { user, switchDemoAccount, logout } = useAuth();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <div
            onClick={() => setActiveTab('jobs')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300 bg-clip-text text-transparent">
                CareerVanguard
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                Job & ATS
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Tìm việc làm
            </button>

            {user?.role === 'CANDIDATE' && (
              <>
                <button
                  onClick={() => setActiveTab('my-applications')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'my-applications'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Đơn của tôi
                </button>
                <button
                  onClick={() => setActiveTab('saved-jobs')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'saved-jobs'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Job đã lưu
                </button>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'resumes'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Hồ sơ & CV
                </button>
                <button
                  onClick={() => setActiveTab('ai-matching')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors ${
                    activeTab === 'ai-matching'
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-300'
                      : 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Matching</span>
                </button>
              </>
            )}

            {user?.role === 'RECRUITER' && (
              <>
                <button
                  onClick={() => setActiveTab('ats-pipeline')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'ats-pipeline'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>ATS Pipeline (Kanban)</span>
                </button>
                <button
                  onClick={() => setActiveTab('recruiter-jobs')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'recruiter-jobs'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Quản lý tin đăng
                </button>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin & Audit</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Action: Demo Persona Switcher & Theme */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Giao diện Sáng/Tối"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user ? (
                  user.role === 'CANDIDATE' ? (
                    `Ứng viên: ${user.candidateProfile?.fullName || user.email}`
                  ) : user.role === 'RECRUITER' ? (
                    `NTD: ${user.company?.name || user.email}`
                  ) : (
                    'Quản trị viên (Admin)'
                  )
                ) : (
                  'Khách vãng lai (Guest)'
                )}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showAccountDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowAccountDropdown(false)}
              >
                <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Chuyển đổi tài khoản thử nghiệm
                </div>
                <div className="py-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.key}
                      onClick={() => switchDemoAccount(acc.key)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                        user?.email === acc.email
                          ? 'font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.label}</div>
                      </div>
                      {user?.email === acc.email && (
                        <span className="text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded">
                          Đang chọn
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => switchDemoAccount('GUEST')}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất (Xem với tư cách Khách)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
