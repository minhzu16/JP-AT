import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SavedJobsService {
  constructor(private prisma: PrismaService) {}

  async saveJob(userId: string, jobId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.savedJob.upsert({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId,
        },
      },
      update: {},
      create: {
        candidateId: candidate.id,
        jobId,
      },
    });
  }

  async unsaveJob(userId: string, jobId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    try {
      await this.prisma.savedJob.delete({
        where: {
          candidateId_jobId: {
            candidateId: candidate.id,
            jobId,
          },
        },
      });
    } catch {
      // Idempotent: ignore if already removed
    }

    return { success: true };
  }

  async listSaved(userId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      return [];
    }

    return this.prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          include: {
            company: true,
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
  }
}
