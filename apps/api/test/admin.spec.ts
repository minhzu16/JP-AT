import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
const request = require('supertest');
import { AdminController } from '../src/modules/admin/admin.controller';
import { AdminService } from '../src/modules/admin/admin.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtStrategy } from '../src/common/jwt.strategy';
import { RolesGuard } from '../src/common/roles.guard';
import { Role, JobStatus } from '@jobportal/shared';
import { requireSecret } from '../src/common/secrets';

describe('Admin API & Guards', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const prismaMock: any = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
    },
    candidateProfile: {
      count: jest.fn(),
    },
    company: {
      count: jest.fn(),
    },
    application: {
      count: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
    $transaction: jest.fn(),
  };

  const adminCallerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const targetUserId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  const jobId = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

  function signToken(payload: { sub?: string; id?: string; email?: string; role: string; [key: string]: any }) {
    return jwtService.sign(payload, { expiresIn: '1h' });
  }

  beforeAll(async () => {
    jwtService = new JwtService({ secret: requireSecret('JWT_ACCESS_SECRET') });

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      controllers: [AdminController],
      providers: [
        AdminService,
        JwtStrategy,
        RolesGuard,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation((arg: any) => {
      if (typeof arg === 'function') {
        return arg(prismaMock);
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      return Promise.resolve(arg);
    });
    prismaMock.$executeRaw.mockResolvedValue(1);
  });

  describe('Authentication & Authorization Guards', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer()).get('/admin/users');
      expect(res.status).toBe(401);
    });

    it('returns 403 when CANDIDATE token is provided', async () => {
      const candidateId = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
      const token = signToken({ sub: candidateId, role: Role.CANDIDATE });

      prismaMock.user.findUnique.mockResolvedValue({
        id: candidateId,
        email: 'candidate@example.com',
        role: Role.CANDIDATE,
        status: 'ACTIVE',
      });

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('returns 401 when token says ADMIN but DB status is SUSPENDED', async () => {
      const suspendedAdminId = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
      const token = signToken({ sub: suspendedAdminId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: suspendedAdminId,
        email: 'suspended@example.com',
        role: Role.ADMIN,
        status: 'SUSPENDED',
      });

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });

    it('returns 403 when token says ADMIN but DB role is CANDIDATE', async () => {
      const demotedId = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
      const token = signToken({ sub: demotedId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: demotedId,
        email: 'demoted@example.com',
        role: Role.CANDIDATE,
        status: 'ACTIVE',
      });

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /admin/users', () => {
    it('never returns passwordHash and uses orderBy with the id tiebreak', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: adminCallerId,
        email: 'admin@example.com',
        role: Role.ADMIN,
        status: 'ACTIVE',
      });

      const mockUsers = [
        {
          id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
          email: 'user1@example.com',
          role: Role.CANDIDATE,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
        {
          id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
          email: 'user2@example.com',
          role: Role.RECRUITER,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);
      prismaMock.user.count.mockResolvedValue(mockUsers.length);

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(2);

      // Verify passwordHash is never returned
      for (const item of res.body.items) {
        expect(item.passwordHash).toBeUndefined();
      }

      // Verify findMany was called with orderBy tiebreak and select omitting passwordHash
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        })
      );
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('returns 400 when modifying own account (PATCH /admin/users/<own id>)', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: adminCallerId,
        email: 'admin@example.com',
        role: Role.ADMIN,
        status: 'ACTIVE',
      });

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${adminCallerId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: Role.CANDIDATE });

      expect(res.status).toBe(400);
    });

    it('returns 400 when user id is not a uuid (PATCH /admin/users/not-a-uuid)', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: adminCallerId,
        email: 'admin@example.com',
        role: Role.ADMIN,
        status: 'ACTIVE',
      });

      const res = await request(app.getHttpServer())
        .patch('/admin/users/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: Role.CANDIDATE });

      expect(res.status).toBe(400);
    });

    it('returns 400 when demoting the only active ADMIN', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === adminCallerId) {
          return Promise.resolve({
            id: adminCallerId,
            email: 'admin@example.com',
            role: Role.ADMIN,
            status: 'ACTIVE',
          });
        }
        if (where.id === targetUserId) {
          return Promise.resolve({
            id: targetUserId,
            email: 'target@example.com',
            role: Role.ADMIN,
            status: 'ACTIVE',
          });
        }
        return Promise.resolve(null);
      });

      prismaMock.user.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: Role.CANDIDATE });

      expect(res.status).toBe(400);
    });

    it('returns 200 when demoting an admin and another active ADMIN exists', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === adminCallerId) {
          return Promise.resolve({
            id: adminCallerId,
            email: 'admin@example.com',
            role: Role.ADMIN,
            status: 'ACTIVE',
          });
        }
        if (where.id === targetUserId) {
          return Promise.resolve({
            id: targetUserId,
            email: 'target@example.com',
            role: Role.ADMIN,
            status: 'ACTIVE',
          });
        }
        return Promise.resolve(null);
      });

      prismaMock.user.count.mockResolvedValue(1);
      prismaMock.user.update.mockResolvedValue({
        id: targetUserId,
        email: 'target@example.com',
        role: Role.CANDIDATE,
        status: 'ACTIVE',
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: Role.CANDIDATE });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe(Role.CANDIDATE);
    });

    it('returns 400 without echoing input for invalid role or status', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: adminCallerId,
        email: 'admin@example.com',
        role: Role.ADMIN,
        status: 'ACTIVE',
      });

      const resInvalidRole = await request(app.getHttpServer())
        .patch(`/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'HACKER_ROLE' });

      expect(resInvalidRole.status).toBe(400);
      expect(resInvalidRole.body.message || resInvalidRole.body.detail).toBe('Invalid role');

      const resInvalidStatus = await request(app.getHttpServer())
        .patch(`/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'BOGUS_STATUS' });

      expect(resInvalidStatus.status).toBe(400);
      expect(resInvalidStatus.body.message || resInvalidStatus.body.detail).toBe('Invalid status');
    });
  });

  describe('PATCH /admin/jobs/:id/status', () => {
    it('sets publishedAt when status is updated to PUBLISHED', async () => {
      const token = signToken({ sub: adminCallerId, role: Role.ADMIN });

      prismaMock.user.findUnique.mockResolvedValue({
        id: adminCallerId,
        email: 'admin@example.com',
        role: Role.ADMIN,
        status: 'ACTIVE',
      });

      prismaMock.job.findUnique.mockResolvedValue({
        id: jobId,
        status: JobStatus.DRAFT,
        publishedAt: null,
      });

      prismaMock.job.update.mockImplementation(({ data }: any) => {
        return Promise.resolve({
          id: jobId,
          status: data.status,
          publishedAt: data.publishedAt,
          company: { name: 'Acme Corp' },
        });
      });

      const res = await request(app.getHttpServer())
        .patch(`/admin/jobs/${jobId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: JobStatus.PUBLISHED });

      expect(res.status).toBe(200);
      expect(prismaMock.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: jobId },
          data: expect.objectContaining({
            status: JobStatus.PUBLISHED,
            publishedAt: expect.any(Date),
          }),
        })
      );
    });
  });
});
