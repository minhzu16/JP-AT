const API_BASE = '/api/v1';

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
  timestamp?: string;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jobportal_token') : null;

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
    headers,
  });

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      errorData = { detail: res.statusText, status: res.status, title: 'Request Error' };
    }
    const err: ApiError = {
      status: res.status,
      title: errorData.title || 'Error',
      detail: errorData.detail || errorData.message || 'Something went wrong',
      code: errorData.code,
    };
    throw err;
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
