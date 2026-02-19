import { Prisma, AdriseOutput } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * AdriseOutput Repository
 * 
 * Handles all database operations related to adrise outputs.
 * Provides type-safe methods for output management.
 */
export class AdriseOutputRepository extends BaseRepository<
    AdriseOutput,
    typeof prisma.adriseOutput,
    Prisma.AdriseOutputWhereInput,
    Prisma.AdriseOutputOrderByWithRelationInput,
    Prisma.AdriseOutputCreateInput,
    Prisma.AdriseOutputUpdateInput
> {
    constructor() {
        super(prisma.adriseOutput, 'AdriseOutput');
    }

    /**
     * Find outputs by session ID
     */
    async findBySessionId(sessionId: string) {
        return this.delegate.findMany({
            where: { sessionId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find latest output for a session
     */
    async findLatestBySessionId(sessionId: string) {
        return this.delegate.findFirst({
            where: { sessionId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}

// Export singleton instance
export const adriseOutputRepository = new AdriseOutputRepository();
