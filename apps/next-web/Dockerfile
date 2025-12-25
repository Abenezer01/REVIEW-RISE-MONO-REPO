# ============================================
# Stage 1: Dependencies - Install PNPM and fetch dependencies
# ============================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Install libc6-compat for Next.js compatibility
RUN apk add --no-cache libc6-compat

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY packages/@platform/*/package.json ./packages/@platform/
COPY apps/next-web/package.json ./apps/next-web/

RUN pnpm fetch

# ============================================
# Stage 2: Builder - Build the application
# ============================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/tsconfig.json ./tsconfig.json


COPY packages/@platform ./packages/@platform
COPY apps/next-web ./apps/next-web

RUN pnpm install --frozen-lockfile --offline

# Build shared packages first
RUN pnpm --filter "@platform/*" run build || true

# Build Next.js app (standalone output will be generated)
RUN pnpm --filter @apps/next-web run build

# ============================================
# Stage 3: Runner - Production image
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/next-web/public ./public

# Copy standalone output (this includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/apps/next-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/next-web/.next/static ./apps/next-web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "apps/next-web/server.js"]
