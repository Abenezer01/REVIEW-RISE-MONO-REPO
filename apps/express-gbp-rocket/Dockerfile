# ============================================
# Stage 1: Dependencies - Install PNPM and fetch dependencies
# ============================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY packages/@platform/*/package.json ./packages/@platform/
COPY apps/express-gbp-rocket/package.json ./apps/express-gbp-rocket/

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
COPY apps/express-gbp-rocket ./apps/express-gbp-rocket

RUN pnpm install --frozen-lockfile --offline
RUN pnpm --filter "@platform/*" run build || true
RUN pnpm --filter @apps/express-gbp-rocket run build
RUN pnpm --filter @apps/express-gbp-rocket deploy --prod /app/pruned

# ============================================
# Stage 3: Runner - Production image
# ============================================
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

RUN addgroup --system --gid 1001 expressjs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:expressjs /app/pruned ./

USER expressjs

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
