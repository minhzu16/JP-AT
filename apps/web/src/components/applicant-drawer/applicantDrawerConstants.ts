export const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Ứng tuyển mới',
  SCREENING: 'Sơ loại hồ sơ',
  INTERVIEW: 'Phỏng vấn',
  OFFER: 'Đề nghị nhận việc',
  HIRED: 'Đã tuyển dụng',
  REJECTED: 'Từ chối',
  WITHDRAWN: 'Ứng viên đã rút đơn',
};

export const NEXT_ALLOWED: Record<string, string[]> = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['INTERVIEW', 'OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export interface NoteItem {
  id: string;
  body: string;
  author?: { fullName?: string; email?: string };
  createdAt: string;
}

export interface HistoryItem {
  id?: string;
  toStatus: string;
  fromStatus?: string;
  reason?: string;
  createdAt: string;
  actor?: { fullName?: string; email?: string };
}

export interface ApplicantCandidate {
  fullName: string;
  headline?: string | null;
  location?: string | null;
  yearsExperience?: number | null;
  summary?: string | null;
}

export interface ApplicantDetail {
  id: string;
  status: string;
  candidate: ApplicantCandidate;
  job?: {
    id?: string;
    title: string;
  };
  notes?: NoteItem[];
  history?: HistoryItem[];
}
