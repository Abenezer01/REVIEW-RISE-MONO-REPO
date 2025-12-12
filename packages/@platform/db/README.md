# @platform/db

Centralized database access layer for the ReviewRise platform with enhanced security, type-safe repository pattern, and comprehensive monitoring.

## Features

- ✅ **Database User Privilege Separation** - Admin vs app user with minimal privileges
- ✅ **SSL/TLS Support** - Secure database connections with configurable SSL modes
- ✅ **Repository Pattern** - Type-safe data access layer for all models
- ✅ **Health Checks** - Database connectivity and performance monitoring
- ✅ **Connection Management** - Singleton pattern with graceful shutdown
- ✅ **Soft Deletes** - Built-in support for soft delete operations

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Database User Setup](#database-user-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Repository Pattern Usage](#repository-pattern-usage)
- [Health Checks](#health-checks)
- [API Reference](#api-reference)
- [Security Best Practices](#security-best-practices)

## Installation

This package is part of the ReviewRise monorepo and is automatically available to all apps and packages.

```bash
# Install dependencies (from monorepo root)
pnpm install

# Generate Prisma Client
pnpm --filter @platform/db run db:generate
```

## Quick Start

### Basic Usage

```typescript
import { prisma, userRepository } from '@platform/db';

// Using repositories (recommended)
const user = await userRepository.findByEmail('user@example.com');
const businesses = await businessRepository.findByUserId(user.id);

// Using Prisma client directly (when needed)
const result = await prisma.user.findMany();
```

### Environment Configuration

Create a `.env` file in your app:

```env
# App user (low-privilege, for runtime operations)
DATABASE_URL="postgresql://reviewrise_app:password@localhost:5432/reviewrise_db?sslmode=prefer"

# Admin user (high-privilege, for migrations only)
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:admin_password@localhost:5432/reviewrise_db?sslmode=prefer"

# SSL mode (optional)
DATABASE_SSL_MODE="prefer"
```

## Database User Setup

### Local Development (Docker)

For local development, database users are created automatically when you start the Docker container:

```bash
# Start PostgreSQL with automatic user setup
docker-compose up -d postgres
```

The initialization script creates:
- **reviewrise_admin**: Full privileges for migrations
- **reviewrise_app**: Limited privileges (SELECT, INSERT, UPDATE, DELETE)

### Production Setup

For production environments, run the user setup script manually:

```bash
# Connect to your PostgreSQL instance
psql -U postgres -d reviewrise_db -f packages/@platform/db/scripts/setup-db-users.sql
```

**Important**: Change the default passwords in the script before running in production!

## SSL/TLS Configuration

### SSL Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `disable` | No SSL | Local development only |
| `prefer` | Use SSL if available | Default for local dev |
| `require` | Require SSL | Basic production |
| `verify-ca` | Verify server certificate | Recommended production |
| `verify-full` | Verify certificate and hostname | Maximum security |

### Local Development

```env
DATABASE_URL="postgresql://reviewrise_app:password@localhost:5432/reviewrise_db?sslmode=prefer"
```

### Production

```env
DATABASE_URL="postgresql://reviewrise_app:SECURE_PASSWORD@db.example.com:5432/reviewrise_db?sslmode=verify-ca"
DATABASE_SSL_CA="/path/to/ca-certificate.crt"
```

See [scripts/setup-ssl.md](./scripts/setup-ssl.md) for detailed SSL configuration guide.

## Repository Pattern Usage

### Available Repositories

- **userRepository** - User management
- **businessRepository** - Business operations
- **locationRepository** - Location management
- **roleRepository** - Role and permission management
- **permissionRepository** - Permission operations
- **subscriptionRepository** - Subscription lifecycle

### Examples

#### User Operations

```typescript
import { userRepository } from '@platform/db';

// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// Find user with roles
const userWithRoles = await userRepository.findWithRoles(userId);

// Create user with role
const newUser = await userRepository.createWithRole(
  { email: 'new@example.com', name: 'New User' },
  { businessId: 'business-id', roleId: 'role-id' }
);

// Search users
const users = await userRepository.search('john', { take: 10 });

// Soft delete
await userRepository.softDelete(userId);
```

#### Business Operations

```typescript
import { businessRepository } from '@platform/db';

// Find business by slug
const business = await businessRepository.findBySlug('acme-corp');

// Find business with team
const businessWithTeam = await businessRepository.findWithTeam(businessId);

// Create business with owner
const newBusiness = await businessRepository.createWithOwner(
  { name: 'ACME Corp', slug: 'acme-corp' },
  ownerId,
  ownerRoleId
);

// Generate unique slug
const slug = await businessRepository.generateUniqueSlug('ACME Corporation');

// Add team member
await businessRepository.addTeamMember(businessId, userId, roleId);
```

#### Subscription Operations

```typescript
import { subscriptionRepository } from '@platform/db';

// Find active subscription
const subscription = await subscriptionRepository.findActiveByBusinessId(businessId);

// Find expiring subscriptions
const expiring = await subscriptionRepository.findExpiringSoon(7); // 7 days

// Renew subscription
await subscriptionRepository.renew(subscriptionId, 30); // 30 days

// Cancel subscription
await subscriptionRepository.cancel(subscriptionId);
```

### Transaction Support

All repositories support transactions:

```typescript
import { userRepository, businessRepository } from '@platform/db';

await userRepository.transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const business = await tx.business.create({ data: businessData });
  await tx.userBusinessRole.create({
    data: { userId: user.id, businessId: business.id, roleId }
  });
});
```

## Health Checks

### Check Database Health

```typescript
import { checkDatabaseHealth, logDatabaseHealth } from '@platform/db';

// Get health status
const health = await checkDatabaseHealth();
console.log(health);
// {
//   status: 'healthy',
//   timestamp: Date,
//   responseTime: 45,
//   details: {
//     connected: true,
//     version: 'PostgreSQL 15.3',
//     ssl: true
//   }
// }

// Log health information
await logDatabaseHealth();
```

### Health Check Endpoint

```typescript
import express from 'express';
import { checkDatabaseHealth } from '@platform/db';

const app = express();

app.get('/health', async (req, res) => {
  const health = await checkDatabaseHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

## API Reference

### Repositories

All repositories extend `BaseRepository` with common methods:

#### Base Methods

- `findById(id)` - Find record by ID
- `findMany(options)` - Find multiple records with filtering
- `findFirst(options)` - Find first matching record
- `create(data)` - Create new record
- `update(id, data)` - Update record
- `delete(id)` - Hard delete record
- `softDelete(id)` - Soft delete record (sets deletedAt)
- `restore(id)` - Restore soft-deleted record
- `count(where)` - Count records
- `exists(where)` - Check if record exists
- `findManyActive(options)` - Find non-deleted records
- `transaction(callback)` - Execute in transaction
- `upsert(where, create, update)` - Create or update
- `createMany(data[])` - Batch create
- `updateMany(where, data)` - Batch update
- `deleteMany(where)` - Batch delete

### Health Utilities

- `checkDatabaseHealth()` - Comprehensive health check
- `isDatabaseConnected()` - Simple connectivity check
- `getConnectionPoolStats()` - Connection pool statistics
- `getDatabaseSize()` - Database size information
- `logDatabaseHealth()` - Log health information
- `waitForDatabase(maxAttempts, delayMs)` - Wait for database availability

## Security Best Practices

### 1. Use Low-Privilege User for Runtime

Always use the `reviewrise_app` user (via `DATABASE_URL`) for application runtime:

```env
DATABASE_URL="postgresql://reviewrise_app:password@localhost:5432/reviewrise_db"
```

### 2. Use Admin User Only for Migrations

Use `reviewrise_admin` (via `DATABASE_ADMIN_URL`) only for schema changes:

```bash
# Run migrations with admin user
DATABASE_URL=$DATABASE_ADMIN_URL pnpm --filter @platform/db run db:migrate:deploy
```

### 3. Enable SSL in Production

Always use `sslmode=require` or higher in production:

```env
DATABASE_URL="postgresql://reviewrise_app:password@db.example.com:5432/reviewrise_db?sslmode=verify-ca"
```

### 4. Use Repositories Instead of Raw Queries

Repositories provide type safety and prevent SQL injection:

```typescript
// ✅ Good - Type-safe and secure
const user = await userRepository.findByEmail(email);

// ❌ Avoid - Prone to SQL injection
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

### 5. Implement Row-Level Security (Future)

Consider implementing PostgreSQL Row-Level Security (RLS) for multi-tenant isolation.

## Scripts

```bash
# Generate Prisma Client
pnpm --filter @platform/db run db:generate

# Run migrations (development)
pnpm --filter @platform/db run db:migrate

# Deploy migrations (production)
pnpm --filter @platform/db run db:migrate:deploy

# Push schema changes (development)
pnpm --filter @platform/db run db:push

# Open Prisma Studio
pnpm --filter @platform/db run db:studio

# Check database health
pnpm --filter @platform/db run db:health
```

## Troubleshooting

### Connection Issues

1. **Verify database is running**
   ```bash
   docker-compose ps postgres
   ```

2. **Check connection string**
   ```bash
   echo $DATABASE_URL
   ```

3. **Test connectivity**
   ```typescript
   import { isDatabaseConnected } from '@platform/db';
   const connected = await isDatabaseConnected();
   ```

### Permission Errors

If you get permission errors with the app user:

1. Verify user was created: `\du` in psql
2. Check privileges: `\dp` in psql
3. Re-run setup script if needed

### SSL Errors

If SSL connection fails:

1. Check SSL mode in connection string
2. Verify certificates are accessible
3. Try `sslmode=prefer` for debugging

## Contributing

When adding new models:

1. Update `schema.prisma`
2. Create repository in `src/repositories/`
3. Export from `src/repositories/index.ts`
4. Add tests
5. Update this README

## License

Internal package for ReviewRise platform.
