# ============================================
# Stage 1: Dependencies - Install PNPM and fetch dependencies
# ============================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY packages/@platform/*/package.json ./packages/@platform/
COPY apps/next-seo-landing/package.json ./apps/next-seo-landing/

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
COPY apps/next-seo-landing ./apps/next-seo-landing

ENV NEXT_OUTPUT=standalone

RUN pnpm install --frozen-lockfile --offline
RUN pnpm --filter "@platform/*" run build || true
RUN pnpm --filter @apps/next-seo-landing run build

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

# Copy public assets to the correct location for standalone
COPY --from=builder /app/apps/next-seo-landing/public ./apps/next-seo-landing/public

COPY --from=builder --chown=nextjs:nodejs /app/apps/next-seo-landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/next-seo-landing/.next/static ./apps/next-seo-landing/.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/api/health', (r) => { if (r.statusCode !== 200) { console.error('Health Check Failed: Status ' + r.statusCode); process.exit(1); } process.exit(0); }).on('error', (e) => { console.error('Health Check Error:', e); process.exit(1); })"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "apps/next-seo-landing/server.js"]
