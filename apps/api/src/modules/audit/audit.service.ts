import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    actorId?: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: Record<string, any>;
    ip?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: params.actorId || null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
          ip: params.ip || null,
        },
      });
      this.logger.log(`Audit: [${params.action}] on ${params.entity}:${params.entityId} by ${params.actorId || 'system'}`);
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`);
    }
  }
}
