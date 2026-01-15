#!/bin/bash
set -e

# ==============================================================================
# Local Build Deployment for Express Auth
# ==============================================================================
# This script forces express-auth to build from local source code on the VPS
# instead of pulling a potentially stale image from GHCR.
# Use this when you have made schema changes locally that aren't in the registry yet.
# ==============================================================================

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

OVERRIDE_FILE="docker-compose.local-build.yml"

echo -e "${GREEN}Creating build override configuration...${NC}"
cat > $OVERRIDE_FILE <<EOF
services:
  express-auth:
    build:
      context: .
      dockerfile: apps/express-auth/Dockerfile
    image: reviewrise-express-auth:local
EOF

echo -e "${GREEN}Building and deploying express-auth from local source...${NC}"
# --build forces a rebuild of the image
docker compose -f docker-compose.prod.yml -f $OVERRIDE_FILE up -d --build express-auth

echo -e "${GREEN}Cleaning up...${NC}"
rm $OVERRIDE_FILE

echo -e "${GREEN}Deployment complete! Checking logs...${NC}"
sleep 2
docker compose -f docker-compose.prod.yml logs --tail=50 express-auth
