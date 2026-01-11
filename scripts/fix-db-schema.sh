#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting Database Schema Fix...${NC}"

# 1. Create a temporary override file to mount the local schema
# This ensures we use the schema file currently on the VPS disk, 
# ignoring whatever stale schema might be inside the Docker image.
cat > docker-compose.fix.yml <<EOF
services:
  express-auth:
    volumes:
      - ./packages/@platform/db/prisma/schema.prisma:/app/packages/@platform/db/prisma/schema.prisma
EOF

echo -e "${GREEN}Created temporary docker-compose.fix.yml${NC}"

# 2. Run prisma db push using the override
echo -e "${GREEN}Running prisma db push with local schema...${NC}"
# Use --accept-data-loss to force the schema to match
docker compose -f docker-compose.prod.yml -f docker-compose.fix.yml run --rm \
    express-auth \
    sh -c "cd /app && npx prisma db push --accept-data-loss"

# 3. Cleanup
echo -e "${GREEN}Cleaning up...${NC}"
rm docker-compose.fix.yml

echo -e "${GREEN}Database fix completed. Restarting express-auth...${NC}"

# 4. Restart the service to pick up any changes
docker compose -f docker-compose.prod.yml restart express-auth

echo -e "${GREEN}Done! Please try logging in now.${NC}"
