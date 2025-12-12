/**
 * @platform/db - Database Package
 * 
 * Centralized database access layer with:
 * - Prisma client configuration with SSL/TLS support
 * - Type-safe repository pattern for all models
 * - Database health checks and monitoring
 * - Connection management and graceful shutdown
 * 
 * @example Basic Usage
 * ```typescript
 * import { prisma, userRepository } from '@platform/db';
 * 
 * // Using repositories (recommended)
 * const user = await userRepository.findByEmail('user@example.com');
 * 
 * // Using Prisma client directly (when needed)
 * const result = await prisma.$queryRaw`SELECT * FROM users`;
 * ```
 */

// Export Prisma client and types
export * from '@prisma/client';

// Export enhanced Prisma clients
export { prisma, prismaAdmin, disconnectDatabase } from './client';

// Export all repositories
export * from './repositories';

// Export health check utilities
export * from './health';

// Re-export commonly used items for convenience
import { prisma } from './client';
import { repositories } from './repositories';
import { checkDatabaseHealth, logDatabaseHealth } from './health';

export default {
    prisma,
    repositories,
    health: {
        check: checkDatabaseHealth,
        log: logDatabaseHealth,
    },
};

