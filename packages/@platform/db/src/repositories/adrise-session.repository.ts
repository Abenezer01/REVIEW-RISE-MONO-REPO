import { Prisma, AdriseSession } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * AdriseSession Repository
 * 
 * Handles all database operations related to adrise sessions.
 * Provides type-safe methods for session management.
 */
export class AdriseSessionRepository extends BaseRepository<
    AdriseSession,
    typeof prisma.adriseSession,
    Prisma.AdriseSessionWhereInput,
    Prisma.AdriseSessionOrderByWithRelationInput,
    Prisma.AdriseSessionCreateInput,
    Prisma.AdriseSessionUpdateInput
> {
    constructor() {
        super(prisma.adriseSession, 'AdriseSession');
    }

    /**
     * Find session with its versions and outputs
     */
    async findWithDetails(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc',
                    },
                },
                outputs: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    /**
     * Find sessions by business ID
     */
    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find sessions by user ID
     */
    async findByUserId(userId: string) {
        return this.delegate.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}

// Export singleton instance
export const adriseSessionRepository = new AdriseSessionRepository();
