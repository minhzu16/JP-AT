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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-obsidian-surface/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-7">
          <div
            onClick={() => setActiveTab('jobs')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-mono font-black text-sm tracking-tighter border border-slate-700/50 shadow-sm transition-transform group-hover:scale-105">
              CV
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-950 dark:text-white uppercase font-sans">
                Career<span className="text-cobalt-600 dark:text-cobalt-400">Vanguard</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                ATS Terminal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'jobs'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              Khám phá việc làm
            </button>

            {user?.role === 'CANDIDATE' && (
              <>
                <button
                  onClick={() => setActiveTab('my-applications')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'my-applications'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  Đơn ứng tuyển
                </button>
                <button
                  onClick={() => setActiveTab('saved-jobs')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'saved-jobs'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  Tin đã lưu
                </button>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'resumes'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  Hồ sơ kỹ thuật
                </button>
                <button
                  onClick={() => setActiveTab('ai-matching')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    activeTab === 'ai-matching'
                      ? 'bg-cobalt-600 text-white shadow-sm'
                      : 'text-cobalt-600 hover:bg-cobalt-50 dark:text-cobalt-400 dark:hover:bg-cobalt-950/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>So khớp kỹ năng</span>
                </button>
              </>
            )}

            {user?.role === 'RECRUITER' && (
              <>
                <button
                  onClick={() => setActiveTab('ats-pipeline')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                    activeTab === 'ats-pipeline'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>ATS Pipeline</span>
                </button>
                <button
                  onClick={() => setActiveTab('recruiter-jobs')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'recruiter-jobs'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  Quản lý tin đăng
                </button>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
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
