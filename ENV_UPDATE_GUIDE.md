# Environment Configuration Update Guide

After implementing database security hardening, you need to update your `.env` files with the new database configuration.

## Files to Update

### 1. Root `.env` file
**Location**: `REVIEW-MONO-REPO/.env`

Replace the existing `DATABASE_URL` line with:

```env
# =======================================================
# CORE PLATFORM CONFIGURATION (Required for all services)
# =======================================================

# 1. DATABASE (PostgreSQL / TimescaleDB)
# Connection string for the shared relational database (Postgres + Prisma)
# 
# App User (Low-Privilege) - Use this for runtime operations
# This user has SELECT, INSERT, UPDATE, DELETE permissions only
DATABASE_URL="postgresql://reviewrise_app:app_password@localhost:5432/reviewrise_db?sslmode=prefer"

# Admin User (High-Privilege) - Use this for migrations and schema changes
# This user has full database privileges
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:admin_password@localhost:5432/reviewrise_db?sslmode=prefer"

# SSL/TLS Mode (optional)
# Options: disable (local only), prefer (default), require, verify-ca, verify-full (production)
DATABASE_SSL_MODE="prefer"

# 2. CACHING & QUEUES (Redis / BullMQ)
# ... rest of your existing configuration
```

### 2. Database Package `.env` file
**Location**: `packages/@platform/db/.env`

Replace the entire content with:

```env
# Database Configuration
# App user (low-privilege, for runtime operations)
DATABASE_URL="postgresql://reviewrise_app:app_password@localhost:5432/reviewrise_db?sslmode=prefer"

# Admin user (high-privilege, for migrations and schema changes)
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:admin_password@localhost:5432/reviewrise_db?sslmode=prefer"

# SSL/TLS Configuration (optional)
# Options: disable, prefer, require, verify-ca, verify-full
DATABASE_SSL_MODE="prefer"

# SSL Certificate paths (optional, for verify-ca and verify-full modes)
# DATABASE_SSL_CA="/path/to/ca-certificate.crt"
# DATABASE_SSL_CERT="/path/to/client-certificate.crt"
# DATABASE_SSL_KEY="/path/to/client-key.key"
```

### 3. Express Auth Service `.env` (if exists)
**Location**: `apps/express-auth/.env`

Update the `DATABASE_URL` line:

```env
DATABASE_URL="postgresql://reviewrise_app:app_password@localhost:5432/reviewrise_db?sslmode=prefer"
```

## Important Notes

### For Local Development

The passwords in the configuration above match the Docker initialization script:
- **App User**: `reviewrise_app` / `app_password`
- **Admin User**: `reviewrise_admin` / `admin_password`

These users are automatically created when you start the Docker container.

### For Production

**⚠️ CRITICAL**: Change these passwords before deploying to production!

1. Generate strong passwords:
   ```bash
   # Generate random password
   openssl rand -base64 32
   ```

2. Update the passwords in your production environment variables

3. Use `sslmode=verify-ca` or `sslmode=verify-full` in production

4. Configure SSL certificates for production database

## Restart Required

After updating `.env` files, restart your services:

```bash
# Stop all services
# Press Ctrl+C in the terminal running pnpm dev:all

# Restart Docker (to create users)
docker-compose down
docker-compose up -d postgres

# Wait for database to be ready
sleep 5

# Restart services
pnpm dev:all
```

## Verification

After updating and restarting, verify the configuration:

```bash
# Check database health
pnpm --filter @platform/db run db:health

# Or from any service
node -e "require('@platform/db').logDatabaseHealth()"
```

You should see:
- ✅ Connected: true
- ✅ SSL Enabled: true (or false if using sslmode=disable)
- ✅ Status: HEALTHY

## Troubleshooting

### Issue: "password authentication failed"

**Solution**: The database users haven't been created yet.

```bash
# Recreate Docker container to run init script
docker-compose down -v  # WARNING: This deletes data!
docker-compose up -d postgres
```

### Issue: "SSL connection failed"

**Solution**: Change SSL mode to `prefer` or `disable` for local development:

```env
DATABASE_URL="postgresql://reviewrise_app:app_password@localhost:5432/reviewrise_db?sslmode=prefer"
```

### Issue: Services can't connect

**Solution**: Ensure all services use the same `DATABASE_URL`:

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Or check in Node
node -e "console.log(process.env.DATABASE_URL)"
```
