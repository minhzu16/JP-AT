import { describe, it, expect } from 'vitest';
import {
  calculateSkillMatch,
  anonymizeCandidateProfile,
  areSkillsEquivalent,
} from './matching.js';

describe('Skill Matching & Anti-bias Algorithm', () => {
  it('should calculate 100% when all skills match', () => {
    const jobSkills = [
      { id: '1', name: 'TypeScript', isRequired: true, weight: 3 },
      { id: '2', name: 'React', isRequired: true, weight: 2 },
    ];
    const candidateSkills = [
      { id: '1', name: 'TypeScript' },
      { id: '2', name: 'React' },
    ];

    const result = calculateSkillMatch(jobSkills, candidateSkills);
    expect(result.score).toBe(100);
    expect(result.breakdown.matched.length).toBe(2);
    expect(result.breakdown.missingRequired.length).toBe(0);
    expect(result.breakdown.hasAllRequired).toBe(true);
    expect(result.advisoryOnly).toBe(true);
  });

  it('should recognize skill synonyms (e.g. ts -> typescript, nodejs -> node.js)', () => {
    expect(areSkillsEquivalent('ts', 'TypeScript')).toBe(true);
    expect(areSkillsEquivalent('PostgreSQL', 'postgres')).toBe(true);
    expect(areSkillsEquivalent('react.js', 'react')).toBe(true);
  });

  it('should accurately calculate partial matches and flag missing required skills without auto-rejecting', () => {
    const jobSkills = [
      { id: '1', name: 'TypeScript', isRequired: true, weight: 3 }, // 3 / 6 = 50%
      { id: '2', name: 'Docker', isRequired: true, weight: 2 },     // missing required
      { id: '3', name: 'AWS', isRequired: false, weight: 1 },       // missing optional
    ];
    const candidateSkills = [
      { id: '1', name: 'TypeScript' },
    ];

    const result = calculateSkillMatch(jobSkills, candidateSkills);
    // earned: 3, total: 6 -> 50%
    expect(result.score).toBe(50);
    expect(result.breakdown.matched.map((m) => m.name)).toEqual(['TypeScript']);
    expect(result.breakdown.missingRequired.map((m) => m.name)).toEqual(['Docker']);
    expect(result.breakdown.missingOptional.map((m) => m.name)).toEqual(['AWS']);
    expect(result.breakdown.hasAllRequired).toBe(false);
    expect(result.advisoryOnly).toBe(true);
  });

  it('should strip PII effectively from candidate profile text', () => {
    const raw = `Ứng viên: Nguyễn Văn A. Email: nguyenvana@gmail.com, Số điện thoại: 0987654321.
    Ngày sinh: 15/08/1995 (31 tuổi). Giới tính: Nam. Tình trạng hôn nhân: Đã kết hôn.
    5 năm kinh nghiệm phát triển phần mềm Node.js và React.`;

    const cleaned = anonymizeCandidateProfile(raw);
    expect(cleaned).not.toContain('nguyenvana@gmail.com');
    expect(cleaned).not.toContain('0987654321');
    expect(cleaned).not.toContain('15/08/1995');
    expect(cleaned).not.toContain('31 tuổi');
    expect(cleaned).not.toContain('Nam');
    expect(cleaned).not.toContain('Đã kết hôn');
    expect(cleaned).toContain('[EMAIL_REDACTED]');
    expect(cleaned).toContain('[PHONE_REDACTED]');
    expect(cleaned).toContain('5 năm kinh nghiệm phát triển phần mềm Node.js và React.');
  });
});
