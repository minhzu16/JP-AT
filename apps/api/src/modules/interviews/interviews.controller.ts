import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import { Role, InterviewCreateSchema, InterviewUpdateSchema } from '@jobportal/shared';

@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Post()
  @Roles(Role.RECRUITER)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = InterviewCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.interviewsService.createInterview(user.userId, parsed.data);
  }

  @Patch(':id')
  @Roles(Role.RECRUITER)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any
  ) {
    const parsed = InterviewUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
      });
    }
    return this.interviewsService.updateInterview(user.userId, id, parsed.data);
  }
}
