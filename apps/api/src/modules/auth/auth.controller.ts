import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/current-user.decorator';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '@jobportal/shared';
import { AUTH_THROTTLE, REFRESH_THROTTLE } from '../../common/throttle.config';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(@Body() body: Record<string, unknown>) {
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues.map((i) => i.message).join(', '),
        errors: parsed.error.issues,
      });
    }
    return this.authService.register(parsed.data);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid credentials format',
      });
    }
    const result = await this.authService.login(parsed.data);
    if (res?.cookie && result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    const { refreshToken: _rt, ...responseBody } = result;
    return responseBody;
  }

  @Throttle(REFRESH_THROTTLE)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const rawToken = (req?.cookies?.refreshToken as string | undefined) || (body?.refreshToken as string | undefined);
    if (!rawToken) {
      if (res?.clearCookie) res.clearCookie('refreshToken');
      throw new UnauthorizedException('Refresh token is required');
    }
    try {
      const result = await this.authService.refreshToken(rawToken);
      if (res?.cookie && result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }
      const { refreshToken: _rt, ...responseBody } = result;
      return responseBody;
    } catch (err) {
      if (res?.clearCookie) res.clearCookie('refreshToken');
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res?: Response) {
    if (res?.clearCookie) {
      res.clearCookie('refreshToken');
    }
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }
}
