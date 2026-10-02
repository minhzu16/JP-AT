import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, MemberRole, RegisterInput, LoginInput } from '@jobportal/shared';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role as any,
          emailVerifiedAt: new Date(), // Auto-verified for local dev
        },
      });

      if (input.role === Role.CANDIDATE) {
        await tx.candidateProfile.create({
          data: {
            userId: createdUser.id,
            fullName: input.fullName,
          },
        });
      } else if (input.role === Role.RECRUITER) {
        const companyName = input.companyName || `${input.fullName}'s Company`;
        const slug = companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}`;

        const company = await tx.company.create({
          data: {
            name: companyName,
            slug,
          },
        });

        await tx.companyMember.create({
          data: {
            companyId: company.id,
            userId: createdUser.id,
            memberRole: MemberRole.ADMIN as any,
          },
        });
      }

      return createdUser;
    });

    await this.auditService.log({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      metadata: { role: user.role, email: user.email },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        candidateProfile: true,
        companyMembers: { include: { company: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.auditService.log({
      actorId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        candidateProfile: user.candidateProfile,
        company: user.companyMembers[0]?.company,
      },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-jobportal-2026-xyz',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: {
          include: {
            skills: { include: { skill: true } },
            documents: { where: { deletedAt: null } },
          },
        },
        companyMembers: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      candidateProfile: user.candidateProfile,
      company: user.companyMembers[0]?.company,
      companyMemberRole: user.companyMembers[0]?.memberRole,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-jobportal-2026-xyz',
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-jobportal-2026-xyz',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }
}
