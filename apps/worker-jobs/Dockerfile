# ============================================
# Stage 1: Dependencies - Install PNPM and fetch dependencies
# ============================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY packages/@platform/*/package.json ./packages/@platform/
COPY apps/worker-jobs/package.json ./apps/worker-jobs/

RUN pnpm fetch

# ============================================
# Stage 2: Builder - Build the application
# ============================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json

COPY packages/@platform ./packages/@platform
COPY apps/worker-jobs ./apps/worker-jobs

RUN pnpm install --frozen-lockfile --offline
RUN pnpm --filter "@platform/*" run build || true
RUN pnpm --filter @apps/worker-jobs run build
RUN pnpm --filter @apps/worker-jobs deploy --prod /app/pruned

# ============================================
# Stage 3: Runner - Production image
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

RUN addgroup --system --gid 1001 worker && \
    adduser --system --uid 1001 worker

COPY --from=builder --chown=worker:worker /app/pruned ./

USER worker

# Worker doesn't expose HTTP port, but we can add a health check file
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD test -f /tmp/worker-healthy || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
