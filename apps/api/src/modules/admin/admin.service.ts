import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, JobStatus } from '@jobportal/shared';
import { Prisma } from '@jobportal/db';

export interface ListUsersQuery {
  search?: string;
  role?: Role;
  status?: string;
  page?: number | string;
  pageSize?: number | string;
}

export interface UpdateUserData {
  role?: Role;
  status?: 'ACTIVE' | 'SUSPENDED';
}

export interface ListJobsQuery {
  search?: string;
  status?: JobStatus;
  page?: number | string;
  pageSize?: number | string;
}

@Injectable()
export class AdminService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCandidates,
      totalCompanies,
      totalJobs,
      totalApplications,
      recentAudits,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.candidateProfile.count(),
      this.prisma.company.count(),
      this.prisma.job.count(),
      this.prisma.application.count(),
      this.prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { email: true, role: true } } },
      }),
    ]);

    return {
      totalUsers,
      totalCandidates,
      totalCompanies,
      totalJobs,
      totalApplications,
      recentAudits,
    };
  }

  async listUsers(query: ListUsersQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const rawPageSize = Number(query.pageSize) || 20;
    const pageSize = Math.min(100, Math.max(1, rawPageSize));
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.UserWhereInput = {};

    if (query.role && Object.values(Role).includes(query.role)) {
      where.role = query.role;
    }

    if (query.status && typeof query.status === 'string' && query.status.trim().length > 0) {
      where.status = query.status.trim();
    }

    const search = typeof query.search === 'string' ? query.search.trim() : undefined;
    if (search) {
      where.OR = [{ email: { contains: search, mode: 'insensitive' } }];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async updateUser(id: string, data: UpdateUserData, callerId?: string) {
    if (callerId && id === callerId) {
      throw new BadRequestException('You cannot change your own account');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('jobportal:admin-roster'))`;

      const target = await tx.user.findUnique({
        where: { id },
      });

      if (!target) {
        throw new NotFoundException('User not found');
      }

      if (target.status === 'ERASED') {
        throw new ConflictException('ERASED users cannot be changed');
      }

      const isCurrentActiveAdmin = target.role === Role.ADMIN && target.status === 'ACTIVE';
      const willBeRole = data.role !== undefined ? data.role : target.role;
      const willBeStatus = data.status !== undefined ? data.status : target.status;
      const willBeActiveAdmin = willBeRole === Role.ADMIN && willBeStatus === 'ACTIVE';

      if (isCurrentActiveAdmin && !willBeActiveAdmin) {
        const otherActiveAdminCount = await tx.user.count({
          where: {
            role: Role.ADMIN,
            status: 'ACTIVE',
            id: { not: id },
          },
        });

        if (otherActiveAdminCount === 0) {
          throw new BadRequestException('At least one active ADMIN must remain');
        }
      }

      return tx.user.update({
        where: { id },
        data: {
          ...(data.role !== undefined && { role: data.role }),
          ...(data.status !== undefined && { status: data.status }),
        },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
    });
  }

  async listJobs(query: ListJobsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const rawPageSize = Number(query.pageSize) || 20;
    const pageSize = Math.min(100, Math.max(1, rawPageSize));
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.JobWhereInput = {};

    if (query.status && Object.values(JobStatus).includes(query.status)) {
      where.status = query.status;
    }

    const search = typeof query.search === 'string' ? query.search.trim() : undefined;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        include: {
          company: {
            select: { name: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const updateData: Prisma.JobUpdateInput = {
      status,
    };

    if (status === JobStatus.PUBLISHED && !job.publishedAt) {
      updateData.publishedAt = new Date();
    }

    return this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: { name: true },
        },
      },
    });
  }
}
