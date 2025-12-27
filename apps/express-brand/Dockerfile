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
COPY apps/express-brand/package.json ./apps/express-brand/

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
COPY --from=deps /app/tsconfig.json ./tsconfig.json


# Copy all shared packages source code
COPY packages/@platform ./packages/@platform

# Copy the specific app source code
COPY apps/express-brand ./apps/express-brand

# Install all dependencies (uses cached node_modules from stage 1)
RUN pnpm install --frozen-lockfile --offline

# Build shared packages first (if they need building)
RUN pnpm --filter "@platform/db" run db:generate
# Build auth explicitly to ensure it runs
RUN pnpm --filter "@platform/auth" run build
# Verify auth build succeeded and fix structure if nested
RUN if [ -f packages/@platform/auth/dist/auth/src/index.js ]; then \
  echo "Detected nested build structure. Patching package.json..."; \
  sed -i 's|"./dist/index.js"|"./dist/auth/src/index.js"|g' packages/@platform/auth/package.json && \
  sed -i 's|"./dist/index.d.ts"|"./dist/auth/src/index.d.ts"|g' packages/@platform/auth/package.json; \
  fi

RUN pnpm --filter "@platform/*" run build

# Build the application
RUN pnpm --filter @apps/express-brand run build

# ============================================
# Stage 3: Runner - Production image
# ============================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 expressjs && \
  adduser --system --uid 1001 expressjs

# Copy root node_modules (for shared dependencies and pnpm virtual store)
COPY --from=builder --chown=expressjs:expressjs /app/node_modules ./node_modules

# Copy the specific app (including its node_modules, dist, and config)
COPY --from=builder --chown=expressjs:expressjs /app/apps/express-brand ./apps/express-brand

# Copy shared packages (including their node_modules and dist) to satisfy symlinks
COPY --from=builder --chown=expressjs:expressjs /app/packages ./packages

# Copy workspace config
COPY --from=builder --chown=expressjs:expressjs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:expressjs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Switch to non-root user
USER expressjs

# Expose the application port
EXPOSE 3007

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3007/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Set working directory to the app folder so module resolution works as expected
WORKDIR /app/apps/express-brand

# Start the application using the built file in dist
CMD ["node", "dist/index.js"]
