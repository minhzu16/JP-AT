const API_BASE = '/api/v1';

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
  timestamp?: string;
}

interface ApiErrorBody {
  title?: string;
  detail?: string;
  message?: string;
  code?: string;
  status?: number;
}

let inMemoryToken: string | null = null;

export function setToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jobportal_token'); // Ensure token is never stored in localStorage (XSS protection)
  }
}

export function getToken(): string | null {
  return inMemoryToken;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processRefreshQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

export async function silentRefreshToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }
  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      setToken(null);
      processRefreshQueue(null);
      return null;
    }
    const data = (await res.json()) as { accessToken?: string };
    const newToken = data.accessToken || null;
    setToken(newToken);
    processRefreshQueue(newToken);
    return newToken;
  } catch {
    setToken(null);
    processRefreshQueue(null);
    return null;
  } finally {
    isRefreshing = false;
  }
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (
    res.status === 401 &&
    !(options as { _retry?: boolean })._retry &&
    !endpoint.includes('/auth/login') &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/register')
  ) {
    const refreshed = await silentRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      const retryRes = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });
      if (retryRes.ok) {
        if (retryRes.status === 204) return {} as T;
        return retryRes.json();
      }
    }
  }

  if (!res.ok) {
    let errorData: ApiErrorBody = {};
    try {
      errorData = (await res.json()) as ApiErrorBody;
    } catch {
      errorData = { detail: res.statusText, status: res.status, title: 'Request Error' };
    }
    const title = typeof errorData.title === 'string' ? errorData.title : 'Error';
    const detail = typeof errorData.detail === 'string'
      ? errorData.detail
      : typeof errorData.message === 'string'
      ? errorData.message
      : 'Something went wrong';
    const code = typeof errorData.code === 'string' ? errorData.code : undefined;
    const err: ApiError = {
      status: res.status,
      title,
      detail,
      code,
    };
    throw err;
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
