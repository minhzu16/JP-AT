import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
}
