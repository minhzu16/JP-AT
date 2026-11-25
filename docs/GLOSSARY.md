# CareerVanguard Domain Glossary

Canonical terminology for the **CareerVanguard Job Portal & ATS (`pj5`)**, grounded in `@jobportal/shared`, `@jobportal/db`, `apps/api`, and `apps/web`.

## 1. Identity, Roles & Multi-Tenancy

| Term | Definition |
| :--- | :--- |
| **`Role`** | Platform-level user role: `CANDIDATE`, `RECRUITER`, or `ADMIN`. |
| **`CompanyMember` & `MemberRole`** | Scopes a `RECRUITER` user to a specific `Company` (`ADMIN` or `RECRUITER` within that tenant). All recruiter queries filter by `companyId`. |
| **`CandidateProfile`** | Candidate-owned profile storing `fullName`, `headline`, `summary`, `location`, `yearsExperience`, and `CandidateSkill` proficiency (`level`, `years`). |
| **`Consent`** | Persisted user consent record supporting personal data protection compliance (Nghị định 13/2023/NĐ-CP & Luật BVDLCN 91/2025/QH15). |

## 2. Jobs & Skill Matching

| Term | Definition |
| :--- | :--- |
| **`Job` & `JobStatus`** | Recruitment posting owned by a `Company`. Lifecycle: `DRAFT`, `PUBLISHED`, `CLOSED`, `EXPIRED`. |
| **`JobSkill`** | Weighted requirement linking a `Job` to a `Skill` with `isRequired` (boolean) and `weight` (1–5). |
| **`WorkMode` / `JobLevel` / `EmploymentType`** | Job attributes: `ONSITE \| HYBRID \| REMOTE`, `INTERN \| FRESHER \| JUNIOR \| MID \| SENIOR \| LEAD`, `FULL_TIME \| PART_TIME \| CONTRACT \| INTERNSHIP`. |
| **Deterministic Skill Matching (`calculateSkillMatch`)** | Pure, explainable scoring engine in `@jobportal/shared` (`modelVersion: 'deterministic-v1.0'`) computing `MatchScore` (0–100) and `breakdown` (`matched`, `missingRequired`, `missingOptional`, `hasAllRequired`) without opaque LLM bias. |

## 3. Applicant Tracking System (ATS)

| Term | Definition |
| :--- | :--- |
| **`Application`** | Candidate submission to a `Job`, enforced unique per `(jobId, candidateId)` (`ALREADY_APPLIED` on duplicate). |
| **`ApplicationStatus`** | ATS pipeline state: `APPLIED` → `SCREENING` → `INTERVIEW` → `OFFER` → `HIRED`, plus `REJECTED` and `WITHDRAWN`. |
| **`validateApplicationTransition`** | Shared state-machine guard enforcing legal status transitions and role permissions (`CANDIDATE` may only `WITHDRAW`; `RECRUITER` advances or rejects). |
| **`ApplicationStatusHistory`** | Immutable audit trail recording `fromStatus`, `toStatus`, `changedById`, `reason`, and `changedAt` on every transition. |
| **`ApplicationNote`** | Internal recruiter/hiring-panel note attached to an `Application`, hidden from candidates. |
| **`Interview`** | Scheduled interview round (`round`, `scheduledAt`, `durationMin`, `mode`: `ONLINE \| ONSITE`, `locationOrLink`, `status`). |
| **`Document` & `ScanStatus`** | Uploaded file (e.g., `RESUME` PDF) with `sha256`, `storageKey`, `isDefault`, and virus-scan state (`PENDING \| CLEAN \| INFECTED`). |

## 4. Observability & Error Handling

| Term | Definition |
| :--- | :--- |
| **RFC 7807 Problem Details (`HttpExceptionFilter`)** | Standardized API error payload (`type`, `title`, `status`, `detail`, `code`) across NestJS controllers. |
| **`AuditLog`** | Security and compliance log capturing `actorId`, `action`, `entity`, `entityId`, and `metadata` (e.g., `APPLICATION_SUBMITTED`, `APPLICATION_STATUS_TRANSITION`, `RESUME_DOWNLOADED`). |
| **Prometheus Metrics (`MetricsModule`)** | `/metrics` endpoint exposed via `prom-client` alongside `/health` and `/ready` probes. |
