// Export enhanced Prisma clients
export { prisma, prismaAdmin, disconnectDatabase } from './client';
export * from '@prisma/client';

// Export all repositories
export * from './repositories';

// Export services
export * from './services';

// Export health check utilities
export * from './health';

// Re-export commonly used items for convenience
import { prisma } from './client';
import { repositories } from './repositories';
import { checkDatabaseHealth, logDatabaseHealth } from './health';
import { brandScoringService, rankTrackingService, visibilityComputationService } from './services';

export default {
    prisma,
    repositories,
    services: {
        brandScoring: brandScoringService,
        rankTracking: rankTrackingService,
        visibilityComputation: visibilityComputationService,
    },
    health: {
        check: checkDatabaseHealth,
        log: logDatabaseHealth,
    },
};

