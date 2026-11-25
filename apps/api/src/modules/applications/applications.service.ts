import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApplicationStatus,
  Role,
  validateApplicationTransition,
  calculateSkillMatch,
  ApplicationCreateInput,
  ApplicationTransitionInput,
  ApplicationNoteInput,
  JobStatus,
} from '@jobportal/shared';
import { Prisma } from '@jobportal/db';
import { AuditService } from '../audit/audit.service';
import {
  CANDIDATE_APPLICATION_INCLUDE,
  RECRUITER_APPLICATIONS_INCLUDE,
  RECRUITER_APPLICATION_DETAIL_INCLUDE,
  mapSkillsForMatching,
  createApplicationInTx,
} from './applications.queries';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  /**
   * Candidate applies for a job.
   * Enforces UNIQUE(jobId, candidateId) -> throws 409 Conflict code ALREADY_APPLIED.
   */
  async apply(userId: string, input: ApplicationCreateInput) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: { skills: { include: { skill: true } } },
    });
    if (!candidate) {
      throw new BadRequestException('Candidate profile does not exist. Please complete your profile first.');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: input.jobId },
      include: { skills: { include: { skill: true } }, company: true },
    });
    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException('This job is no longer accepting applications.');
    }
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      throw new BadRequestException('This job posting has expired.');
    }

    const existing = await this.prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: input.jobId, candidateId: candidate.id } },
    });
    if (existing) {
      throw new ConflictException({
        code: 'ALREADY_APPLIED',
        message: 'You have already submitted an application to this job opening.',
      });
    }

    let resumeId = input.resumeDocumentId;
    if (!resumeId) {
      const defaultDoc = await this.prisma.document.findFirst({
        where: { ownerId: candidate.id, isDefault: true, deletedAt: null },
      });
      resumeId = defaultDoc?.id || null;
    }

    const { jobSkillsForMatch, candSkillsForMatch } = mapSkillsForMatching(job.skills, candidate.skills);
    const matchResult = calculateSkillMatch(jobSkillsForMatch, candSkillsForMatch);

    try {
      const application = await this.prisma.$transaction((tx) =>
        createApplicationInTx(tx, {
          jobId: input.jobId,
          candidateId: candidate.id,
          userId,
          resumeDocumentId: resumeId,
          coverLetter: input.coverLetter,
          matchScore: matchResult.score,
          matchBreakdown: matchResult.breakdown,
          modelVersion: matchResult.modelVersion,
        })
      );

      await this.auditService.log({
        actorId: userId,
        action: 'APPLICATION_SUBMITTED',
        entity: 'Application',
        entityId: application.id,
        metadata: { jobId: input.jobId, companyId: job.companyId },
      });

      return application;
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException({
          code: 'ALREADY_APPLIED',
          message: 'You have already submitted an application to this job opening.',
        });
      }
      throw e;
    }
  }

  /**
   * Candidate lists their own applications.
   */
  async getMyApplications(userId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!candidate) return [];

    return this.prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: CANDIDATE_APPLICATION_INCLUDE,
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Candidate withdraws their own application.
   */
  async withdraw(userId: string, applicationId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, candidateId: candidate.id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const transitionCheck = validateApplicationTransition(
      application.status as ApplicationStatus,
      ApplicationStatus.WITHDRAWN,
      Role.CANDIDATE
    );
    if (!transitionCheck.allowed) {
      throw new UnprocessableEntityException({
        code: 'INVALID_TRANSITION',
        message: transitionCheck.reason || 'Cannot withdraw application in its current state',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.WITHDRAWN },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.status,
          toStatus: ApplicationStatus.WITHDRAWN,
          changedById: userId,
          reason: 'Application withdrawn by candidate',
        },
      });

      await this.auditService.log({
        actorId: userId,
        action: 'APPLICATION_WITHDRAWN',
        entity: 'Application',
        entityId: applicationId,
      });

      return updated;
    });
  }

  private async getRecruiterCompanyId(recruiterId: string): Promise<string> {
    const membership = await this.prisma.companyMember.findFirst({ where: { userId: recruiterId } });
    if (!membership) {
      throw new ForbiddenException('User is not associated with any company');
    }
    return membership.companyId;
  }

  /**
   * Recruiter lists applications scoped to their company.
   * Defense-in-depth: Never leaks applications from other companies.
   */
  async findRecruiterApplications(
    recruiterId: string,
    filters?: { jobId?: string; status?: ApplicationStatus }
  ) {
    const companyId = await this.getRecruiterCompanyId(recruiterId);

    return this.prisma.application.findMany({
      where: {
        job: {
          companyId,
          ...(filters?.jobId ? { id: filters.jobId } : {}),
        },
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: RECRUITER_APPLICATIONS_INCLUDE,
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Recruiter views a specific application.
   * If application does not belong to recruiter's company, throws 404 (NOT 403) to prevent ID disclosure.
   */
  async findForRecruiter(recruiterId: string, applicationId: string) {
    const companyId = await this.getRecruiterCompanyId(recruiterId);

    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, job: { companyId } },
      include: RECRUITER_APPLICATION_DETAIL_INCLUDE,
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  /**
   * Recruiter transitions application status according to state machine.
   * Validates transition -> saves history + audit log in transaction.
   */
  async transitionStatus(
    recruiterId: string,
    applicationId: string,
    input: ApplicationTransitionInput
  ) {
    const app = await this.findForRecruiter(recruiterId, applicationId);

    const transitionCheck = validateApplicationTransition(
      app.status as ApplicationStatus,
      input.toStatus,
      Role.RECRUITER
    );
    if (!transitionCheck.allowed) {
      throw new UnprocessableEntityException({
        code: 'INVALID_TRANSITION',
        message: transitionCheck.reason || `Invalid transition from ${app.status} to ${input.toStatus}`,
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const record = await tx.application.update({
        where: { id: applicationId },
        data: { status: input.toStatus },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: app.status,
          toStatus: input.toStatus,
          changedById: recruiterId,
          reason: input.reason || null,
        },
      });

      return record;
    });

    await this.auditService.log({
      actorId: recruiterId,
      action: 'APPLICATION_STATUS_TRANSITION',
      entity: 'Application',
      entityId: applicationId,
      metadata: { from: app.status, to: input.toStatus, reason: input.reason },
    });

    return updated;
  }

  /**
   * Recruiter adds an internal note to an application.
   */
  async addNote(recruiterId: string, applicationId: string, input: ApplicationNoteInput) {
    await this.findForRecruiter(recruiterId, applicationId);

    return this.prisma.applicationNote.create({
      data: {
        applicationId,
        authorId: recruiterId,
        body: input.body,
      },
      include: { author: { select: { email: true } } },
    });
  }

  /**
   * Generates secure resume download presigned/direct access for recruiter with audit log.
   */
  async getResumeDownload(recruiterId: string, applicationId: string) {
    const app = await this.findForRecruiter(recruiterId, applicationId);

    if (!app.resume) {
      throw new NotFoundException('No resume document attached to this application');
    }

    await this.auditService.log({
      actorId: recruiterId,
      action: 'RESUME_DOWNLOADED',
      entity: 'Document',
      entityId: app.resume.id,
      metadata: { applicationId, filename: app.resume.originalFilename },
    });

    return {
      documentId: app.resume.id,
      originalFilename: app.resume.originalFilename,
      mimeType: app.resume.mimeType,
      sizeBytes: app.resume.sizeBytes,
      downloadUrl: `/api/v1/documents/${app.resume.id}/download`,
    };
  }
}
