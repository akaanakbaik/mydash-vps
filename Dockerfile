FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
COPY packages/agent/package.json packages/agent/
RUN pnpm install --frozen-lockfile

# Build shared package
FROM base AS shared-builder
COPY packages/shared/ packages/shared/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/shared/node_modules /app/packages/shared/node_modules
RUN pnpm --filter @mydash/shared build

# Build frontend
FROM base AS frontend-builder
COPY packages/frontend/ packages/frontend/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/frontend/node_modules /app/packages/frontend/node_modules
COPY --from=shared-builder /app/packages/shared/dist /app/packages/shared/dist
RUN pnpm --filter @mydash/frontend build

# Build backend
FROM base AS backend-builder
COPY packages/backend/ packages/backend/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/backend/node_modules /app/packages/backend/node_modules
COPY --from=shared-builder /app/packages/shared/dist /app/packages/shared/dist
RUN pnpm --filter @mydash/backend build

# Production image
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache tini
WORKDIR /app

ENV NODE_ENV=production

COPY --from=backend-builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=backend-builder /app/packages/backend/package.json ./packages/backend/
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=shared-builder /app/packages/shared/package.json ./packages/shared/
COPY --from=frontend-builder /app/packages/frontend/dist ./packages/frontend/dist
COPY package.json pnpm-workspace.yaml ./

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/backend/dist/index.js"]
