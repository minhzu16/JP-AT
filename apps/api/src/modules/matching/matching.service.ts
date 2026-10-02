import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateSkillMatch, anonymizeCandidateProfile } from '@jobportal/shared';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async compareJobWithCandidate(userId: string, jobId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (!candidate) {
      throw new BadRequestException('Candidate profile not found');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: { include: { skill: true } },
        company: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const jobSkills = job.skills.map((js) => ({
      id: js.skill.id,
      name: js.skill.name,
      isRequired: js.isRequired,
      weight: js.weight,
    }));

    const candSkills = candidate.skills.map((cs) => ({
      id: cs.skill.id,
      name: cs.skill.name,
      level: cs.level,
      years: cs.years,
    }));

    const matchResult = calculateSkillMatch(jobSkills, candSkills);

    return {
      job: {
        id: job.id,
        title: job.title,
        companyName: job.company.name,
      },
      ...matchResult,
    };
  }

  async getAiResumeFeedback(userId: string, jobId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        documents: { where: { isDefault: true, deletedAt: null } },
      },
    });

    if (!candidate) {
      throw new BadRequestException('Candidate profile not found');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const jobSkills = job.skills.map((js) => ({
      id: js.skill.id,
      name: js.skill.name,
      isRequired: js.isRequired,
      weight: js.weight,
    }));
    const candSkills = candidate.skills.map((cs) => ({
      id: cs.skill.id,
      name: cs.skill.name,
      level: cs.level,
      years: cs.years,
    }));

    const match = calculateSkillMatch(jobSkills, candSkills);

    // Redact any PII before processing
    const anonymizedSummary = anonymizeCandidateProfile(candidate.summary || '');

    // Constructive, bias-free suggestions
    const suggestions: string[] = [];

    if (match.breakdown.missingRequired.length > 0) {
      const skills = match.breakdown.missingRequired.map((s) => s.name).join(', ');
      suggestions.push(
        `Bổ sung minh chứng hoặc dự án liên quan đến các kỹ năng bắt buộc: ${skills}. Nếu bạn đã từng sử dụng trong các dự án thực tế, hãy đưa vào phần kinh nghiệm.`
      );
    }

    if (match.breakdown.missingOptional.length > 0) {
      const optSkills = match.breakdown.missingOptional.map((s) => s.name).join(', ');
      suggestions.push(
        `Cân nhắc làm nổi bật các kỹ năng bổ trợ: ${optSkills} để tạo lợi thế cạnh tranh vượt trội.`
      );
    }

    if (candidate.yearsExperience < 2 && job.level === 'SENIOR') {
      suggestions.push(
        'Vị trí này ưu tiên ứng viên cấp bậc Senior. Hãy tập trung làm nổi bật các thành tích có tác động kinh doanh lớn (impact metrics) và năng lực tự chủ giải quyết vấn đề.'
      );
    } else {
      suggestions.push(
        'Sử dụng công thức STAR (Tình huống - Nhiệm vụ - Hành động - Kết quả) khi mô tả các gạch đầu dòng trong kinh nghiệm làm việc để làm rõ đóng góp của bạn.'
      );
    }

    suggestions.push(
      'Định lượng các kết quả công việc bằng số liệu cụ thể (ví dụ: "Tối ưu hóa 40% thời gian tải trang", "Xử lý hơn 10.000 requests/giây").'
    );

    return {
      jobId,
      score: match.score,
      disclaimer: 'Gợi ý từ AI hỗ trợ khách quan — Hệ thống tuyệt đối không tự động loại hồ sơ dựa trên điểm số này.',
      anonymizedProfileProcessed: true,
      suggestions,
      breakdown: match.breakdown,
    };
  }
}
