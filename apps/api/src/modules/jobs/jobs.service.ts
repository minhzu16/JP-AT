import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  JobStatus,
  JobCreateInput,
  JobUpdateInput,
  JobFilterQuery,
} from '@jobportal/shared';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async searchJobs(query: JobFilterQuery) {
    const limit = Math.min(query.limit || 20, 100);
    const where: any = {
      status: JobStatus.PUBLISHED,
    };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.workMode) {
      where.workMode = query.workMode;
    }

    if (query.employmentType) {
      where.employmentType = query.employmentType;
    }

    if (query.level) {
      where.level = query.level;
    }

    if (query.salaryMin) {
      where.OR = [
        { salaryMax: { gte: query.salaryMin } },
        { salaryMin: { gte: query.salaryMin } },
      ];
    }

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.skillIds) {
      const ids = Array.isArray(query.skillIds) ? query.skillIds : [query.skillIds];
      where.skills = {
        some: {
          skillId: { in: ids },
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        take: limit,
        ...(query.cursor
          ? {
              skip: 1,
              cursor: { id: query.cursor },
            }
          : {}),
        include: {
          company: true,
          skills: {
            include: { skill: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.job.count({ where }),
    ]);

    const nextCursor = items.length === limit ? items[items.length - 1].id : null;

    return {
      items,
      total,
      nextCursor,
    };
  }

  async findById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async findRecruiterJobs(userId: string) {
    const membership = await this.prisma.companyMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new ForbiddenException('User is not associated with any company');
    }

    return this.prisma.job.findMany({
      where: { companyId: membership.companyId },
      include: {
        skills: { include: { skill: true } },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJob(userId: string, input: JobCreateInput) {
    const membership = await this.prisma.companyMember.findFirst({
      where: { userId },
    });
    if (!membership) {
      throw new ForbiddenException('User must belong to a company to post jobs');
    }

    const job = await this.prisma.$transaction(async (tx) => {
      const created = await tx.job.create({
        data: {
          companyId: membership.companyId,
          createdById: userId,
          title: input.title,
          description: input.description,
          location: input.location,
          workMode: input.workMode,
          employmentType: input.employmentType,
          level: input.level,
          salaryMin: input.salaryMin,
          salaryMax: input.salaryMax,
          currency: input.currency || 'VND',
          status: JobStatus.PUBLISHED, // Automatically published on creation for MVP
          publishedAt: new Date(),
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        },
      });

      if (input.skills && input.skills.length > 0) {
        await tx.jobSkill.createMany({
          data: input.skills.map((s) => ({
            jobId: created.id,
            skillId: s.skillId,
            isRequired: s.isRequired,
            weight: s.weight,
          })),
        });
      }

      return tx.job.findUnique({
        where: { id: created.id },
        include: {
          company: true,
          skills: { include: { skill: true } },
        },
      });
    });

    await this.auditService.log({
      actorId: userId,
      action: 'JOB_CREATED',
      entity: 'Job',
      entityId: job.id,
      metadata: { title: job.title, companyId: membership.companyId },
    });

    return job;
  }

  async updateJob(jobId: string, userId: string, input: JobUpdateInput) {
    await this.verifyRecruiterJobOwnership(jobId, userId);

    return this.prisma.$transaction(async (tx) => {
      if (input.skills) {
        await tx.jobSkill.deleteMany({ where: { jobId } });
        if (input.skills.length > 0) {
          await tx.jobSkill.createMany({
            data: input.skills.map((s) => ({
              jobId,
              skillId: s.skillId,
              isRequired: s.isRequired,
              weight: s.weight,
            })),
          });
        }
      }

      return tx.job.update({
        where: { id: jobId },
        data: {
          ...(input.title ? { title: input.title } : {}),
          ...(input.description ? { description: input.description } : {}),
          ...(input.location ? { location: input.location } : {}),
          ...(input.workMode ? { workMode: input.workMode } : {}),
          ...(input.employmentType ? { employmentType: input.employmentType } : {}),
          ...(input.level ? { level: input.level } : {}),
          ...(input.salaryMin !== undefined ? { salaryMin: input.salaryMin } : {}),
          ...(input.salaryMax !== undefined ? { salaryMax: input.salaryMax } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.expiresAt !== undefined
            ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }
            : {}),
        },
        include: {
          company: true,
          skills: { include: { skill: true } },
        },
      });
    });
  }

  async setJobStatus(jobId: string, userId: string, status: JobStatus) {
    await this.verifyRecruiterJobOwnership(jobId, userId);

    const updated = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        status,
        ...(status === JobStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
      },
    });

    await this.auditService.log({
      actorId: userId,
      action: `JOB_STATUS_${status}`,
      entity: 'Job',
      entityId: jobId,
    });

    return updated;
  }

  private async verifyRecruiterJobOwnership(jobId: string, userId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          members: {
            some: { userId },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found or access denied');
    }

    return job;
  }
}
