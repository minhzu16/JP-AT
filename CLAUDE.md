# PJ5 — CareerVanguard (Job Portal Monorepo)

Monorepo (`pnpm` + Turborepo): NestJS API (`apps/api`), Next.js 15 web (`apps/web`), Prisma DB package (`packages/db`), shared contracts (`packages/shared`).

## Common Commands
- Install: `pnpm install --frozen-lockfile`
- Build all: `pnpm build`
- Lint all: `pnpm lint`
- API typecheck: `pnpm --filter @jobportal/api typecheck`
- API tests: `pnpm --filter @jobportal/api test`
- Web lint & build: `pnpm --filter @jobportal/web lint && pnpm --filter @jobportal/web build`
- Web E2E (Playwright): `pnpm --filter @jobportal/web test:e2e`
