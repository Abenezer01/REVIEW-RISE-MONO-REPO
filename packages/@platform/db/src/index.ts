// Export enhanced Prisma clients
export { prisma, prismaAdmin, disconnectDatabase } from './client';

// Export all repositories
export * from './repositories';

// Export services
export { VisibilityComputationService, visibilityComputationService } from './services/visibility-computation.service';
export { RankTrackingService, rankTrackingService } from './services/rank-tracking.service';

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

