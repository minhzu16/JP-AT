# ADR-003: Multi-Tenant Recruiter Isolation & RFC 7807 Errors

## Status
**ACCEPTED**

## Context
Multiple companies share the same PostgreSQL database (`Company`, `Job`, `Application`). If a recruiter from Company A guesses or enumerates an `applicationId` belonging to Company B, returning `403 Forbidden` leaks the existence of that ID across tenants. In addition, frontend clients need a uniform error contract.

## Decision
1. **Tenant Scoping with 404 Non-Disclosure:** All recruiter queries in `ApplicationsService` resolve the recruiter's `companyId` via `CompanyMember` and filter `job: { companyId }`. When an application is not found within that company scope, the service throws `404 NotFoundException` instead of `403 Forbidden`.
2. **RFC 7807 Problem Details:** A global `HttpExceptionFilter` in `apps/api/src/common/http-exception.filter.ts` formats all HTTP errors consistently with `status`, `code`, and `detail` fields consumed by `apps/web/src/lib/api.ts`.

## Consequences
- **Positive:** Prevents cross-tenant ID enumeration and gives the frontend a predictable error structure for inline banners and alerts.
- **Negative:** Recruiters must be linked to a `CompanyMember` record; unassociated recruiter accounts receive `403 Forbidden`.
