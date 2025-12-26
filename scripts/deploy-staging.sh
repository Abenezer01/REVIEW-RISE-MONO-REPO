#!/bin/bash

# ==============================================================================
# VPS Deployment Script for Review Rise Monorepo
# ==============================================================================
# This script should be run on the VPS to deploy/update the application
# Usage: ./scripts/deploy-staging.sh
# ==============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# ==============================================================================
# Configuration
# ==============================================================================
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================================================================
# Helper Functions
# ==============================================================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==============================================================================
# Preflight Checks
# ==============================================================================
log_info "Starting deployment preflight checks..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    log_error "$ENV_FILE not found. Please create it from .env.production.example"
    exit 1
fi

log_info "Preflight checks passed ✓"

# ==============================================================================
# Create Backup
# ==============================================================================
log_info "Creating backup of current deployment..."

mkdir -p "$BACKUP_DIR"

# Backup current container state info
docker compose -f "$COMPOSE_FILE" ps > "$BACKUP_DIR/containers_$TIMESTAMP.txt" 2>&1 || true

# Backup environment file
cp "$ENV_FILE" "$BACKUP_DIR/env_$TIMESTAMP.backup"

log_info "Backup created at $BACKUP_DIR with timestamp $TIMESTAMP ✓"

# ==============================================================================
# Pull Latest Images
# ==============================================================================
log_info "Logging into GHCR..."

if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_ACTOR:-}" ]; then
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
    log_info "Authenticated with ghcr.io ✓"
else
    log_warn "GITHUB_TOKEN or GITHUB_ACTOR not set. Skipping docker login (pull may fail for private images)."
fi

log_info "Pulling latest Docker images..."

docker compose -f "$COMPOSE_FILE" pull

log_info "Images pulled successfully ✓"

# ==============================================================================
# Run Database Migrations
# ==============================================================================
log_info "Running database migrations..."

# Run migrations using the db package's migrate:deploy script
# This uses db-admin.ts which properly handles DATABASE_ADMIN_URL
docker compose -f "$COMPOSE_FILE" run --rm \
    next-web \
    sh -c "cd /app && pnpm --filter @platform/db run db:migrate:deploy" || {
    log_error "Database migration failed!"
    log_warn "You can rollback using: ./scripts/rollback-staging.sh $TIMESTAMP"
    exit 1
}

log_info "Database migrations completed ✓"

# ==============================================================================
# Seed Database (Optional - First Time Only)
# ==============================================================================
# Check if --seed flag was passed
if [[ "$*" == *"--seed"* ]]; then
    log_info "Seeding database..."
    
    docker compose -f "$COMPOSE_FILE" run --rm \
        next-web \
        sh -c "cd /app && pnpm --filter @platform/db run db:seed" || {
        log_warn "Database seeding failed (non-fatal)"
    }
    
    log_info "Database seeding completed ✓"
else
    log_info "Skipping database seeding (use --seed flag to seed)"
fi

# ==============================================================================
# Start Services
# ==============================================================================
log_info "Starting services with Docker Compose..."

docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

log_info "Services started ✓"

# ==============================================================================
# Wait for Health Checks
# ==============================================================================
log_info "Waiting for services to become healthy..."

MAX_WAIT=180  # Maximum wait time in seconds
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    # Check if all services are healthy or running
    UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json | jq -r 'select(.Health == "unhealthy") | .Name' 2>/dev/null || echo "")
    
    if [ -z "$UNHEALTHY" ]; then
        log_info "All services are healthy ✓"
        break
    fi
    
    log_warn "Waiting for services to become healthy... (${ELAPSED}s/${MAX_WAIT}s)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    log_error "Timeout waiting for services to become healthy!"
    log_warn "Check service logs with: docker compose -f $COMPOSE_FILE logs"
    log_warn "You can rollback using: ./scripts/rollback-staging.sh $TIMESTAMP"
    exit 1
fi

# ==============================================================================
# Service Health Verification
# ==============================================================================
log_info "Verifying service health endpoints..."

# Wait a bit more for Nginx to be fully ready
sleep 10

# Test Nginx health
if curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "Nginx health check passed ✓"
else
    log_error "Nginx health check failed!"
    exit 1
fi

# ==============================================================================
# Cleanup Old Images
# ==============================================================================
log_info "Cleaning up old Docker images..."

docker image prune -f > /dev/null 2>&1 || true

log_info "Cleanup completed ✓"

# ==============================================================================
# Deployment Summary
# ==============================================================================
echo ""
log_info "==========================================="
log_info "Deployment completed successfully! 🚀"
log_info "==========================================="
log_info "Backup ID: $TIMESTAMP"
log_info "Rollback command: ./scripts/rollback-staging.sh $TIMESTAMP"
log_info ""
log_info "View logs: docker compose -f $COMPOSE_FILE logs -f"
log_info "Check status: docker compose -f $COMPOSE_FILE ps"
echo ""

exit 0
