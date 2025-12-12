# PostgreSQL SSL/TLS Setup Guide

This guide explains how to configure SSL/TLS for secure PostgreSQL connections in the ReviewRise platform.

## Local Development (Docker)

For local development with Docker Compose, SSL is **optional** and uses `sslmode=prefer`:

```bash
# .env file for local development
DATABASE_URL="postgresql://reviewrise_app:password@localhost:5432/reviewrise_db?sslmode=prefer"
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:admin_password@localhost:5432/reviewrise_db?sslmode=prefer"
```

The `sslmode=prefer` setting will use SSL if available, but won't fail if SSL is not configured.

## Production Setup

### 1. Generate SSL Certificates

For production, you should use proper SSL certificates. Here are common approaches:

#### Option A: Using Managed Database Services (Recommended)

Most cloud providers (AWS RDS, Google Cloud SQL, Azure Database) provide SSL certificates automatically:

- **AWS RDS**: Download the certificate bundle from AWS
- **Google Cloud SQL**: Use the Cloud SQL Proxy or download server certificates
- **Azure Database**: Download SSL certificates from Azure Portal

#### Option B: Self-Signed Certificates (Development/Testing Only)

```bash
# Generate server certificate
openssl req -new -x509 -days 365 -nodes -text \
  -out server.crt \
  -keyout server.key \
  -subj "/CN=reviewrise-db"

# Set proper permissions
chmod 600 server.key
chmod 644 server.crt
```

### 2. Configure PostgreSQL Server

Edit `postgresql.conf`:

```conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
ssl_ca_file = '/path/to/root.crt'  # Optional: for client certificate verification
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 3. Configure Application Connection

Update your production `.env` file:

```bash
# Production environment variables
DATABASE_URL="postgresql://reviewrise_app:SECURE_PASSWORD@db.example.com:5432/reviewrise_db?sslmode=require"
DATABASE_ADMIN_URL="postgresql://reviewrise_admin:ADMIN_PASSWORD@db.example.com:5432/reviewrise_db?sslmode=require"

# Optional: Path to SSL certificates for client verification
DATABASE_SSL_CA="/path/to/ca-certificate.crt"
```

## SSL Modes

PostgreSQL supports different SSL modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `disable` | No SSL | Local development only |
| `prefer` | Use SSL if available, otherwise plain | Local development |
| `require` | Require SSL, but don't verify certificates | Basic production |
| `verify-ca` | Require SSL and verify server certificate | Recommended production |
| `verify-full` | Require SSL, verify certificate and hostname | Maximum security |

### Recommended Settings

- **Local Development**: `sslmode=prefer`
- **Staging**: `sslmode=require`
- **Production**: `sslmode=verify-ca` or `sslmode=verify-full`

## Verification

### Check SSL Connection

Connect to PostgreSQL and verify SSL is being used:

```sql
-- Check if SSL is enabled
SELECT ssl_is_used();

-- View SSL connection details
SELECT * FROM pg_stat_ssl WHERE pid = pg_backend_pid();
```

### Test Connection from Application

```typescript
import { prisma } from '@platform/db';

async function testConnection() {
  const result = await prisma.$queryRaw`SELECT ssl_is_used() as ssl_enabled`;
  console.log('SSL Enabled:', result);
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify PostgreSQL is configured to accept SSL connections
   - Check firewall rules allow port 5432

2. **Certificate Verification Failed**
   - Ensure certificate paths are correct
   - Verify certificate is not expired
   - Check certificate hostname matches connection string

3. **Permission Denied**
   - Verify SSL certificate file permissions (600 for key, 644 for cert)
   - Ensure PostgreSQL user can read certificate files

### Debug Connection

Enable connection logging in Prisma:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Security Best Practices

1. ✅ Always use `sslmode=require` or higher in production
2. ✅ Store SSL certificates securely (use secrets management)
3. ✅ Rotate certificates before expiration
4. ✅ Use strong passwords for database users
5. ✅ Restrict database access by IP address when possible
6. ✅ Monitor SSL certificate expiration dates
7. ✅ Use managed database services for automatic SSL management

## References

- [PostgreSQL SSL Documentation](https://www.postgresql.org/docs/current/ssl-tcp.html)
- [Prisma Connection Management](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
