import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateProfileUpdateInput, CandidateSkillsUpdateInput } from '@jobportal/shared';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { level: 'desc' },
        },
        documents: {
          where: { deletedAt: null },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, input: CandidateProfileUpdateInput) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    return this.prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        ...(input.fullName ? { fullName: input.fullName } : {}),
        ...(input.headline !== undefined ? { headline: input.headline } : {}),
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.yearsExperience !== undefined ? { yearsExperience: input.yearsExperience } : {}),
        ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      },
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async updateSkills(userId: string, input: CandidateSkillsUpdateInput) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Atomic replacement of candidate skills
    return this.prisma.$transaction(async (tx) => {
      await tx.candidateSkill.deleteMany({
        where: { candidateId: profile.id },
      });

      if (input.skills.length > 0) {
        await tx.candidateSkill.createMany({
          data: input.skills.map((s) => ({
            candidateId: profile.id,
            skillId: s.skillId,
            level: s.level,
            years: s.years,
          })),
        });
      }

      return tx.candidateProfile.findUnique({
        where: { id: profile.id },
        include: {
          skills: { include: { skill: true } },
        },
      });
    });
  }
}
