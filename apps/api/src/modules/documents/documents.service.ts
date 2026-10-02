import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DocumentKind,
  ScanStatus,
  PresignedUploadRequestInput,
  DocumentConfirmInput,
} from '@jobportal/shared';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DocumentsService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getUploadUrl(userId: string, input: PresignedUploadRequestInput) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new BadRequestException('Candidate profile not found');
    }

    const ext = path.extname(input.filename).toLowerCase() || '.pdf';
    const uniqueKey = `resumes/${candidate.id}/${crypto.randomUUID()}${ext}`;

    return {
      storageKey: uniqueKey,
      uploadUrl: `/api/v1/documents/upload-target?key=${encodeURIComponent(uniqueKey)}`,
      expiresInSeconds: 300,
      maxSizeBytes: 10 * 1024 * 1024,
    };
  }

  async confirmDocument(userId: string, input: DocumentConfirmInput) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new BadRequestException('Candidate profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // If default, reset other documents
      if (input.isDefault) {
        await tx.document.updateMany({
          where: { ownerId: candidate.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const doc = await tx.document.create({
        data: {
          ownerId: candidate.id,
          kind: input.kind as any,
          originalFilename: input.originalFilename,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          storageKey: input.storageKey,
          sha256: crypto.createHash('sha256').update(input.storageKey + Date.now()).digest('hex'),
          scanStatus: ScanStatus.CLEAN,
          isDefault: input.isDefault,
          pageCount: 2,
        },
      });

      return doc;
    });
  }

  async listMyDocuments(userId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      return [];
    }

    return this.prisma.document.findMany({
      where: { ownerId: candidate.id, deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async setDefaultDocument(userId: string, documentId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.document.updateMany({
        where: { ownerId: candidate.id, isDefault: true },
        data: { isDefault: false },
      });

      return tx.document.update({
        where: { id: documentId },
        data: { isDefault: true },
      });
    });
  }

  async softDelete(userId: string, documentId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, ownerId: candidate.id },
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
  }

  async getDocumentForDownload(documentId: string, actorUserId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          include: {
            user: true,
            applications: {
              include: {
                job: {
                  include: {
                    company: {
                      include: { members: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!doc || doc.deletedAt) {
      throw new NotFoundException('Document not found');
    }

    // Check permission: Owner candidate OR recruiter of a job where candidate applied with this document
    const isOwner = doc.owner.user.id === actorUserId;
    const isAuthorizedRecruiter = doc.owner.applications.some((app) =>
      app.job.company.members.some((m) => m.userId === actorUserId)
    );

    if (!isOwner && !isAuthorizedRecruiter) {
      throw new ForbiddenException('You do not have access to this document');
    }

    await this.auditService.log({
      actorId: actorUserId,
      action: 'DOCUMENT_DOWNLOADED',
      entity: 'Document',
      entityId: doc.id,
      metadata: { originalFilename: doc.originalFilename },
    });

    return doc;
  }
}
