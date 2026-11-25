import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  BadRequestException,
  UnauthorizedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService, ListUsersQuery, ListJobsQuery } from './admin.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import { Role, JobStatus } from '@jobportal/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(@Inject(AdminService) private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async listUsers(@Query() query: ListUsersQuery) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown
  ) {
    const callerId = user?.userId;
    if (!callerId) {
      throw new UnauthorizedException();
    }
    if (id === callerId) {
      throw new BadRequestException('You cannot change your own account');
    }

    const validated = this.validateUpdateUserBody(body);
    return this.adminService.updateUser(id, validated, callerId);
  }

  @Get('jobs')
  async listJobs(@Query() query: ListJobsQuery) {
    return this.adminService.listJobs(query);
  }

  @Patch('jobs/:id/status')
  async updateJobStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown
  ) {
    const validated = this.validateUpdateJobStatusBody(body);
    return this.adminService.updateJobStatus(id, validated.status);
  }

  private validateUpdateUserBody(body: unknown): { role?: Role; status?: 'ACTIVE' | 'SUSPENDED' } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be an object');
    }
    const { role, status } = body as Record<string, unknown>;
    if (role === undefined && status === undefined) {
      throw new BadRequestException('At least one of role or status must be provided');
    }
    if (role !== undefined && (typeof role !== 'string' || !Object.values(Role).includes(role as Role))) {
      throw new BadRequestException('Invalid role');
    }
    if (status !== undefined && (typeof status !== 'string' || (status !== 'ACTIVE' && status !== 'SUSPENDED'))) {
      throw new BadRequestException('Invalid status');
    }
    return {
      ...(role !== undefined && { role: role as Role }),
      ...(status !== undefined && { status: status as 'ACTIVE' | 'SUSPENDED' }),
    };
  }

  private validateUpdateJobStatusBody(body: unknown): { status: JobStatus } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be an object');
    }
    const { status } = body as Record<string, unknown>;
    if (!status || typeof status !== 'string' || !Object.values(JobStatus).includes(status as JobStatus)) {
      throw new BadRequestException('Invalid status');
    }
    return { status: status as JobStatus };
  }
}
