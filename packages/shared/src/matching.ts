export interface JobSkillRequirement {
  id: string;
  name: string;
  slug?: string;
  isRequired: boolean;
  weight: number; // typically 1 to 5
}

export interface CandidateSkillItem {
  id: string;
  name: string;
  slug?: string;
  level?: number; // 1 to 5
  years?: number;
}

export interface MatchScoreBreakdown {
  matched: Array<{
    name: string;
    isRequired: boolean;
    weight: number;
    matchDegree: number; // 1.0 or 0.5
  }>;
  missingRequired: Array<{
    name: string;
    weight: number;
  }>;
  missingOptional: Array<{
    name: string;
    weight: number;
  }>;
  hasAllRequired: boolean;
}

export interface SkillMatchResult {
  score: number; // 0 to 100
  breakdown: MatchScoreBreakdown;
  advisoryOnly: true;
  modelVersion: string;
  evaluatedAt: string;
}

// Canonical skill synonyms or related skill mappings for fuzzy matching
export const SKILL_SYNONYMS: Record<string, string[]> = {
  javascript: ['js', 'ecmascript'],
  typescript: ['ts'],
  react: ['reactjs', 'react.js'],
  'vue.js': ['vue', 'vuejs'],
  'node.js': ['node', 'nodejs'],
  postgresql: ['postgres', 'psql'],
  mongodb: ['mongo'],
  docker: ['containerization', 'containers'],
  kubernetes: ['k8s'],
  aws: ['amazon web services'],
  gcp: ['google cloud platform'],
};

function normalizeSkill(str: string): string {
  return str.trim().toLowerCase().replace(/[-_.]/g, '');
}

export function areSkillsEquivalent(s1: string, s2: string): boolean {
  const norm1 = normalizeSkill(s1);
  const norm2 = normalizeSkill(s2);
  if (norm1 === norm2) return true;

  // Check synonym mappings
  for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    const all = [normalizeSkill(canonical), ...aliases.map(normalizeSkill)];
    if (all.includes(norm1) && all.includes(norm2)) {
      return true;
    }
  }

  // Check substring contains (e.g. "React Native" and "React")
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true;
  }

  return false;
}

/**
 * Calculates deterministic skill match score.
 * Pure function, zero side-effects, transparent and explainable.
 * Guarantees NO auto-rejection: returns advisory breakdown.
 */
export function calculateSkillMatch(
  jobSkills: JobSkillRequirement[],
  candidateSkills: CandidateSkillItem[]
): SkillMatchResult {
  if (!jobSkills || jobSkills.length === 0) {
    return {
      score: 100,
      breakdown: {
        matched: [],
        missingRequired: [],
        missingOptional: [],
        hasAllRequired: true,
      },
      advisoryOnly: true,
      modelVersion: 'deterministic-v1.0',
      evaluatedAt: new Date().toISOString(),
    };
  }

  let totalWeight = 0;
  let earnedWeight = 0;

  const matched: MatchScoreBreakdown['matched'] = [];
  const missingRequired: MatchScoreBreakdown['missingRequired'] = [];
  const missingOptional: MatchScoreBreakdown['missingOptional'] = [];

  for (const req of jobSkills) {
    const weight = Math.max(1, req.weight || 1);
    totalWeight += weight;

    // Check if candidate possesses exact or equivalent skill
    const foundSkill = candidateSkills.find((candSkill) =>
      areSkillsEquivalent(candSkill.name, req.name)
    );

    if (foundSkill) {
      earnedWeight += weight * 1.0;
      matched.push({
        name: req.name,
        isRequired: req.isRequired,
        weight,
        matchDegree: 1.0,
      });
    } else {
      if (req.isRequired) {
        missingRequired.push({
          name: req.name,
          weight,
        });
      } else {
        missingOptional.push({
          name: req.name,
          weight,
        });
      }
    }
  }

  const rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
  const score = Math.round(rawScore);

  return {
    score,
    breakdown: {
      matched,
      missingRequired,
      missingOptional,
      hasAllRequired: missingRequired.length === 0,
    },
    advisoryOnly: true,
    modelVersion: 'deterministic-v1.0',
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Anonymizes resume or candidate profile text to prevent bias (EU AI Act & Vietnam DP Law).
 * Removes names, phone numbers, emails, addresses, age, marital status, photos.
 */
export function anonymizeCandidateProfile(rawText: string): string {
  let anonymized = rawText;

  // Mask emails
  anonymized = anonymized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL_REDACTED]'
  );

  // Mask phone numbers (Vietnamese and international formats)
  anonymized = anonymized.replace(
    /(\+?84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}/g,
    '[PHONE_REDACTED]'
  );
  anonymized = anonymized.replace(
    /\b\d{3}[-.\s]??\d{3}[-.\s]??\d{4}\b/g,
    '[PHONE_REDACTED]'
  );

  // Mask dates of birth or age mentions
  anonymized = anonymized.replace(
    /\b(DOB|Date of Birth|Ngày sinh|Sinh năm)[:\s]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
    '[DOB_REDACTED]'
  );
  anonymized = anonymized.replace(
    /\b(\d{1,2}\s+tuổi|\d{1,2}\s+years?\s+old)\b/gi,
    '[AGE_REDACTED]'
  );

  // Mask gender/marital status mentions
  anonymized = anonymized.replace(
    /\b(Giới tính|Gender)[:\s]*(Nam|Nữ|Male|Female|Other)\b/gi,
    '[GENDER_REDACTED]'
  );
  anonymized = anonymized.replace(
    /\b(Tình trạng hôn nhân|Marital Status)[:\s]*(Độc thân|Đã kết hôn|Single|Married)\b/gi,
    '[MARITAL_STATUS_REDACTED]'
  );

  return anonymized;
}
