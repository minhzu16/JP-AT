'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchApi, setToken as setApiToken, silentRefreshToken } from './api';

export interface UserProfile {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  candidateProfile?: {
    id: string;
    fullName: string;
    headline?: string;
    location?: string;
    yearsExperience?: number;
  };
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  companyMemberRole?: string;
}

export const DEMO_ACCOUNTS = [
  {
    key: 'CANDIDATE_1',
    name: 'Trần Minh Quân',
    role: 'CANDIDATE',
    email: 'candidate1@gmail.com',
    label: 'Ứng viên: Minh Quân (Senior Full-stack)',
  },
  {
    key: 'CANDIDATE_2',
    name: 'Lê Thị Thu Hà',
    role: 'CANDIDATE',
    email: 'candidate2@gmail.com',
    label: 'Ứng viên: Thu Hà (Frontend Dev)',
  },
  {
    key: 'RECRUITER_VNG',
    name: 'VNG Recruiter',
    role: 'RECRUITER',
    email: 'recruiter.vng@gmail.com',
    label: 'Tuyển dụng: VNG Corporation',
  },
  {
    key: 'RECRUITER_FPT',
    name: 'FPT Recruiter',
    role: 'RECRUITER',
    email: 'recruiter.fpt@gmail.com',
    label: 'Tuyển dụng: FPT Software',
  },
  {
    key: 'ADMIN',
    name: 'Platform Admin',
    role: 'ADMIN',
    email: 'admin@jobportal.vn',
    label: 'Quản trị viên (Admin)',
  },
];

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (key: string) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      delete localStorage['jobportal_has_session'];
      localStorage.removeItem('jobportal_has_session');
    }
    setApiToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async (authToken?: string) => {
    try {
      const data = await fetchApi<UserProfile>('/auth/me', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setUser(data);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        if (typeof window !== 'undefined') {
          delete localStorage['jobportal_has_session'];
          localStorage.removeItem('jobportal_has_session');
        }
      }
      setUser(null);
      setApiToken(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password = 'Password123!@#') => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ accessToken: string; user: UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (typeof window !== 'undefined') {
        localStorage['jobportal_has_session'] = '1';
      }
      setApiToken(res.accessToken);
      setToken(res.accessToken);
      await fetchCurrentUser(res.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);

  const switchDemoAccount = useCallback(async (accountKey: string) => {
    if (accountKey === 'GUEST') {
      await logout();
      return;
    }
    const acc = DEMO_ACCOUNTS.find((a) => a.key === accountKey);
    if (acc) {
      await login(acc.email, 'Password123!@#');
    }
  }, [login, logout]);

  useEffect(() => {
    const hasSession =
      typeof window !== 'undefined' &&
      localStorage['jobportal_has_session'] === '1';

    if (!hasSession) {
      setIsLoading(false);
      return;
    }

    silentRefreshToken()
      .then((restoredToken) => {
        if (restoredToken) {
          if (typeof window !== 'undefined') {
            localStorage['jobportal_has_session'] = '1';
          }
          setToken(restoredToken);
          fetchCurrentUser(restoredToken);
        } else {
          if (typeof window !== 'undefined') {
            delete localStorage['jobportal_has_session'];
            localStorage.removeItem('jobportal_has_session');
          }
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (err?.status === 401 || err?.status === 403 || !err?.status) {
          if (typeof window !== 'undefined') {
            delete localStorage['jobportal_has_session'];
            localStorage.removeItem('jobportal_has_session');
          }
        }
        setUser(null);
        setToken(null);
        setIsLoading(false);
      });
  }, [fetchCurrentUser]);

  const refreshMe = useCallback(async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  }, [token, fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoAccount,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
