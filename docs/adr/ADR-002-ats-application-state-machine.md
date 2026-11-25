# ADR-002: Shared ATS Application State Machine

## Status
**ACCEPTED**

## Context
Both the NestJS API (`ApplicationsService`) and the Next.js frontend (`ApplicantDetailDrawer`, `KanbanBoard`) need consistent rules for which `ApplicationStatus` transitions are valid and which `Role` is authorized to perform them.

## Decision
Centralize the ATS state machine in `@jobportal/shared` (`packages/shared/src/state-machine.ts`) via `validateApplicationTransition(current, target, role)`:
- Pipeline states: `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`, `WITHDRAWN`.
- `CANDIDATE` can only transition active applications to `WITHDRAWN`.
- `RECRUITER` can advance through `APPLIED -> SCREENING -> INTERVIEW -> OFFER -> HIRED` or `REJECTED`.
- Every transition in `ApplicationsService` executes inside `prisma.$transaction`, updating `Application.status` and appending an `ApplicationStatusHistory` record plus an `AuditLog` entry.

## Consequences
- **Positive:** Single source of truth shared across backend validation and frontend UI controls; complete audit trail of every status change.
- **Negative:** Adding a new pipeline stage requires rebuilding `@jobportal/shared` before `api` and `web` consume it.
