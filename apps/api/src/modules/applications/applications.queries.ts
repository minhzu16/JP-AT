import { ApplicationStatus } from '@jobportal/shared';
import { Prisma } from '@jobportal/db';

export const CANDIDATE_APPLICATION_INCLUDE = {
  job: { include: { company: true } },
  resume: true,
  history: { orderBy: { changedAt: 'desc' } },
  interviews: { orderBy: { scheduledAt: 'desc' } },
  matchScore: true,
} satisfies Prisma.ApplicationInclude;

export const RECRUITER_APPLICATIONS_INCLUDE = {
  job: { select: { id: true, title: true, location: true } },
  candidate: { include: { skills: { include: { skill: true } } } },
  resume: true,
  matchScore: true,
  history: { orderBy: { changedAt: 'desc' } },
  interviews: true,
  _count: { select: { notes: true } },
} satisfies Prisma.ApplicationInclude;

export const RECRUITER_APPLICATION_DETAIL_INCLUDE = {
  job: { include: { skills: { include: { skill: true } } } },
  candidate: { include: { skills: { include: { skill: true } } } },
  resume: true,
  history: {
    include: { changedBy: { select: { email: true } } },
    orderBy: { changedAt: 'desc' },
  },
  notes: {
    include: { author: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  },
  interviews: { orderBy: { scheduledAt: 'desc' } },
  matchScore: true,
} satisfies Prisma.ApplicationInclude;

interface JobSkillInput {
  isRequired: boolean;
  weight: number;
  skill: { id: string; name: string };
}

interface CandidateSkillInput {
  level: number;
  years: number;
  skill: { id: string; name: string };
}

export function mapSkillsForMatching(
  jobSkills: JobSkillInput[],
  candidateSkills: CandidateSkillInput[]
) {
  return {
    jobSkillsForMatch: jobSkills.map((js) => ({
      id: js.skill.id,
      name: js.skill.name,
      isRequired: js.isRequired,
      weight: js.weight,
    })),
    candSkillsForMatch: candidateSkills.map((cs) => ({
      id: cs.skill.id,
      name: cs.skill.name,
      level: cs.level,
      years: cs.years,
    })),
  };
}

export async function createApplicationInTx(
  tx: Prisma.TransactionClient,
  params: {
    jobId: string;
    candidateId: string;
    userId: string;
    resumeDocumentId: string | null | undefined;
    coverLetter: string | null | undefined;
    matchScore: number;
    matchBreakdown: unknown;
    modelVersion: string;
  }
) {
  const app = await tx.application.create({
    data: {
      jobId: params.jobId,
      candidateId: params.candidateId,
      resumeDocumentId: params.resumeDocumentId,
      coverLetter: params.coverLetter,
      status: ApplicationStatus.APPLIED,
    },
  });

  await tx.applicationStatusHistory.create({
    data: {
      applicationId: app.id,
      fromStatus: ApplicationStatus.APPLIED,
      toStatus: ApplicationStatus.APPLIED,
      changedById: params.userId,
      reason: 'Application submitted by candidate',
    },
  });

  await tx.matchScore.create({
    data: {
      applicationId: app.id,
      score: params.matchScore,
      breakdown: JSON.stringify(params.matchBreakdown),
      modelVersion: params.modelVersion,
    },
  });

  return app;
}
