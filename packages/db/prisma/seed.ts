import { PrismaClient, JobStatus, WorkMode, EmploymentType, JobLevel, ApplicationStatus, InterviewStatus, InterviewMode } from '@prisma/client';
import {
  SKILL_LIST,
  VNG_FULLSTACK_DESCRIPTION,
  FPT_FRONTEND_DESCRIPTION,
  APP1_MATCH_BREAKDOWN,
} from './seed-data';
import { seedCompaniesAndUsers } from './seed-entities';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.matchScore.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.applicationNote.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.document.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing database tables.');
}

async function seedSkills() {
  const createdSkills: Record<string, string> = {};
  for (const s of SKILL_LIST) {
    const item = await prisma.skill.create({ data: s });
    createdSkills[s.name] = item.id;
  }
  console.log(`✅ Seeded ${Object.keys(createdSkills).length} skills.`);
  return createdSkills;
}

async function main() {
  console.log('🌱 Starting database seed...');
  await clearDatabase();
  const createdSkills = await seedSkills();
  const {
    vng,
    fpt,
    viettel,
    adminUser,
    recruiterVngUser,
    recruiterFptUser,
    candProfile1,
    candDoc1,
    candProfile2,
    candDoc2,
  } = await seedCompaniesAndUsers(prisma, createdSkills);

  const jobVng1 = await prisma.job.create({
    data: {
      companyId: vng.id,
      createdById: recruiterVngUser.id,
      title: 'Senior Full-stack Engineer (React & NestJS)',
      description: VNG_FULLSTACK_DESCRIPTION,
      location: 'Hồ Chí Minh',
      workMode: WorkMode.HYBRID,
      employmentType: EmploymentType.FULL_TIME,
      level: JobLevel.SENIOR,
      salaryMin: 45000000,
      salaryMax: 65000000,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 2 * 86400000),
      expiresAt: new Date(Date.now() + 28 * 86400000),
    },
  });
  await prisma.jobSkill.createMany({
    data: [
      { jobId: jobVng1.id, skillId: createdSkills['TypeScript'], isRequired: true, weight: 5 },
      { jobId: jobVng1.id, skillId: createdSkills['React'], isRequired: true, weight: 4 },
      { jobId: jobVng1.id, skillId: createdSkills['NestJS'], isRequired: true, weight: 5 },
      { jobId: jobVng1.id, skillId: createdSkills['PostgreSQL'], isRequired: true, weight: 4 },
      { jobId: jobVng1.id, skillId: createdSkills['Docker'], isRequired: false, weight: 3 },
      { jobId: jobVng1.id, skillId: createdSkills['Redis'], isRequired: false, weight: 3 },
    ],
  });

  const jobVng2 = await prisma.job.create({
    data: {
      companyId: vng.id,
      createdById: recruiterVngUser.id,
      title: 'Senior DevOps / Cloud Infrastructure Engineer',
      description: 'Xây dựng và vận hành hạ tầng Kubernetes đa cụm (Multi-cluster), CI/CD pipeline tự động và hệ thống quan sát Observability.',
      location: 'Hồ Chí Minh',
      workMode: WorkMode.ONSITE,
      employmentType: EmploymentType.FULL_TIME,
      level: JobLevel.SENIOR,
      salaryMin: 50000000,
      salaryMax: 75000000,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 5 * 86400000),
    },
  });
  await prisma.jobSkill.createMany({
    data: [
      { jobId: jobVng2.id, skillId: createdSkills['Kubernetes'], isRequired: true, weight: 5 },
      { jobId: jobVng2.id, skillId: createdSkills['Docker'], isRequired: true, weight: 5 },
      { jobId: jobVng2.id, skillId: createdSkills['AWS'], isRequired: true, weight: 4 },
    ],
  });

  const jobFpt1 = await prisma.job.create({
    data: {
      companyId: fpt.id,
      createdById: recruiterFptUser.id,
      title: 'Frontend Engineer (React / Next.js & Tailwind)',
      description: FPT_FRONTEND_DESCRIPTION,
      location: 'Hà Nội',
      workMode: WorkMode.HYBRID,
      employmentType: EmploymentType.FULL_TIME,
      level: JobLevel.MID,
      salaryMin: 25000000,
      salaryMax: 40000000,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 3 * 86400000),
    },
  });
  await prisma.jobSkill.createMany({
    data: [
      { jobId: jobFpt1.id, skillId: createdSkills['React'], isRequired: true, weight: 5 },
      { jobId: jobFpt1.id, skillId: createdSkills['Next.js'], isRequired: true, weight: 4 },
      { jobId: jobFpt1.id, skillId: createdSkills['Tailwind CSS'], isRequired: true, weight: 4 },
      { jobId: jobFpt1.id, skillId: createdSkills['TypeScript'], isRequired: false, weight: 3 },
    ],
  });

  const jobViettel1 = await prisma.job.create({
    data: {
      companyId: viettel.id,
      createdById: adminUser.id,
      title: 'AI / Machine Learning Engineer (NLP & LLMs)',
      description: 'Nghiên cứu và phát triển các mô hình trí tuệ nhân tạo nhận dạng giọng nói, xử lý ngôn ngữ tự nhiên và tích hợp LLM vào ứng dụng doanh nghiệp.',
      location: 'Hà Nội',
      workMode: WorkMode.ONSITE,
      employmentType: EmploymentType.FULL_TIME,
      level: JobLevel.SENIOR,
      salaryMin: 40000000,
      salaryMax: 70000000,
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 1 * 86400000),
    },
  });
  await prisma.jobSkill.createMany({
    data: [
      { jobId: jobViettel1.id, skillId: createdSkills['Python'], isRequired: true, weight: 5 },
      { jobId: jobViettel1.id, skillId: createdSkills['Machine Learning'], isRequired: true, weight: 5 },
    ],
  });
  console.log('✅ Seeded jobs and job requirements.');

  const app1 = await prisma.application.create({
    data: {
      jobId: jobVng1.id,
      candidateId: candProfile1.id,
      resumeDocumentId: candDoc1.id,
      coverLetter: 'Kính gửi ban tuyển dụng VNG, tôi rất hào hứng với cơ hội gia nhập đội ngũ phát triển sản phẩm SaaS hiệu năng cao tại VNG.',
      status: ApplicationStatus.INTERVIEW,
      appliedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        applicationId: app1.id,
        fromStatus: ApplicationStatus.APPLIED,
        toStatus: ApplicationStatus.SCREENING,
        changedById: recruiterVngUser.id,
        reason: 'Hồ sơ phù hợp với yêu cầu kinh nghiệm NestJS và React',
        changedAt: new Date(Date.now() - 1.5 * 86400000),
      },
      {
        applicationId: app1.id,
        fromStatus: ApplicationStatus.SCREENING,
        toStatus: ApplicationStatus.INTERVIEW,
        changedById: recruiterVngUser.id,
        reason: 'Chuyển sang phỏng vấn kỹ thuật vòng 1',
        changedAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  await prisma.interview.create({
    data: {
      applicationId: app1.id,
      round: 1,
      scheduledAt: new Date(Date.now() + 2 * 86400000),
      durationMin: 60,
      mode: InterviewMode.ONLINE,
      locationOrLink: 'https://meet.google.com/vng-interview-demo',
      interviewerNames: 'Nguyễn Văn Toàn (Tech Lead), Trần Thu Thảo (HRBP)',
      status: InterviewStatus.SCHEDULED,
      feedback: 'Ứng viên có kiến trúc vững, chuẩn bị phỏng vấn system design.',
    },
  });

  await prisma.applicationNote.create({
    data: {
      applicationId: app1.id,
      authorId: recruiterVngUser.id,
      body: 'Ứng viên có dự án mã nguồn mở ấn tượng, kỹ năng NestJS và PostgreSQL rất tốt.',
    },
  });

  await prisma.matchScore.create({
    data: {
      applicationId: app1.id,
      score: 100,
      breakdown: JSON.stringify(APP1_MATCH_BREAKDOWN),
      modelVersion: 'deterministic-v1.0',
    },
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: jobFpt1.id,
      candidateId: candProfile2.id,
      resumeDocumentId: candDoc2.id,
      coverLetter: 'Xin chào FPT Software, tôi mong muốn đóng góp kỹ năng React và Tailwind CSS vào các dự án quốc tế.',
      status: ApplicationStatus.SCREENING,
      appliedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app2.id,
      fromStatus: ApplicationStatus.APPLIED,
      toStatus: ApplicationStatus.SCREENING,
      changedById: recruiterFptUser.id,
      reason: 'Đã xem CV, đáp ứng yêu cầu kỹ năng Frontend',
      changedAt: new Date(Date.now() - 0.5 * 86400000),
    },
  });

  await prisma.savedJob.create({
    data: { candidateId: candProfile1.id, jobId: jobFpt1.id },
  });

  console.log('✅ Seeded applications, interview schedules, status history and saved jobs.');
  console.log('🎉 Seed completed successfully!');
  console.log(`
  Demo Credentials:
  - Admin: admin@jobportal.vn / Password123!@#
  - Recruiter (VNG): recruiter.vng@gmail.com / Password123!@#
  - Recruiter (FPT): recruiter.fpt@gmail.com / Password123!@#
  - Candidate 1: candidate1@gmail.com / Password123!@# (Trần Minh Quân)
  - Candidate 2: candidate2@gmail.com / Password123!@# (Lê Thị Thu Hà)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
