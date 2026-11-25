# syntax=docker/dockerfile:1.7
# Build from the repository root:  docker build -f apps/api/Dockerfile -t jobportal-api .

FROM node:22-alpine AS base
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@11.15.0 --activate
WORKDIR /repo

# ── 1. deps stage ──
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/db/prisma packages/db/prisma
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ── 2. build stage ──
FROM deps AS build
COPY packages/shared packages/shared
COPY packages/db packages/db
COPY apps/api apps/api
RUN pnpm --filter @jobportal/db exec prisma generate && \
    pnpm --filter @jobportal/shared build && \
    pnpm --filter @jobportal/db build && \
    pnpm --filter @jobportal/api build

# ── Production dependencies stage ──
FROM base AS prod-deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/db/prisma packages/db/prisma
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod
COPY --from=build /repo/node_modules/.pnpm /repo/node_modules/.pnpm

# ── 3. runtime stage ──
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=prod-deps --chown=node:node /repo /repo
COPY --from=build --chown=node:node /repo/packages/shared/dist /repo/packages/shared/dist
COPY --from=build --chown=node:node /repo/packages/db/dist /repo/packages/db/dist
COPY --from=build --chown=node:node /repo/apps/api/dist /repo/apps/api/dist

WORKDIR /repo/apps/api
USER node

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

CMD ["node", "dist/main.js"]
