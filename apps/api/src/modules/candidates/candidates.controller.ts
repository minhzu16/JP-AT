import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import { Role, CandidateProfileUpdateSchema, CandidateSkillsUpdateSchema } from '@jobportal/shared';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get('profile')
  @Roles(Role.CANDIDATE)
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.candidatesService.getProfile(user.userId);
  }

  @Put('profile')
  @Roles(Role.CANDIDATE)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = CandidateProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.candidatesService.updateProfile(user.userId, parsed.data);
  }

  @Put('skills')
  @Roles(Role.CANDIDATE)
  async updateSkills(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = CandidateSkillsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid skills payload',
      });
    }
    return this.candidatesService.updateSkills(user.userId, parsed.data);
  }
}
