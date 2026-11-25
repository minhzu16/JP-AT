# ADR-001: Deterministic Skill Matching Engine

## Status
**ACCEPTED**

## Context
Automated candidate screening can introduce opaque bias and fail regulatory transparency requirements (EU AI Act, Vietnam Personal Data Protection Law 91/2025/QH15). Recruiters and candidates also need reproducible, explainable scores when inspecting why an application ranked at a given percentage.

## Decision
Implement `calculateSkillMatch` as a pure, deterministic function in `@jobportal/shared` (`packages/shared/src/matching.ts`), tagged with `modelVersion: 'deterministic-v1.0'`.
- Scores are computed from explicit `JobSkill` weights (`isRequired`, `weight`) and `CandidateSkill` proficiency (`level`, `years`).
- `ApplicationsService.apply()` computes and persists `MatchScore` (`score`, `breakdown`) inside the same Prisma `$transaction` as the `Application` creation.
- The breakdown explicitly lists `matched`, `missingRequired`, `missingOptional`, and `hasAllRequired`.

## Consequences
- **Positive:** 100% reproducible scores, zero external LLM latency/cost during application submission, and full auditability for both candidates and recruiters.
- **Negative:** Does not perform semantic synonym matching beyond normalized skill taxonomy; mitigated by a curated `Skill` catalog.
