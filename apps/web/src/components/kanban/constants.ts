export interface ColumnDef {
  id: string;
  title: string;
  dotColor: string;
  badgeBg: string;
  borderColor: string;
  glowClass: string;
}

export const COLUMNS: ColumnDef[] = [
  {
    id: 'APPLIED',
    title: 'Hồ sơ mới nộp',
    dotColor: 'bg-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500/30',
    glowClass: 'shadow-blue-500/10',
  },
  {
    id: 'SCREENING',
    title: 'Sơ tuyển & Duyệt',
    dotColor: 'bg-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    glowClass: 'shadow-indigo-500/10',
  },
  {
    id: 'INTERVIEW',
    title: 'Vòng Phỏng vấn',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500/30',
    glowClass: 'shadow-amber-500/10',
  },
  {
    id: 'OFFER',
    title: 'Đề nghị (Offer)',
    dotColor: 'bg-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderColor: 'border-purple-500/30',
    glowClass: 'shadow-purple-500/10',
  },
  {
    id: 'HIRED',
    title: 'Tuyển dụng thành công',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    glowClass: 'shadow-emerald-500/10',
  },
  {
    id: 'REJECTED',
    title: 'Từ chối / Lưu trữ',
    dotColor: 'bg-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderColor: 'border-rose-500/30',
    glowClass: 'shadow-rose-500/10',
  },
];

export function getInitials(name: string) {
  if (!name) return 'CV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name: string) {
  const colors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-violet-600 to-purple-600',
    'from-amber-600 to-orange-600',
    'from-cyan-600 to-blue-600',
    'from-rose-600 to-pink-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export interface CandidateInfo {
  fullName: string;
  headline?: string;
}

export interface MatchScoreInfo {
  score: number;
}

export interface InterviewInfo {
  round: number;
  [key: string]: unknown;
}

export interface ApplicationJobInfo {
  id?: string;
  title: string;
}

export interface ApplicationItem {
  id: string;
  status: string;
  appliedAt: string | Date;
  candidate?: CandidateInfo;
  job?: ApplicationJobInfo;
  matchScore?: MatchScoreInfo;
  interviews?: InterviewInfo[];
  _count?: {
    notes: number;
  };
}

export interface JobItem {
  id: string;
  title: string;
  _count?: {
    applications: number;
  };
}
