# syntax=docker/dockerfile:1.7
# Build from the repository root:  docker build -f apps/web/Dockerfile -t jobportal-web .

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.15.0 --activate
WORKDIR /repo

# ── Dependencies stage ──
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ── Build stage ──
FROM deps AS build
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN mkdir -p apps/web/public
ARG API_URL=http://api:3001
ENV API_URL=$API_URL
RUN pnpm --filter @jobportal/shared build && \
    pnpm --filter @jobportal/web build

# ── Runtime stage ──
FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER node

COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
