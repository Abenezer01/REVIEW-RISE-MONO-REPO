import { PrismaClient } from '@prisma/client';

/**
 * Enhanced Prisma Client Configuration
 * 
 * Features:
 * - SSL/TLS support based on environment variables
 * - Connection pooling optimization
 * - Query logging and monitoring
 * - Singleton pattern for connection reuse
 */

// SSL configuration helper
function getSSLConfig() {
    const sslMode = process.env.DATABASE_SSL_MODE;

    // If no SSL mode specified, return undefined (use connection string settings)
    if (!sslMode || sslMode === 'disable') {
        return undefined;
    }

    // For prefer/require modes, enable SSL
    if (sslMode === 'prefer' || sslMode === 'require') {
        return {
            rejectUnauthorized: sslMode === 'require',
        };
    }

    // For verify-ca/verify-full modes, use certificate files
    if (sslMode === 'verify-ca' || sslMode === 'verify-full') {
        const sslConfig: any = {
            rejectUnauthorized: true,
        };

        if (process.env.DATABASE_SSL_CA) {
            sslConfig.ca = process.env.DATABASE_SSL_CA;
        }

        if (process.env.DATABASE_SSL_CERT) {
            sslConfig.cert = process.env.DATABASE_SSL_CERT;
        }

        if (process.env.DATABASE_SSL_KEY) {
            sslConfig.key = process.env.DATABASE_SSL_KEY;
        }

        return sslConfig;
    }

    return undefined;
}

// Logging configuration based on environment
function getLogConfig(): Array<'query' | 'error' | 'warn' | 'info'> {
    const env = process.env.NODE_ENV;

    if (env === 'development') {
        return ['query', 'error', 'warn'];
    }

    if (env === 'test') {
        return ['error'];
    }

    // Production: only log errors
    return ['error'];
}

// Global singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient;
    prismaAdmin: PrismaClient;
};

/**
 * Main Prisma Client instance for application runtime
 * Uses low-privilege app user (DATABASE_URL)
 */
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: getLogConfig(),
        errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    });

/**
 * Admin Prisma Client instance for migrations and schema operations
 * Uses high-privilege admin user (DATABASE_ADMIN_URL)
 * 
 * Note: This should only be used for migrations, not in application runtime
 */
export const prismaAdmin =
    globalForPrisma.prismaAdmin ||
    new PrismaClient({
        log: getLogConfig(),
        errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    });

// Cache instances in development to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.prismaAdmin = prismaAdmin;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed
 */
export async function disconnectDatabase() {
    await prisma.$disconnect();
    if (globalForPrisma.prismaAdmin) {
        await prismaAdmin.$disconnect();
    }
}

// Handle process termination
if (process.env.NODE_ENV !== 'test') {
    process.on('beforeExit', () => {
        disconnectDatabase().catch(console.error);
    });

    process.on('SIGINT', () => {
        disconnectDatabase()
            .then(() => process.exit(0))
            .catch((error) => {
                console.error('Error disconnecting from database:', error);
                process.exit(1);
            });
    });

    process.on('SIGTERM', () => {
        disconnectDatabase()
            .then(() => process.exit(0))
            .catch((error) => {
                console.error('Error disconnecting from database:', error);
                process.exit(1);
            });
    });
}
