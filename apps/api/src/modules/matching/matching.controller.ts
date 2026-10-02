import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import { Role } from '@jobportal/shared';

@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('compare/:jobId')
  @Roles(Role.CANDIDATE)
  async compare(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.matchingService.compareJobWithCandidate(user.userId, jobId);
  }

  @Post('ai-feedback/:jobId')
  @Roles(Role.CANDIDATE)
  async feedback(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.matchingService.getAiResumeFeedback(user.userId, jobId);
  }
}
