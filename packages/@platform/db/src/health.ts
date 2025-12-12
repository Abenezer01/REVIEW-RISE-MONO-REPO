import { prisma } from './client';

/**
 * Database Health Check Utilities
 * 
 * Provides functions to monitor database connectivity,
 * performance, and overall health status.
 */

export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: Date;
    responseTime: number;
    details: {
        connected: boolean;
        version?: string;
        ssl?: boolean;
        error?: string;
    };
}

/**
 * Performs a comprehensive database health check
 * 
 * @returns Health check result with connection status and metrics
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const result: HealthCheckResult = {
        status: 'unhealthy',
        timestamp: new Date(),
        responseTime: 0,
        details: {
            connected: false,
        },
    };

    try {
        // Test basic connectivity with a simple query
        await prisma.$queryRaw`SELECT 1`;
        result.details.connected = true;

        // Get PostgreSQL version
        const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
            SELECT version()
        `;
        if (versionResult && versionResult[0]) {
            result.details.version = versionResult[0].version;
        }

        // Check if SSL is being used
        const sslResult = await prisma.$queryRaw<Array<{ ssl_is_used: boolean }>>`
            SELECT ssl_is_used()
        `;
        if (sslResult && sslResult[0]) {
            result.details.ssl = sslResult[0].ssl_is_used;
        }

        // Calculate response time
        result.responseTime = Date.now() - startTime;

        // Determine health status based on response time
        if (result.responseTime < 100) {
            result.status = 'healthy';
        } else if (result.responseTime < 500) {
            result.status = 'degraded';
        } else {
            result.status = 'unhealthy';
        }
    } catch (error) {
        result.status = 'unhealthy';
        result.responseTime = Date.now() - startTime;
        result.details.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
}

/**
 * Checks if the database is reachable
 * Simple ping-style check for quick health verification
 * 
 * @returns True if database is reachable, false otherwise
 */
export async function isDatabaseConnected(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch {
        return false;
    }
}

/**
 * Gets database connection pool statistics
 * Useful for monitoring connection usage and potential issues
 */
export async function getConnectionPoolStats() {
    try {
        const stats = await prisma.$queryRaw<
            Array<{
                total_connections: number;
                active_connections: number;
                idle_connections: number;
            }>
        >`
            SELECT 
                (SELECT count(*) FROM pg_stat_activity) as total_connections,
                (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
                (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections
        `;

        return stats[0] || null;
    } catch (error) {
        console.error('Failed to get connection pool stats:', error);
        return null;
    }
}

/**
 * Gets database size information
 * Useful for monitoring database growth
 */
export async function getDatabaseSize() {
    try {
        const result = await prisma.$queryRaw<
            Array<{
                database_name: string;
                size_mb: number;
            }>
        >`
            SELECT 
                current_database() as database_name,
                pg_database_size(current_database()) / 1024 / 1024 as size_mb
        `;

        return result[0] || null;
    } catch (error) {
        console.error('Failed to get database size:', error);
        return null;
    }
}

/**
 * Logs database health information to console
 * Useful for startup checks and monitoring
 */
export async function logDatabaseHealth() {
    const health = await checkDatabaseHealth();
    const poolStats = await getConnectionPoolStats();
    const dbSize = await getDatabaseSize();

    console.log('=== Database Health Check ===');
    console.log(`Status: ${health.status.toUpperCase()}`);
    console.log(`Response Time: ${health.responseTime}ms`);
    console.log(`Connected: ${health.details.connected}`);
    console.log(`SSL Enabled: ${health.details.ssl ?? 'Unknown'}`);

    if (health.details.version) {
        console.log(`Version: ${health.details.version.split(',')[0]}`);
    }

    if (health.details.error) {
        console.error(`Error: ${health.details.error}`);
    }

    if (poolStats) {
        console.log(`\nConnection Pool:`);
        console.log(`  Total: ${poolStats.total_connections}`);
        console.log(`  Active: ${poolStats.active_connections}`);
        console.log(`  Idle: ${poolStats.idle_connections}`);
    }

    if (dbSize) {
        console.log(`\nDatabase Size: ${dbSize.size_mb.toFixed(2)} MB`);
    }

    console.log('============================\n');
}

/**
 * Waits for database to become available
 * Useful for startup sequences and container orchestration
 * 
 * @param maxAttempts Maximum number of connection attempts
 * @param delayMs Delay between attempts in milliseconds
 * @returns True if connected successfully, false if max attempts reached
 */
export async function waitForDatabase(
    maxAttempts: number = 10,
    delayMs: number = 1000
): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const connected = await isDatabaseConnected();

        if (connected) {
            console.log(`Database connected on attempt ${attempt}`);
            return true;
        }

        if (attempt < maxAttempts) {
            console.log(`Database not ready, retrying in ${delayMs}ms... (${attempt}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.error(`Failed to connect to database after ${maxAttempts} attempts`);
    return false;
}
