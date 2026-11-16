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
  Layers,
  Sparkle,
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#070A11]/80 backdrop-blur-xl transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <div
            onClick={() => setActiveTab('jobs')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[1px] shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center text-white font-mono font-black text-xs tracking-tighter">
                CV
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                  Career<span className="text-blue-600 dark:text-blue-400">Vanguard</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                ATS Terminal
              </span>
            </div>
          </div>

          {/* Navigation Items (Segmented Control Aesthetic) */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'jobs'
                  ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Khám phá việc làm
            </button>

            {user?.role === 'CANDIDATE' && (
              <>
                <button
                  onClick={() => setActiveTab('my-applications')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'my-applications'
                      ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Đơn ứng tuyển
                </button>
                <button
                  onClick={() => setActiveTab('saved-jobs')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'saved-jobs'
                      ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Tin đã lưu
                </button>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'resumes'
                      ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Hồ sơ kỹ thuật
                </button>
                <button
                  onClick={() => setActiveTab('ai-matching')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all duration-150 ${
                    activeTab === 'ai-matching'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>So khớp AI</span>
                </button>
              </>
            )}

            {user?.role === 'RECRUITER' && (
              <>
                <button
                  onClick={() => setActiveTab('ats-pipeline')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center space-x-1.5 ${
                    activeTab === 'ats-pipeline'
                      ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>ATS Pipeline</span>
                </button>
                <button
                  onClick={() => setActiveTab('recruiter-jobs')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'recruiter-jobs'
                      ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Quản lý tin đăng
                </button>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center space-x-1.5 ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-white dark:bg-white/[0.12] text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin & Audit</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Action: Demo Persona Switcher & Theme */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
            title="Giao diện Sáng/Tối"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="flex items-center space-x-2.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-white/[0.2] transition shadow-sm"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
                {user ? (
                  user.role === 'CANDIDATE' ? (
                    `Ứng viên: ${user.candidateProfile?.fullName?.split(' ').slice(-1)[0] || user.email.split('@')[0]}`
                  ) : user.role === 'RECRUITER' ? (
                    `NTD: ${user.company?.name || user.email.split('@')[0]}`
                  ) : (
                    'Quản trị viên'
                  )
                ) : (
                  'Khách'
                )}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showAccountDropdown && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowAccountDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Chuyển đổi vai trò demo
                  </span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-mono">
                    1-Click Switch
                  </span>
                </div>
                <div className="p-1.5 space-y-1">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isSelected = user?.email === acc.email;
                    return (
                      <button
                        key={acc.key}
                        onClick={() => switchDemoAccount(acc.key)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {acc.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {acc.label}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] bg-blue-600 text-white font-mono px-2 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 dark:border-white/[0.06] my-1" />
                  <button
                    onClick={() => switchDemoAccount('GUEST')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Xem với tư cách Khách (Chưa đăng nhập)</span>
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
