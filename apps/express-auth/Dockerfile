# ============================================
# Stage 1: Dependencies - Install PNPM and fetch dependencies
# ============================================
FROM node:20-alpine AS deps

# Install PNPM globally
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./


# Copy all package.json files to understand the workspace structure
COPY packages/@platform/*/package.json ./packages/@platform/
COPY apps/express-auth/package.json ./apps/express-auth/

# Fetch dependencies using pnpm - this caches better than install
RUN pnpm fetch

# ============================================
# Stage 2: Builder - Build the application
# ============================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json

# Copy all shared packages source code
COPY packages/@platform ./packages/@platform

# Copy the specific app source code
COPY apps/express-auth ./apps/express-auth

# Install all dependencies (uses cached node_modules from stage 1)
RUN pnpm install --frozen-lockfile --offline

# Build shared packages first (if they need building)
RUN pnpm --filter "@platform/*" run build || true

# Build the express-auth application
RUN pnpm --filter @apps/express-auth run build

# Create a production-only deployment using pnpm deploy
# This prunes the workspace to only include express-auth and its dependencies
RUN pnpm --filter @apps/express-auth deploy --prod /app/pruned

# ============================================
# Stage 3: Runner - Production image
# ============================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 expressjs && \
    adduser --system --uid 1001 expressjs

# Copy only the pruned production dependencies and built code
COPY --from=builder --chown=expressjs:expressjs /app/pruned ./

# Switch to non-root user
USER expressjs

# Expose the application port
EXPOSE 3010

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
