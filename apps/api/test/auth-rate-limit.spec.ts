import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
const request = require('supertest');
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { AUTH_THROTTLE, REFRESH_THROTTLE, throttlerOptions } from '../src/common/throttle.config';

describe('Auth rate limiting', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(throttlerOptions(1000))],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r' }),
            refreshToken: jest.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r' }),
          },
        },
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'ready', 'api/docs'],
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows AUTH_THROTTLE.default.limit logins per minute, then answers 429', async () => {
    for (let i = 0; i < AUTH_THROTTLE.default.limit; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'secret' });
      expect(res.status).toBe(200);
    }

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'secret' });
    expect(res.status).toBe(429);
  });

  it('allows 11 consecutive POST /api/v1/auth/refresh without a cookie with 401 (none 429)', async () => {
    for (let i = 0; i < 11; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({});
      expect(res.status).toBe(401);
    }
  });
});
