import { z } from 'zod';
import {
  Role,
  JobStatus,
  WorkMode,
  EmploymentType,
  JobLevel,
  ApplicationStatus,
  DocumentKind,
  InterviewStatus,
  InterviewMode,
} from './enums.js';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Email is invalid').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  role: z.enum([Role.CANDIDATE, Role.RECRUITER]),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  companyName: z.string().optional(), // If recruiter creating a new company
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Email is invalid').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

// Candidate Profile Schemas
export const CandidateProfileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  headline: z.string().max(255).optional(),
  summary: z.string().max(5000).optional(),
  location: z.string().max(100).optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  visibility: z.boolean().default(true),
});
export type CandidateProfileUpdateInput = z.infer<typeof CandidateProfileUpdateSchema>;

export const CandidateSkillItemSchema = z.object({
  skillId: z.string().uuid(),
  level: z.number().int().min(1).max(5).default(3),
  years: z.number().min(0).max(50).default(1),
});
export const CandidateSkillsUpdateSchema = z.object({
  skills: z.array(CandidateSkillItemSchema),
});
export type CandidateSkillsUpdateInput = z.infer<typeof CandidateSkillsUpdateSchema>;

// Job Schemas
export const JobSkillInputSchema = z.object({
  skillId: z.string().uuid(),
  isRequired: z.boolean().default(true),
  weight: z.number().int().min(1).max(5).default(3),
});

export const JobCreateBaseSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required').max(100),
  workMode: z.nativeEnum(WorkMode).default(WorkMode.ONSITE),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  level: z.nativeEnum(JobLevel).default(JobLevel.MID),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  currency: z.string().default('VND'),
  skills: z.array(JobSkillInputSchema).default([]),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const JobCreateSchema = JobCreateBaseSchema.refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  {
    message: 'Minimum salary cannot exceed maximum salary',
    path: ['salaryMax'],
  }
);
export type JobCreateInput = z.infer<typeof JobCreateSchema>;

export const JobUpdateSchema = JobCreateBaseSchema.partial().extend({
  status: z.nativeEnum(JobStatus).optional(),
});
export type JobUpdateInput = z.infer<typeof JobUpdateSchema>;

export const JobFilterQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  level: z.nativeEnum(JobLevel).optional(),
  salaryMin: z.coerce.number().optional(),
  skillIds: z.union([z.string(), z.array(z.string())]).optional(),
  companyId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export type JobFilterQuery = z.infer<typeof JobFilterQuerySchema>;

// Application Schemas
export const ApplicationCreateSchema = z.object({
  jobId: z.string().uuid(),
  resumeDocumentId: z.string().uuid().optional().nullable(),
  coverLetter: z.string().max(3000).optional().nullable(),
});
export type ApplicationCreateInput = z.infer<typeof ApplicationCreateSchema>;

export const ApplicationTransitionSchema = z.object({
  toStatus: z.nativeEnum(ApplicationStatus),
  reason: z.string().max(500).optional(),
});
export type ApplicationTransitionInput = z.infer<typeof ApplicationTransitionSchema>;

export const ApplicationNoteSchema = z.object({
  body: z.string().min(1, 'Note content cannot be empty').max(2000),
});
export type ApplicationNoteInput = z.infer<typeof ApplicationNoteSchema>;

// Interview Schemas
export const InterviewCreateSchema = z.object({
  applicationId: z.string().uuid(),
  round: z.number().int().min(1).default(1),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().min(15).max(480).default(60),
  mode: z.nativeEnum(InterviewMode).default(InterviewMode.ONLINE),
  locationOrLink: z.string().min(1).max(500),
  interviewerNames: z.string().max(255).optional(),
});
export type InterviewCreateInput = z.infer<typeof InterviewCreateSchema>;

export const InterviewUpdateSchema = z.object({
  status: z.nativeEnum(InterviewStatus).optional(),
  feedback: z.string().max(2000).optional(),
  outcome: z.string().max(500).optional(),
  scheduledAt: z.string().datetime().optional(),
});
export type InterviewUpdateInput = z.infer<typeof InterviewUpdateSchema>;

// Document Schemas
export const PresignedUploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.enum([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]),
  sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024), // Max 10MB
  kind: z.nativeEnum(DocumentKind).default(DocumentKind.RESUME),
});
export type PresignedUploadRequestInput = z.infer<typeof PresignedUploadRequestSchema>;

export const DocumentConfirmSchema = z.object({
  storageKey: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  kind: z.nativeEnum(DocumentKind).default(DocumentKind.RESUME),
  isDefault: z.boolean().default(false),
});
export type DocumentConfirmInput = z.infer<typeof DocumentConfirmSchema>;
