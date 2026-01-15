#!/bin/bash

# ==============================================================================
# VPS Rollback Script for Review Rise Monorepo
# ==============================================================================
# This script rolls back to a previous deployment state
# Usage: ./scripts/rollback-staging.sh <BACKUP_TIMESTAMP>
# Example: ./scripts/rollback-staging.sh 20251225_153045
# ==============================================================================

set -e
set -u

# ==============================================================================
# Configuration
# ==============================================================================
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
# Validate Arguments
# ==============================================================================
if [ $# -eq 0 ]; then
    log_error "Usage: $0 <BACKUP_TIMESTAMP>"
    log_info "Available backups:"
    ls -1 "$BACKUP_DIR"/env_*.backup 2>/dev/null | sed 's/.*env_\(.*\)\.backup/  \1/' || echo "  No backups found"
    exit 1
fi

BACKUP_TIMESTAMP=$1
ENV_BACKUP="$BACKUP_DIR/env_${BACKUP_TIMESTAMP}.backup"
CONTAINER_BACKUP="$BACKUP_DIR/containers_${BACKUP_TIMESTAMP}.txt"

# Check if backup exists
if [ ! -f "$ENV_BACKUP" ]; then
    log_error "Backup not found: $ENV_BACKUP"
    exit 1
fi

# ==============================================================================
# Confirmation
# ==============================================================================
log_warn "This will rollback to backup from: $BACKUP_TIMESTAMP"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "Rollback cancelled."
    exit 0
fi

# ==============================================================================
# Rollback Process
# ==============================================================================
log_info "Starting rollback process..."

# Stop current services
log_info "Stopping current services..."
docker compose -f "$COMPOSE_FILE" down

# Restore environment file
log_info "Restoring environment file..."
cp "$ENV_BACKUP" ".env.production"

# Restart services
log_info "Restarting services with previous configuration..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for services
log_info "Waiting for services to start..."
sleep 15

# Check health
if curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "Rollback completed successfully ✓"
    log_info "Services are running and healthy"
else
    log_warn "Services started but health check failed"
    log_warn "Check logs: docker compose -f $COMPOSE_FILE logs"
fi

exit 0
