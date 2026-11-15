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

  /**
   * Subject Access Request (SAR) Data Export
   * In compliance with EU GDPR Article 15 and Vietnam Law 91/2025/QH15 Article 9
   */
  async exportCandidateData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { level: 'desc' },
        },
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            kind: true,
            originalFilename: true,
            mimeType: true,
            sizeBytes: true,
            uploadedAt: true,
          },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: { select: { id: true, name: true } },
              },
            },
            history: {
              orderBy: { changedAt: 'asc' },
              select: {
                fromStatus: true,
                toStatus: true,
                reason: true,
                changedAt: true,
              },
            },
          },
        },
        savedJobs: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    const consents = await this.prisma.consent.findMany({
      where: { userId },
      select: {
        id: true,
        purpose: true,
        grantedAt: true,
        revokedAt: true,
      },
    });

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
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Candidate profile not found');
    }

    const timestamp = new Date();
    const shortId = userId.substring(0, 8);

    await this.prisma.$transaction(async (tx) => {
      // 1. Anonymize CandidateProfile PII
      await tx.candidateProfile.update({
        where: { id: profile.id },
        data: {
          fullName: 'Anonymized Candidate',
          headline: null,
          summary: null,
          location: null,
          visibility: false,
        },
      });

      // 2. Anonymize User account
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `anonymized_${shortId}_${Date.now()}@erasure.local`,
          status: 'ERASED',
        },
      });

      // 3. Revoke all active consents
      await tx.consent.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: timestamp },
      });

      // 4. Soft-delete all active candidate documents
      await tx.document.updateMany({
        where: { ownerId: profile.id, deletedAt: null },
        data: { deletedAt: timestamp },
      });

      // 5. Withdraw active applications
      await tx.application.updateMany({
        where: {
          candidateId: profile.id,
          status: {
            in: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'],
          },
        },
        data: {
          status: 'WITHDRAWN',
        },
      });
    });

    return {
      success: true,
      message: 'Personal data anonymized and erased according to GDPR Art. 17 and Vietnam Law 91/2025/QH15',
      erasedAt: timestamp.toISOString(),
      subjectId: userId,
    };
  }
}
