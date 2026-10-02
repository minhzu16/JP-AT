import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InterviewCreateInput,
  InterviewUpdateInput,
  ApplicationStatus,
} from '@jobportal/shared';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InterviewsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async createInterview(recruiterId: string, input: InterviewCreateInput) {
    const membership = await this.prisma.companyMember.findFirst({
      where: { userId: recruiterId },
    });
    if (!membership) {
      throw new ForbiddenException('User is not associated with any company');
    }

    const application = await this.prisma.application.findFirst({
      where: {
        id: input.applicationId,
        job: { companyId: membership.companyId },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interview = await this.prisma.$transaction(async (tx) => {
      const created = await tx.interview.create({
        data: {
          applicationId: input.applicationId,
          round: input.round,
          scheduledAt: new Date(input.scheduledAt),
          durationMin: input.durationMin,
          mode: input.mode as any,
          locationOrLink: input.locationOrLink,
          interviewerNames: input.interviewerNames,
        },
      });

      // Advance status to INTERVIEW if in APPLIED or SCREENING
      if (
        application.status === ApplicationStatus.APPLIED ||
        application.status === ApplicationStatus.SCREENING
      ) {
        await tx.application.update({
          where: { id: input.applicationId },
          data: { status: ApplicationStatus.INTERVIEW },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: input.applicationId,
            fromStatus: application.status,
            toStatus: ApplicationStatus.INTERVIEW,
            changedById: recruiterId,
            reason: `Interview round ${input.round} scheduled`,
          },
        });
      }

      return created;
    });

    await this.auditService.log({
      actorId: recruiterId,
      action: 'INTERVIEW_SCHEDULED',
      entity: 'Interview',
      entityId: interview.id,
      metadata: { applicationId: input.applicationId, round: input.round },
    });

    return interview;
  }

  async updateInterview(
    recruiterId: string,
    interviewId: string,
    input: InterviewUpdateInput
  ) {
    const membership = await this.prisma.companyMember.findFirst({
      where: { userId: recruiterId },
    });
    if (!membership) {
      throw new ForbiddenException('User is not associated with any company');
    }

    const interview = await this.prisma.interview.findFirst({
      where: {
        id: interviewId,
        application: {
          job: { companyId: membership.companyId },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...(input.status ? { status: input.status as any } : {}),
        ...(input.feedback !== undefined ? { feedback: input.feedback } : {}),
        ...(input.outcome !== undefined ? { outcome: input.outcome } : {}),
        ...(input.scheduledAt ? { scheduledAt: new Date(input.scheduledAt) } : {}),
      },
    });
  }
}
