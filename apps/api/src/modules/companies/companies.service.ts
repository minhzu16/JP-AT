import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobStatus } from '@jobportal/shared';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        _count: {
          select: { jobs: { where: { status: JobStatus.PUBLISHED } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: JobStatus.PUBLISHED },
          include: {
            skills: { include: { skill: true } },
          },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(companyId: string, userId: string, data: any) {
    const membership = await this.prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not belong to this company');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.logoKey !== undefined ? { logoKey: data.logoKey } : {}),
      },
    });
  }
}
