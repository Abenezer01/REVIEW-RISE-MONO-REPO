#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Run Prisma migrations using admin credentials
# The DATABASE_ADMIN_URL should be set in the environment
if [ -n "$DATABASE_ADMIN_URL" ]; then
    export DATABASE_URL="$DATABASE_ADMIN_URL"
    echo "Using DATABASE_ADMIN_URL for migrations"
fi

# Run migrations
cd /app/packages/@platform/db
npx prisma migrate deploy

echo "✅ Migrations completed successfully"

# Reset DATABASE_URL to app credentials for runtime
if [ -n "$DATABASE_APP_URL" ]; then
    export DATABASE_URL="$DATABASE_APP_URL"
fi

# Switch back to app directory
cd /app/apps/express-seo-health

# If the only argument is the default "node" from the base image, 
# or if no arguments are provided, start the application.
if [ "$#" -eq 0 ] || [ "$1" = "node" ]; then
    echo "▶️ Starting Express application..."
    exec dumb-init -- node dist/index.js
else
    # Otherwise run the provided command
    echo "▶️ Running custom command: $@"
    exec dumb-init -- "$@"
fi
