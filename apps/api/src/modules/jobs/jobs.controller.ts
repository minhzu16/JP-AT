import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import {
  Role,
  JobStatus,
  JobCreateSchema,
  JobUpdateSchema,
  JobFilterQuerySchema,
} from '@jobportal/shared';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  async search(@Query() query: any) {
    const parsed = JobFilterQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        errors: parsed.error.issues,
      });
    }
    return this.jobsService.searchJobs(parsed.data);
  }

  @Get('recruiter/my-jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async getRecruiterJobs(@CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.findRecruiterJobs(user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async createJob(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = JobCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.jobsService.createJob(user.userId, parsed.data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async updateJob(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = JobUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.jobsService.updateJob(id, user.userId, parsed.data);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.jobsService.setJobStatus(id, user.userId, JobStatus.PUBLISHED);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async close(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.jobsService.setJobStatus(id, user.userId, JobStatus.CLOSED);
  }
}
