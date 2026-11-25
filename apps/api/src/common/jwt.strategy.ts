import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './current-user.decorator';
import { requireSecret } from './secrets';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireSecret('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub?: string; id?: string }): Promise<AuthenticatedUser> {
    const id = payload.sub ?? payload.id;
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is inactive or not found');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
