import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

/**
 * Enhanced Prisma Client Configuration
 * 
 * Features:
 * - SSL/TLS support based on environment variables
 * - Connection pooling optimization
 * - Query logging and monitoring
 * - Singleton pattern for connection reuse
 * - Uses @prisma/adapter-pg for serverless/edge compatibility
 */

// Connection string from environment
// Prioritize DATABASE_URL for runtime, but support others if needed
const connectionString = process.env.DATABASE_URL || '';

// SSL configuration helper for pg Pool
function getPoolConfig() {
    const sslMode = process.env.DATABASE_SSL_MODE;
    const config: any = {
        connectionString,
    };

    // If no SSL mode specified or disable, return basic config
    if (!sslMode || sslMode === 'disable') {
        return config;
    }

    // SSL Settings
    config.ssl = {};

    // Auto-disable SSL for localhost unless strictly required
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    if (isLocal && sslMode !== 'require' && sslMode !== 'verify-ca' && sslMode !== 'verify-full') {
        try {
            const url = new URL(connectionString);
            url.searchParams.delete('sslmode');
            return {
                connectionString: url.toString(),
            };
        } catch (e) {
            // Fallback if URL parsing fails
            return { connectionString };
        }
    }

    // For prefer/require modes, enable SSL
    if (sslMode === 'prefer' || sslMode === 'require') {
        config.ssl.rejectUnauthorized = sslMode === 'require';
    }

    // For verify-ca/verify-full modes
    if (sslMode === 'verify-ca' || sslMode === 'verify-full') {
        config.ssl.rejectUnauthorized = true;
        if (process.env.DATABASE_SSL_CA) config.ssl.ca = process.env.DATABASE_SSL_CA;
        if (process.env.DATABASE_SSL_CERT) config.ssl.cert = process.env.DATABASE_SSL_CERT;
        if (process.env.DATABASE_SSL_KEY) config.ssl.key = process.env.DATABASE_SSL_KEY;
    }

    return config;
}

// Global singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient;
};

// Initialize Pool and Adapter
const pool = new Pool(getPoolConfig());
const adapter = new PrismaPg(pool);

// Logging configuration
function getLogConfig(): Array<'query' | 'error' | 'warn' | 'info'> {
    const env = process.env.NODE_ENV;
    if (env === 'development') return ['query', 'error', 'warn'];
    if (env === 'test') return ['error'];
    return ['error'];
}

/**
 * Main Prisma Client instance
 */
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: getLogConfig(),
        errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    });

// Admin client - in this adapter setup, we usually reuse the same adapter or create a new one if different connection string needed.
// However, since `adapter` takes a Pool which has a connection string, `prismaAdmin` with a DIFFERENT connection string (DATABASE_ADMIN_URL)
// would need a SEPARATE Pool and Adapter.

// Admin Pool and Adapter
const adminConnectionString = process.env.DATABASE_ADMIN_URL || connectionString;
// Only create if different or if we strictly want separation
const adminPool = new Pool({ ...getPoolConfig(), connectionString: adminConnectionString });
const adminAdapter = new PrismaPg(adminPool);

export const prismaAdmin = new PrismaClient({
    adapter: adminAdapter,
    log: getLogConfig(),
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
});

// Cache instances in development
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 */
export async function disconnectDatabase() {
    await prisma.$disconnect();
    // Also end the pools
    await pool.end();
    if (adminConnectionString !== connectionString) {
        await adminPool.end();
    }
}

// Handle process termination
if (process.env.NODE_ENV !== 'test') {
    process.on('beforeExit', () => disconnectDatabase().catch(console.error));
    process.on('SIGINT', () => {
        disconnectDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
    });
    process.on('SIGTERM', () => {
        disconnectDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
    });
}
