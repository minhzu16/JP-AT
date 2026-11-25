import { PrismaClient, Role, MemberRole, DocumentKind, ScanStatus } from '@prisma/client';

// Valid bcrypt hash of 'Password123!@#'
const DEFAULT_HASH = '$2a$10$1ESppdhUQfo5rxO9msSgTe8DqM1hJTidAYk.LfaJ/XP9V.8uJiUI6';

export async function seedCompaniesAndUsers(
  prisma: PrismaClient,
  createdSkills: Record<string, string>
) {
  const vng = await prisma.company.create({
    data: {
      name: 'VNG Corporation',
      slug: 'vng-corporation',
      website: 'https://vng.com.vn',
      description: 'VNG là công ty công nghệ hàng đầu Việt Nam với hệ sinh thái Zalo, Zing, VNG Cloud và Game Studio.',
      logoKey: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
      verifiedAt: new Date(),
    },
  });

  const fpt = await prisma.company.create({
    data: {
      name: 'FPT Software',
      slug: 'fpt-software',
      website: 'https://fptsoftware.com',
      description: 'Công ty công nghệ toàn cầu hàng đầu Đông Nam Á, cung cấp giải pháp chuyển đổi số cho hàng triệu doanh nghiệp.',
      logoKey: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
      verifiedAt: new Date(),
    },
  });

  const viettel = await prisma.company.create({
    data: {
      name: 'Viettel Solutions',
      slug: 'viettel-solutions',
      website: 'https://viettelsolutions.vn',
      description: 'Tổng Công ty Giải pháp Doanh nghiệp Viettel - tiên phong kiến tạo xã hội số.',
      logoKey: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&auto=format&fit=crop&q=80',
      verifiedAt: new Date(),
    },
  });

  const adminUser = await prisma.user.create({
    data: { email: 'admin@jobportal.vn', passwordHash: DEFAULT_HASH, role: Role.ADMIN, emailVerifiedAt: new Date() },
  });

  const recruiterVngUser = await prisma.user.create({
    data: { email: 'recruiter.vng@gmail.com', passwordHash: DEFAULT_HASH, role: Role.RECRUITER, emailVerifiedAt: new Date() },
  });
  await prisma.companyMember.create({ data: { companyId: vng.id, userId: recruiterVngUser.id, memberRole: MemberRole.ADMIN } });

  const recruiterFptUser = await prisma.user.create({
    data: { email: 'recruiter.fpt@gmail.com', passwordHash: DEFAULT_HASH, role: Role.RECRUITER, emailVerifiedAt: new Date() },
  });
  await prisma.companyMember.create({ data: { companyId: fpt.id, userId: recruiterFptUser.id, memberRole: MemberRole.RECRUITER } });

  const candUser1 = await prisma.user.create({
    data: { email: 'candidate1@gmail.com', passwordHash: DEFAULT_HASH, role: Role.CANDIDATE, emailVerifiedAt: new Date() },
  });
  const candProfile1 = await prisma.candidateProfile.create({
    data: {
      userId: candUser1.id,
      fullName: 'Trần Minh Quân',
      headline: 'Senior Full-Stack Engineer | React, Next.js & NestJS',
      summary: 'Kỹ sư phần mềm hơn 5 năm kinh nghiệm kiến trúc hệ thống phân tán, web app hiệu năng cao và tối ưu hóa PostgreSQL.',
      location: 'Hồ Chí Minh, Việt Nam',
      yearsExperience: 5,
    },
  });
  await prisma.candidateSkill.createMany({
    data: [
      { candidateId: candProfile1.id, skillId: createdSkills['TypeScript'], level: 5, years: 5 },
      { candidateId: candProfile1.id, skillId: createdSkills['React'], level: 5, years: 5 },
      { candidateId: candProfile1.id, skillId: createdSkills['Next.js'], level: 5, years: 4 },
      { candidateId: candProfile1.id, skillId: createdSkills['NestJS'], level: 4, years: 4 },
      { candidateId: candProfile1.id, skillId: createdSkills['PostgreSQL'], level: 4, years: 4 },
      { candidateId: candProfile1.id, skillId: createdSkills['Docker'], level: 4, years: 3 },
      { candidateId: candProfile1.id, skillId: createdSkills['Redis'], level: 4, years: 3 },
    ],
  });
  const candDoc1 = await prisma.document.create({
    data: {
      ownerId: candProfile1.id,
      kind: DocumentKind.RESUME,
      originalFilename: 'Tran_Minh_Quan_CV_Senior_Fullstack.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 245000,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      storageKey: `resumes/${candProfile1.id}/tran-minh-quan-cv-2026.pdf`,
      pageCount: 2,
      scanStatus: ScanStatus.CLEAN,
      isDefault: true,
      parsedText: 'Trần Minh Quân - Senior Full-stack Engineer. TypeScript, React, Next.js, NestJS, Docker, PostgreSQL.',
    },
  });

  const candUser2 = await prisma.user.create({
    data: { email: 'candidate2@gmail.com', passwordHash: DEFAULT_HASH, role: Role.CANDIDATE, emailVerifiedAt: new Date() },
  });
  const candProfile2 = await prisma.candidateProfile.create({
    data: {
      userId: candUser2.id,
      fullName: 'Lê Thị Thu Hà',
      headline: 'Frontend Engineer | React & Tailwind CSS Specialist',
      summary: 'Lập trình viên Frontend yêu thích thiết kế UI/UX hiện đại, responsive và tối ưu Web Vitals.',
      location: 'Hà Nội, Việt Nam',
      yearsExperience: 3,
    },
  });
  await prisma.candidateSkill.createMany({
    data: [
      { candidateId: candProfile2.id, skillId: createdSkills['JavaScript'], level: 4, years: 3 },
      { candidateId: candProfile2.id, skillId: createdSkills['TypeScript'], level: 4, years: 2 },
      { candidateId: candProfile2.id, skillId: createdSkills['React'], level: 4, years: 3 },
      { candidateId: candProfile2.id, skillId: createdSkills['Tailwind CSS'], level: 5, years: 3 },
    ],
  });
  const candDoc2 = await prisma.document.create({
    data: {
      ownerId: candProfile2.id,
      kind: DocumentKind.RESUME,
      originalFilename: 'Le_Thu_Ha_CV_Frontend.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 185000,
      storageKey: `resumes/${candProfile2.id}/le-thu-ha-cv.pdf`,
      scanStatus: ScanStatus.CLEAN,
      isDefault: true,
    },
  });

  console.log('✅ Seeded users, profiles, skills and resume documents.');
  return { vng, fpt, viettel, adminUser, recruiterVngUser, recruiterFptUser, candProfile1, candDoc1, candProfile2, candDoc2 };
}
