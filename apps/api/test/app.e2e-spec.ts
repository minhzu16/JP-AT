import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';

describe('Job Portal Core Requirements E2E Tests', () => {
  let app: INestApplication;
  let candidateToken: string;
  let recruiterVngToken: string;
  let recruiterFptToken: string;
  let targetJobId: string;
  let vngApplicationId: string;

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

    // 1. Login as Candidate 1
    const candLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'candidate1@gmail.com', password: 'Password123!@#' });
    expect(candLogin.status).toBe(200);
    candidateToken = candLogin.body.accessToken;

    // 2. Login as Recruiter VNG
    const vngLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'recruiter.vng@gmail.com', password: 'Password123!@#' });
    expect(vngLogin.status).toBe(200);
    recruiterVngToken = vngLogin.body.accessToken;

    // 3. Login as Recruiter FPT
    const fptLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'recruiter.fpt@gmail.com', password: 'Password123!@#' });
    expect(fptLogin.status).toBe(200);
    recruiterFptToken = fptLogin.body.accessToken;

    // 4. Fetch available jobs
    const jobsRes = await request(app.getHttpServer()).get('/api/v1/jobs');
    expect(jobsRes.status).toBe(200);
    expect(jobsRes.body.items.length).toBeGreaterThan(0);

    // Find a VNG job
    const vngJob = jobsRes.body.items.find((j: any) => j.company.name.includes('VNG'));
    targetJobId = vngJob.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Health check endpoint returns status ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Requirement #1: Candidate cannot re-apply to the same job (returns 409 ALREADY_APPLIED)', async () => {
    // Note: candidate1 already has an application to VNG Fullstack from seeding
    const duplicateApply = await request(app.getHttpServer())
      .post(`/api/v1/jobs/${targetJobId}/applications`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        coverLetter: 'Attempting duplicate application',
      });

    expect(duplicateApply.status).toBe(409);
    expect(duplicateApply.body.code).toBe('ALREADY_APPLIED');
    expect(duplicateApply.body.title).toContain('Conflict');
  });

  it('Requirement #2: Recruiter from Company A CANNOT see or access applications from Company B (returns 404)', async () => {
    // Get candidate1's application ID at VNG
    const myApps = await request(app.getHttpServer())
      .get('/api/v1/me/applications')
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(myApps.status).toBe(200);

    const vngApp = myApps.body.find((a: any) => a.job.company.name.includes('VNG'));
    expect(vngApp).toBeDefined();
    vngApplicationId = vngApp.id;

    // Recruiter VNG accesses their own application -> 200 OK
    const vngAccess = await request(app.getHttpServer())
      .get(`/api/v1/recruiter/applications/${vngApplicationId}`)
      .set('Authorization', `Bearer ${recruiterVngToken}`);
    expect(vngAccess.status).toBe(200);
    expect(vngAccess.body.id).toBe(vngApplicationId);

    // Recruiter FPT tries to access VNG application -> 404 Not Found (prevents tenant disclosure)
    const fptAccess = await request(app.getHttpServer())
      .get(`/api/v1/recruiter/applications/${vngApplicationId}`)
      .set('Authorization', `Bearer ${recruiterFptToken}`);
    expect(fptAccess.status).toBe(404);
  });

  it('Requirement #3: State Machine enforces valid status transitions and blocks invalid ones (422)', async () => {
    // Attempt invalid skip transition: e.g. INTERVIEW -> APPLIED (cannot go backwards)
    const invalidTransition = await request(app.getHttpServer())
      .post(`/api/v1/recruiter/applications/${vngApplicationId}/transition`)
      .set('Authorization', `Bearer ${recruiterVngToken}`)
      .send({
        toStatus: 'APPLIED',
        reason: 'Illegal backward transition',
      });

    expect(invalidTransition.status).toBe(422);
    expect(invalidTransition.body.code).toBe('INVALID_TRANSITION');

    // Valid transition: INTERVIEW -> OFFER
    const validTransition = await request(app.getHttpServer())
      .post(`/api/v1/recruiter/applications/${vngApplicationId}/transition`)
      .set('Authorization', `Bearer ${recruiterVngToken}`)
      .send({
        toStatus: 'OFFER',
        reason: 'Passed technical interview with outstanding score',
      });

    expect(validTransition.status).toBe(201);
    expect(validTransition.body.status).toBe('OFFER');
  });

  it('Requirement #4: Saved Jobs (idempotent PUT and DELETE)', async () => {
    // Save job
    const saveRes = await request(app.getHttpServer())
      .put(`/api/v1/me/saved-jobs/${targetJobId}`)
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(saveRes.status).toBe(200);

    // List saved jobs
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/me/saved-jobs')
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.some((s: any) => s.jobId === targetJobId)).toBe(true);

    // Unsave job
    const unsaveRes = await request(app.getHttpServer())
      .delete(`/api/v1/me/saved-jobs/${targetJobId}`)
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(unsaveRes.status).toBe(200);
  });
});
