"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Valid bcrypt hash of 'Password123!@#'
const DEFAULT_HASH = '$2a$10$1ESppdhUQfo5rxO9msSgTe8DqM1hJTidAYk.LfaJ/XP9V.8uJiUI6';
async function main() {
    console.log('🌱 Starting database seed...');
    // 1. Clean existing records in reverse dependency order
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
    // 2. Seed Skills
    const skillList = [
        { name: 'TypeScript', slug: 'typescript', category: 'Programming Language' },
        { name: 'JavaScript', slug: 'javascript', category: 'Programming Language' },
        { name: 'React', slug: 'react', category: 'Frontend' },
        { name: 'Next.js', slug: 'nextjs', category: 'Frontend' },
        { name: 'Vue.js', slug: 'vuejs', category: 'Frontend' },
        { name: 'Node.js', slug: 'nodejs', category: 'Backend' },
        { name: 'NestJS', slug: 'nestjs', category: 'Backend' },
        { name: 'PostgreSQL', slug: 'postgresql', category: 'Database' },
        { name: 'MySQL', slug: 'mysql', category: 'Database' },
        { name: 'MongoDB', slug: 'mongodb', category: 'Database' },
        { name: 'Redis', slug: 'redis', category: 'Cache / Queue' },
        { name: 'Docker', slug: 'docker', category: 'DevOps' },
        { name: 'Kubernetes', slug: 'kubernetes', category: 'DevOps' },
        { name: 'AWS', slug: 'aws', category: 'Cloud' },
        { name: 'GCP', slug: 'gcp', category: 'Cloud' },
        { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'Frontend' },
        { name: 'GraphQL', slug: 'graphql', category: 'API' },
        { name: 'Python', slug: 'python', category: 'Programming Language' },
        { name: 'Golang', slug: 'golang', category: 'Programming Language' },
        { name: 'Machine Learning', slug: 'machine-learning', category: 'AI' },
    ];
    const createdSkills = {};
    for (const s of skillList) {
        const item = await prisma.skill.create({
            data: s,
        });
        createdSkills[s.name] = item.id;
    }
    console.log(`✅ Seeded ${Object.keys(createdSkills).length} skills.`);
    // 3. Seed Companies
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
    // 4. Seed Users
    // 4.1 Platform Admin
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@jobportal.vn',
            passwordHash: DEFAULT_HASH,
            role: client_1.Role.ADMIN,
            emailVerifiedAt: new Date(),
        },
    });
    // 4.2 Recruiters
    const recruiterVngUser = await prisma.user.create({
        data: {
            email: 'recruiter.vng@gmail.com',
            passwordHash: DEFAULT_HASH,
            role: client_1.Role.RECRUITER,
            emailVerifiedAt: new Date(),
        },
    });
    await prisma.companyMember.create({
        data: {
            companyId: vng.id,
            userId: recruiterVngUser.id,
            memberRole: client_1.MemberRole.ADMIN,
        },
    });
    const recruiterFptUser = await prisma.user.create({
        data: {
            email: 'recruiter.fpt@gmail.com',
            passwordHash: DEFAULT_HASH,
            role: client_1.Role.RECRUITER,
            emailVerifiedAt: new Date(),
        },
    });
    await prisma.companyMember.create({
        data: {
            companyId: fpt.id,
            userId: recruiterFptUser.id,
            memberRole: client_1.MemberRole.RECRUITER,
        },
    });
    // 4.3 Candidates
    const candUser1 = await prisma.user.create({
        data: {
            email: 'candidate1@gmail.com',
            passwordHash: DEFAULT_HASH,
            role: client_1.Role.CANDIDATE,
            emailVerifiedAt: new Date(),
        },
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
    // Add Candidate 1 Skills
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
            kind: client_1.DocumentKind.RESUME,
            originalFilename: 'Tran_Minh_Quan_CV_Senior_Fullstack.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 245000,
            sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            storageKey: `resumes/${candProfile1.id}/tran-minh-quan-cv-2026.pdf`,
            pageCount: 2,
            scanStatus: client_1.ScanStatus.CLEAN,
            isDefault: true,
            parsedText: 'Trần Minh Quân - Senior Full-stack Engineer. TypeScript, React, Next.js, NestJS, Docker, PostgreSQL.',
        },
    });
    const candUser2 = await prisma.user.create({
        data: {
            email: 'candidate2@gmail.com',
            passwordHash: DEFAULT_HASH,
            role: client_1.Role.CANDIDATE,
            emailVerifiedAt: new Date(),
        },
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
            kind: client_1.DocumentKind.RESUME,
            originalFilename: 'Le_Thu_Ha_CV_Frontend.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 185000,
            storageKey: `resumes/${candProfile2.id}/le-thu-ha-cv.pdf`,
            scanStatus: client_1.ScanStatus.CLEAN,
            isDefault: true,
        },
    });
    console.log('✅ Seeded users, profiles, skills and resume documents.');
    // 5. Seed Jobs
    // Job 1: VNG Full-stack
    const jobVng1 = await prisma.job.create({
        data: {
            companyId: vng.id,
            createdById: recruiterVngUser.id,
            title: 'Senior Full-stack Engineer (React & NestJS)',
            description: `VNG đang tìm kiếm Senior Full-stack Engineer tham gia xây dựng nền tảng SaaS quy mô hàng triệu người dùng.
      
      Yêu cầu:
      - Tối thiểu 4 năm kinh nghiệm với TypeScript, React và NestJS.
      - Thành thạo thiết kế Database với PostgreSQL, tối ưu truy vấn Index, Transaction.
      - Có kinh nghiệm với Docker, Redis Queue (BullMQ) và Microservices.
      - Tinh thần trách nhiệm cao, tư duy Clean Code và SOLID.
      
      Quyền lợi:
      - Mức lương cạnh tranh từ 45 - 65 triệu VNĐ/tháng.
      - Thưởng tháng 13 + thưởng KPI lên đến 3 tháng lương.
      - Bảo hiểm sức khỏe quốc tế cao cấp, phụ cấp cơm trưa và tập gym.`,
            location: 'Hồ Chí Minh',
            workMode: client_1.WorkMode.HYBRID,
            employmentType: client_1.EmploymentType.FULL_TIME,
            level: client_1.JobLevel.SENIOR,
            salaryMin: 45000000,
            salaryMax: 65000000,
            status: client_1.JobStatus.PUBLISHED,
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
    // Job 2: VNG DevOps
    const jobVng2 = await prisma.job.create({
        data: {
            companyId: vng.id,
            createdById: recruiterVngUser.id,
            title: 'Senior DevOps / Cloud Infrastructure Engineer',
            description: `Xây dựng và vận hành hạ tầng Kubernetes đa cụm (Multi-cluster), CI/CD pipeline tự động và hệ thống quan sát Observability.`,
            location: 'Hồ Chí Minh',
            workMode: client_1.WorkMode.ONSITE,
            employmentType: client_1.EmploymentType.FULL_TIME,
            level: client_1.JobLevel.SENIOR,
            salaryMin: 50000000,
            salaryMax: 75000000,
            status: client_1.JobStatus.PUBLISHED,
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
    // Job 3: FPT Frontend Developer
    const jobFpt1 = await prisma.job.create({
        data: {
            companyId: fpt.id,
            createdById: recruiterFptUser.id,
            title: 'Frontend Engineer (React / Next.js & Tailwind)',
            description: `Phát triển giao diện web portal hiện đại cho khách hàng toàn cầu tại Nhật Bản và Singapore.
      
      Yêu cầu:
      - Từ 2 năm kinh nghiệm Frontend với React, Next.js.
      - Sử dụng thành thạo Tailwind CSS, TypeScript.
      - Hiểu biết về SEO, Core Web Vitals, SSR/SSG.`,
            location: 'Hà Nội',
            workMode: client_1.WorkMode.HYBRID,
            employmentType: client_1.EmploymentType.FULL_TIME,
            level: client_1.JobLevel.MID,
            salaryMin: 25000000,
            salaryMax: 40000000,
            status: client_1.JobStatus.PUBLISHED,
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
    // Job 4: Viettel AI Engineer
    const jobViettel1 = await prisma.job.create({
        data: {
            companyId: viettel.id,
            createdById: adminUser.id,
            title: 'AI / Machine Learning Engineer (NLP & LLMs)',
            description: `Nghiên cứu và phát triển các mô hình trí tuệ nhân tạo nhận dạng giọng nói, xử lý ngôn ngữ tự nhiên và tích hợp LLM vào ứng dụng doanh nghiệp.`,
            location: 'Hà Nội',
            workMode: client_1.WorkMode.ONSITE,
            employmentType: client_1.EmploymentType.FULL_TIME,
            level: client_1.JobLevel.SENIOR,
            salaryMin: 40000000,
            salaryMax: 70000000,
            status: client_1.JobStatus.PUBLISHED,
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
    // 6. Seed Applications & Pipeline status
    // Candidate 1 applies to VNG Fullstack (Status: INTERVIEW)
    const app1 = await prisma.application.create({
        data: {
            jobId: jobVng1.id,
            candidateId: candProfile1.id,
            resumeDocumentId: candDoc1.id,
            coverLetter: 'Kính gửi ban tuyển dụng VNG, tôi rất hào hứng với cơ hội gia nhập đội ngũ phát triển sản phẩm SaaS hiệu năng cao tại VNG.',
            status: client_1.ApplicationStatus.INTERVIEW,
            appliedAt: new Date(Date.now() - 2 * 86400000),
        },
    });
    // Application 1 history
    await prisma.applicationStatusHistory.createMany({
        data: [
            {
                applicationId: app1.id,
                fromStatus: client_1.ApplicationStatus.APPLIED,
                toStatus: client_1.ApplicationStatus.SCREENING,
                changedById: recruiterVngUser.id,
                reason: 'Hồ sơ phù hợp với yêu cầu kinh nghiệm NestJS và React',
                changedAt: new Date(Date.now() - 1.5 * 86400000),
            },
            {
                applicationId: app1.id,
                fromStatus: client_1.ApplicationStatus.SCREENING,
                toStatus: client_1.ApplicationStatus.INTERVIEW,
                changedById: recruiterVngUser.id,
                reason: 'Chuyển sang phỏng vấn kỹ thuật vòng 1',
                changedAt: new Date(Date.now() - 1 * 86400000),
            },
        ],
    });
    // Interview for Application 1
    await prisma.interview.create({
        data: {
            applicationId: app1.id,
            round: 1,
            scheduledAt: new Date(Date.now() + 2 * 86400000),
            durationMin: 60,
            mode: client_1.InterviewMode.ONLINE,
            locationOrLink: 'https://meet.google.com/vng-interview-demo',
            interviewerNames: 'Nguyễn Văn Toàn (Tech Lead), Trần Thu Thảo (HRBP)',
            status: client_1.InterviewStatus.SCHEDULED,
            feedback: 'Ứng viên có kiến trúc vững, chuẩn bị phỏng vấn system design.',
        },
    });
    // Note for Application 1
    await prisma.applicationNote.create({
        data: {
            applicationId: app1.id,
            authorId: recruiterVngUser.id,
            body: 'Ứng viên có dự án mã nguồn mở ấn tượng, kỹ năng NestJS và PostgreSQL rất tốt.',
        },
    });
    // Match score for Application 1 (Candidate 1 has all required skills -> 100%)
    await prisma.matchScore.create({
        data: {
            applicationId: app1.id,
            score: 100,
            breakdown: JSON.stringify({
                matched: [
                    { name: 'TypeScript', isRequired: true, weight: 5, matchDegree: 1.0 },
                    { name: 'React', isRequired: true, weight: 4, matchDegree: 1.0 },
                    { name: 'NestJS', isRequired: true, weight: 5, matchDegree: 1.0 },
                    { name: 'PostgreSQL', isRequired: true, weight: 4, matchDegree: 1.0 },
                    { name: 'Docker', isRequired: false, weight: 3, matchDegree: 1.0 },
                    { name: 'Redis', isRequired: false, weight: 3, matchDegree: 1.0 },
                ],
                missingRequired: [],
                missingOptional: [],
                hasAllRequired: true,
            }),
            modelVersion: 'deterministic-v1.0',
        },
    });
    // Candidate 2 applies to FPT Frontend (Status: SCREENING)
    const app2 = await prisma.application.create({
        data: {
            jobId: jobFpt1.id,
            candidateId: candProfile2.id,
            resumeDocumentId: candDoc2.id,
            coverLetter: 'Xin chào FPT Software, tôi mong muốn đóng góp kỹ năng React và Tailwind CSS vào các dự án quốc tế.',
            status: client_1.ApplicationStatus.SCREENING,
            appliedAt: new Date(Date.now() - 1 * 86400000),
        },
    });
    await prisma.applicationStatusHistory.create({
        data: {
            applicationId: app2.id,
            fromStatus: client_1.ApplicationStatus.APPLIED,
            toStatus: client_1.ApplicationStatus.SCREENING,
            changedById: recruiterFptUser.id,
            reason: 'Đã xem CV, đáp ứng yêu cầu kỹ năng Frontend',
            changedAt: new Date(Date.now() - 0.5 * 86400000),
        },
    });
    // Candidate 1 saved jobs
    await prisma.savedJob.create({
        data: {
            candidateId: candProfile1.id,
            jobId: jobFpt1.id,
        },
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
