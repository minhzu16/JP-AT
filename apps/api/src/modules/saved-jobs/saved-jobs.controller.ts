import { Controller, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import { Role } from '@jobportal/shared';

@Controller('me/saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SavedJobsController {
  constructor(private savedJobsService: SavedJobsService) {}

  @Get()
  @Roles(Role.CANDIDATE)
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.savedJobsService.listSaved(user.userId);
  }

  @Put(':jobId')
  @Roles(Role.CANDIDATE)
  async save(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.savedJobsService.saveJob(user.userId, jobId);
  }

  @Delete(':jobId')
  @Roles(Role.CANDIDATE)
  async unsave(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.savedJobsService.unsaveJob(user.userId, jobId);
  }
}
