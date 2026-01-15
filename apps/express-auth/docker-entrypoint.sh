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
cd /app/apps/express-auth

# If arguments are provided (e.g. running a script), execute them
if [ $# -gt 0 ]; then
    exec dumb-init -- "$@"
else
    # Otherwise start the main application
    exec dumb-init -- node dist/apps/express-auth/src/index.js
fi
