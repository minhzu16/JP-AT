import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import {
  Role,
  ApplicationStatus,
  ApplicationCreateSchema,
  ApplicationTransitionSchema,
  ApplicationNoteSchema,
} from '@jobportal/shared';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  // Candidate: Apply for a job
  @Post('jobs/:jobId/applications')
  @Roles(Role.CANDIDATE)
  async apply(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = ApplicationCreateSchema.safeParse({ ...body, jobId });
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.applicationsService.apply(user.userId, parsed.data);
  }

  // Candidate: List my applications
  @Get('me/applications')
  @Roles(Role.CANDIDATE)
  async getMyApplications(@CurrentUser() user: AuthenticatedUser) {
    return this.applicationsService.getMyApplications(user.userId);
  }

  // Candidate: Withdraw an application
  @Post('me/applications/:id/withdraw')
  @Roles(Role.CANDIDATE)
  async withdraw(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.applicationsService.withdraw(user.userId, id);
  }

  // Recruiter: List applications for company jobs
  @Get('recruiter/applications')
  @Roles(Role.RECRUITER)
  async getRecruiterApplications(
    @CurrentUser() user: AuthenticatedUser,
    @Query('jobId') jobId?: string,
    @Query('status') status?: ApplicationStatus
  ) {
    return this.applicationsService.findRecruiterApplications(user.userId, {
      jobId,
      status,
    });
  }

  // Recruiter: View specific application
  @Get('recruiter/applications/:id')
  @Roles(Role.RECRUITER)
  async getRecruiterApplicationDetail(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.applicationsService.findForRecruiter(user.userId, id);
  }

  // Recruiter: Change status (state machine)
  @Post('recruiter/applications/:id/transition')
  @Roles(Role.RECRUITER)
  async transitionStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = ApplicationTransitionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.applicationsService.transitionStatus(user.userId, id, parsed.data);
  }

  // Recruiter: Add internal note
  @Post('recruiter/applications/:id/notes')
  @Roles(Role.RECRUITER)
  async addNote(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = ApplicationNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.applicationsService.addNote(user.userId, id, parsed.data);
  }

  // Recruiter: Get resume download link with audit
  @Get('recruiter/applications/:id/resume')
  @Roles(Role.RECRUITER)
  async getResumeDownload(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.applicationsService.getResumeDownload(user.userId, id);
  }
}
