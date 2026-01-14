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
# Symlink for standard docker-compose behavior
ln -sf "$ENV_FILE" .env
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
    # Ensure lowercase actor for Docker compatibility
    LOWER_ACTOR=$(echo "$GITHUB_ACTOR" | tr '[:upper:]' '[:lower:]')
    
    # Logout first to ensure clean state
    docker logout ghcr.io > /dev/null 2>&1 || true
    
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$LOWER_ACTOR" --password-stdin
    
    if [ $? -eq 0 ]; then
        log_info "Authenticated with ghcr.io as $LOWER_ACTOR ✓"
    else
        log_error "Failed to login to ghcr.io!"
        # Do not exit, try pulling anyway (though likely to fail for private images)
    fi
else
    log_warn "GITHUB_TOKEN or GITHUB_ACTOR not set. Skipping docker login (pull may fail for private images)."
fi

log_info "Pulling latest Docker images..."

docker compose -f "$COMPOSE_FILE" pull

log_info "Images pulled successfully ✓"

# ==============================================================================
# Run Database Migrations
# ==============================================================================
# Migrations now run automatically via express-auth entrypoint script
log_info "Database migrations will run automatically when express-auth starts ✓"


# ==============================================================================
# Seed Database (Optional - First Time Only)
# ==============================================================================
# Check if --seed flag was passed
if [[ "$*" == *"--seed"* ]]; then
    log_info "Seeding database..."
    
    docker compose -f "$COMPOSE_FILE" run --rm \
        express-auth \
        sh -c "cd /app && pnpm --filter @platform/db run db:seed:all" || {
        log_warn "Database seeding failed (non-fatal)"
    }
    
    log_info "Database seeding completed ✓"
else
    log_info "Skipping database seeding (use --seed flag to seed)"
fi

# ==============================================================================
# EMERGENCY FIX: Schema Sync (db push)
# ==============================================================================
# This ensures DB matches code even if migrations are out of sync
log_info "Running schema sync (db push) to ensure database integrity..."
docker compose -f "$COMPOSE_FILE" run --rm \
    express-auth \
    sh -c "cd /app && npx prisma db push --accept-data-loss" || {
    log_warn "Schema sync failed (check logs)"
}
log_info "Schema sync completed ✓"

# ==============================================================================
# SSL Certificate Check & Cleanup
# ==============================================================================
CERT_PATH="./nginx/certbot/conf/live/vyntrise.com/fullchain.pem"
CORRUPTED_PATH="./nginx/certbot/conf/live/vyntrise.com-0001"

log_info "Checking SSL certificate state..."
ls -R ./nginx/certbot/conf || log_warn "Certbot conf dir not found or empty"

# 1. Check for -0001 corruption
if [ -d "$CORRUPTED_PATH" ]; then
    log_warn "Detected corrupted SSL directory ($CORRUPTED_PATH). Cleaning up..."
    rm -rf ./nginx/certbot/conf
    rm -rf ./nginx/certbot/www
fi

# 2. Check strict validity
NEEDS_INIT=0

if [ ! -f "$CERT_PATH" ]; then
    log_warn "Certificate not found at $CERT_PATH"
    NEEDS_INIT=1
else
    # Verify file is not empty
    if [ ! -s "$CERT_PATH" ]; then
        log_warn "Certificate file exists but is empty."
        NEEDS_INIT=1
    else
        # Verify it's a valid certificate
        if ! openssl x509 -checkend 0 -noout -in "$CERT_PATH" > /dev/null 2>&1; then
             log_warn "Certificate exists but appears invalid or expired."
             NEEDS_INIT=1
        fi
    fi
fi

if [ "$NEEDS_INIT" -eq 1 ]; then
    log_info "Running automatic SSL initialization..."
    
    # Aggressive cleanup to ensure clean slate
    rm -rf ./nginx/certbot/conf/live/vyntrise.com
    rm -rf ./nginx/certbot/archive/vyntrise.com
    rm -rf ./nginx/certbot/renewal/vyntrise.com.conf
    
    # Run init-ssl.sh in non-interactive mode
    chmod +x ./scripts/init-ssl.sh
    ./scripts/init-ssl.sh --non-interactive || {
        log_error "SSL initialization failed!"
        exit 1
    }
    log_info "SSL initialization completed ✓"
else
    log_info "Valid SSL certificate found ✓"
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
if curl -f http://127.0.0.1/health > /dev/null 2>&1; then
    log_info "Nginx health check passed (IP) ✓"
elif curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "Nginx health check passed (localhost) ✓"
else
    log_error "Nginx health check failed!"
    echo "--- CURL OUTPUT ---"
    curl -v http://127.0.0.1/health || true
    echo "--- NGINX LOGS ---"
    docker logs reviewrise-nginx --tail 50 || true
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
