FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
COPY packages/agent/package.json packages/agent/
RUN bun install

# Root config files needed by all packages (tsconfig.base.json, etc.)
FROM base AS configs
COPY tsconfig.base.json ./

# Build shared package
FROM base AS shared-builder
COPY packages/shared/ packages/shared/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/shared/node_modules /app/packages/shared/node_modules
COPY --from=configs /app/tsconfig.base.json ./
RUN bun run --cwd packages/shared build

# Build frontend
FROM base AS frontend-builder
COPY packages/frontend/ packages/frontend/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/frontend/node_modules /app/packages/frontend/node_modules
COPY --from=shared-builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=configs /app/tsconfig.base.json ./
# Skip tsc -b in Docker (project references need full source tree), just run vite build
RUN cd packages/frontend && bunx vite build

# Build backend
FROM base AS backend-builder
COPY packages/backend/ packages/backend/
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/backend/node_modules /app/packages/backend/node_modules
COPY --from=shared-builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=configs /app/tsconfig.base.json ./
RUN bun run --cwd packages/backend build

# Production image
FROM oven/bun:1.3.14-alpine AS runner
RUN apk add --no-cache tini curl
WORKDIR /app

ENV NODE_ENV=production

COPY --from=backend-builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=backend-builder /app/packages/backend/package.json ./packages/backend/
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=shared-builder /app/packages/shared/package.json ./packages/shared/
COPY --from=frontend-builder /app/packages/frontend/dist ./packages/frontend/dist
COPY package.json ./

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf http://localhost:4000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun", "run", "packages/backend/dist/index.js"]
