import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateProfileUpdateInput, CandidateSkillsUpdateInput } from '@jobportal/shared';

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (!profile) throw new NotFoundException('Candidate profile not found');
    return profile;
  }

  async updateProfile(userId: string, input: CandidateProfileUpdateInput) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Candidate profile not found');

    const { fullName, headline, summary, location, yearsExperience, visibility } = input;
    return this.prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        ...(fullName && { fullName }),
        ...(headline !== undefined && { headline }),
        ...(summary !== undefined && { summary }),
        ...(location !== undefined && { location }),
        ...(yearsExperience !== undefined && { yearsExperience }),
        ...(visibility !== undefined && { visibility }),
      },
      include: {
        skills: { include: { skill: true } },
      },
    });
  }

  async updateSkills(userId: string, { skills }: CandidateSkillsUpdateInput) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Candidate profile not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.candidateSkill.deleteMany({ where: { candidateId: profile.id } });

      if (skills.length > 0) {
        await tx.candidateSkill.createMany({
          data: skills.map(({ skillId, level, years }) => ({
            candidateId: profile.id,
            skillId,
            level,
            years,
          })),
        });
      }

      return tx.candidateProfile.findUnique({
        where: { id: profile.id },
        include: { skills: { include: { skill: true } } },
      });
    });
  }

  /**
   * Subject Access Request (SAR) Data Export
   * In compliance with EU GDPR Article 15 and Vietnam Law 91/2025/QH15 Article 9
   * Parallelized fetching with Promise.all to eliminate waterfalls.
   */
  async exportCandidateData(userId: string) {
    const [user, profile, consents] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
          skills: { include: { skill: true }, orderBy: { level: 'desc' } },
          documents: {
            where: { deletedAt: null },
            select: { id: true, kind: true, originalFilename: true, mimeType: true, sizeBytes: true, uploadedAt: true },
          },
          applications: {
            include: {
              job: { select: { id: true, title: true, company: { select: { id: true, name: true } } } },
              history: {
                orderBy: { changedAt: 'asc' },
                select: { fromStatus: true, toStatus: true, reason: true, changedAt: true },
              },
            },
          },
          savedJobs: {
            include: { job: { select: { id: true, title: true, company: { select: { id: true, name: true } } } } },
          },
        },
      }),
      this.prisma.consent.findMany({
        where: { userId },
        select: { id: true, purpose: true, grantedAt: true, revokedAt: true },
      }),
    ]);

    if (!user) throw new NotFoundException('User not found');

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        compliance: 'GDPR Article 15 (SAR) & Vietnam Law 91/2025/QH15 Article 9',
        dataController: 'CareerVanguard Job Portal & ATS',
        subjectId: user.id,
      },
      user,
      profile: profile || null,
      consents,
    };
  }

  /**
   * Right to be Forgotten / Privacy Erasure Request
   * In compliance with EU GDPR Article 17 and Vietnam Law 91/2025/QH15 Article 16
   */
  async eraseCandidatePrivacyData(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Candidate profile not found');

    const timestamp = new Date();
    const shortId = userId.slice(0, 8);

    await this.prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.candidateProfile.update({
          where: { id: profile.id },
          data: { fullName: 'Anonymized Candidate', headline: null, summary: null, location: null, visibility: false },
        }),
        tx.user.update({
          where: { id: userId },
          data: { email: `anonymized_${shortId}_${Date.now()}@erasure.local`, status: 'ERASED' },
        }),
        tx.consent.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: timestamp },
        }),
        tx.document.updateMany({
          where: { ownerId: profile.id, deletedAt: null },
          data: { deletedAt: timestamp },
        }),
        tx.application.updateMany({
          where: { candidateId: profile.id, status: { in: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'] } },
          data: { status: 'WITHDRAWN' },
        }),
      ]);
    });

    return {
      success: true,
      message: 'Personal data anonymized and erased according to GDPR Art. 17 and Vietnam Law 91/2025/QH15',
      erasedAt: timestamp.toISOString(),
      subjectId: userId,
    };
  }
}
