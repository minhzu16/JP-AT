import { fetchApi } from './api';

export type AdminUserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  status: string;
  createdAt: string;
}

export type AdminJobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface AdminJob {
  id: string;
  title: string;
  status: AdminJobStatus;
  publishedAt: string | null;
  createdAt: string;
  company: {
    name: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListUsersParams {
  search?: string;
  role?: AdminUserRole | '';
  status?: string;
  page?: number | string;
  pageSize?: number | string;
}

export interface UpdateUserBody {
  role?: AdminUserRole;
  status?: 'ACTIVE' | 'SUSPENDED';
}

export interface ListJobsParams {
  search?: string;
  status?: AdminJobStatus | '';
  page?: number | string;
  pageSize?: number | string;
}

function buildQuery(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export async function listUsers(params?: ListUsersParams): Promise<PaginatedResult<AdminUser>> {
  return fetchApi<PaginatedResult<AdminUser>>(
    `/admin/users${buildQuery(params as Record<string, string | number | undefined | null>)}`
  );
}

export async function updateUser(id: string, body: UpdateUserBody): Promise<AdminUser> {
  return fetchApi<AdminUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function listJobs(params?: ListJobsParams): Promise<PaginatedResult<AdminJob>> {
  return fetchApi<PaginatedResult<AdminJob>>(
    `/admin/jobs${buildQuery(params as Record<string, string | number | undefined | null>)}`
  );
}

export async function updateJobStatus(id: string, status: AdminJobStatus): Promise<AdminJob> {
  return fetchApi<AdminJob>(`/admin/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
