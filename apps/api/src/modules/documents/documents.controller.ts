import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import {
  Role,
  PresignedUploadRequestSchema,
  DocumentConfirmSchema,
} from '@jobportal/shared';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('me/documents/upload-url')
  @Roles(Role.CANDIDATE)
  async getUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = PresignedUploadRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.documentsService.getUploadUrl(user.userId, parsed.data);
  }

  @Post('me/documents')
  @Roles(Role.CANDIDATE)
  async confirmDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = DocumentConfirmSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.documentsService.confirmDocument(user.userId, parsed.data);
  }

  @Get('me/documents')
  @Roles(Role.CANDIDATE)
  async listMyDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.listMyDocuments(user.userId);
  }

  @Post('me/documents/:id/set-default')
  @Roles(Role.CANDIDATE)
  async setDefault(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.documentsService.setDefaultDocument(user.userId, id);
  }

  @Delete('me/documents/:id')
  @Roles(Role.CANDIDATE)
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.documentsService.softDelete(user.userId, id);
  }

  @Get('documents/:id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response
  ) {
    const doc = await this.documentsService.getDocumentForDownload(id, user.userId);

    // Provide safe download headers (Content-Disposition attachment)
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.originalFilename)}"`
    );

    // Return dummy demo PDF or file stream content
    const sampleContent = Buffer.from(
      `%PDF-1.4\n1 0 obj\n<< /Title (${doc.originalFilename}) /Author (JobPortal) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`
    );
    return res.send(sampleContent);
  }
}
