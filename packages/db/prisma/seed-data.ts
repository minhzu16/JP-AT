export const SKILL_LIST = [
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

export const VNG_FULLSTACK_DESCRIPTION = `VNG đang tìm kiếm Senior Full-stack Engineer tham gia xây dựng nền tảng SaaS quy mô hàng triệu người dùng.
      
      Yêu cầu:
      - Tối thiểu 4 năm kinh nghiệm với TypeScript, React và NestJS.
      - Thành thạo thiết kế Database với PostgreSQL, tối ưu truy vấn Index, Transaction.
      - Có kinh nghiệm với Docker, Redis Queue (BullMQ) và Microservices.
      - Tinh thần trách nhiệm cao, tư duy Clean Code và SOLID.
      
      Quyền lợi:
      - Mức lương cạnh tranh từ 45 - 65 triệu VNĐ/tháng.
      - Thưởng tháng 13 + thưởng KPI lên đến 3 tháng lương.
      - Bảo hiểm sức khỏe quốc tế cao cấp, phụ cấp cơm trưa và tập gym.`;

export const FPT_FRONTEND_DESCRIPTION = `Phát triển giao diện web portal hiện đại cho khách hàng toàn cầu tại Nhật Bản và Singapore.
      
      Yêu cầu:
      - Từ 2 năm kinh nghiệm Frontend với React, Next.js.
      - Sử dụng thành thạo Tailwind CSS, TypeScript.
      - Hiểu biết về SEO, Core Web Vitals, SSR/SSG.`;

export const APP1_MATCH_BREAKDOWN = {
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
};
