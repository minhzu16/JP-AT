import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GDPR & Vietnam Law 91/2025/QH15 Privacy & SAR Tests', () => {
  let app: INestApplication;
  let candidateToken: string;
  let candidateUserId: string;
  let recruiterToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'ready'],
    });
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    // 1. Clean up any previous test user and create fresh candidate for testing
    await prisma.user.deleteMany({
      where: { email: { in: ['privacy.test@jobportal.vn'] } },
    });

    const testUser = await prisma.user.create({
      data: {
        email: 'privacy.test@jobportal.vn',
        passwordHash: '$2a$10$1ESppdhUQfo5rxO9msSgTe8DqM1hJTidAYk.LfaJ/XP9V.8uJiUI6', // Password123!@#
        role: 'CANDIDATE',
        status: 'ACTIVE',
        candidateProfile: {
          create: {
            fullName: 'Nguyen Van Privacy',
            headline: 'Security & Compliance Lead',
            summary: 'Specializing in GDPR and Law 91/2025/QH15',
            visibility: true,
          },
        },
      },
      include: { candidateProfile: true },
    });
    candidateUserId = testUser.id;

    // Login as the freshly seeded candidate
    const candLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'privacy.test@jobportal.vn', password: 'Password123!@#' });
    expect(candLogin.status).toBe(200);
    candidateToken = candLogin.body.accessToken;

    // 2. Login as Recruiter
    const recLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'recruiter.vng@gmail.com', password: 'Password123!@#' });
    expect(recLogin.status).toBe(200);
    recruiterToken = recLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Requirement #5: Subject Access Request (SAR) Data Export - GET /api/v1/candidates/me/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/candidates/me/export')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metadata).toBeDefined();
    expect(res.body.metadata.compliance).toContain('91/2025/QH15');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('privacy.test@jobportal.vn');
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.fullName).toBe('Nguyen Van Privacy');
  });

  it('Requirement #6: SAR Export alias - GET /api/v1/me/export', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/me/export')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metadata.subjectId).toBe(candidateUserId);
  });

  it('Requirement #7: Unauthorized & Recruiter cannot call Candidate Privacy Export', async () => {
    // Unauthenticated -> 401
    const unauth = await request(app.getHttpServer())
      .get('/api/v1/candidates/me/export');
    expect(unauth.status).toBe(401);

    // Recruiter role -> 403 Forbidden
    const forbidden = await request(app.getHttpServer())
      .get('/api/v1/candidates/me/export')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(forbidden.status).toBe(403);
  });

  it('Requirement #8: Right to be Forgotten / Erasure - DELETE /api/v1/candidates/me/privacy-erasure', async () => {
    const res = await request(app.getHttpServer())
      .delete('/api/v1/candidates/me/privacy-erasure')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('91/2025/QH15');
    expect(res.body.erasedAt).toBeDefined();

    // Verify in database that PII has been wiped
    const erasedProfile = await prisma.candidateProfile.findUnique({
      where: { userId: candidateUserId },
    });
    expect(erasedProfile).toBeDefined();
    expect(erasedProfile?.fullName).toBe('Anonymized Candidate');
    expect(erasedProfile?.headline).toBeNull();
    expect(erasedProfile?.summary).toBeNull();
    expect(erasedProfile?.visibility).toBe(false);

    const erasedUser = await prisma.user.findUnique({
      where: { id: candidateUserId },
    });
    expect(erasedUser?.status).toBe('ERASED');
    expect(erasedUser?.email).toContain('@erasure.local');

    // Verify session token is invalidated immediately under GDPR/Law 91/2025
    const profileRes = await request(app.getHttpServer())
      .get('/api/v1/candidates/me/profile')
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(profileRes.status).toBe(401);
  });
});
