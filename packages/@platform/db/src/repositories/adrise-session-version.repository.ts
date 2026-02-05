import { Prisma, AdriseSessionVersion } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * AdriseSessionVersion Repository
 * 
 * Handles all database operations related to adrise session versions.
 * Provides type-safe methods for session version management.
 */
export class AdriseSessionVersionRepository extends BaseRepository<
    AdriseSessionVersion,
    typeof prisma.adriseSessionVersion,
    Prisma.AdriseSessionVersionWhereInput,
    Prisma.AdriseSessionVersionOrderByWithRelationInput,
    Prisma.AdriseSessionVersionCreateInput,
    Prisma.AdriseSessionVersionUpdateInput
> {
    constructor() {
        super(prisma.adriseSessionVersion, 'AdriseSessionVersion');
    }

    /**
     * Find versions by session ID
     */
    async findBySessionId(sessionId: string) {
        return this.delegate.findMany({
            where: { sessionId },
            orderBy: {
                versionNumber: 'desc',
            },
        });
    }

    /**
     * Get the latest version number for a session
     */
    async getLatestVersionNumber(sessionId: string): Promise<number> {
        const latest = await this.delegate.findFirst({
            where: { sessionId },
            orderBy: {
                versionNumber: 'desc',
            },
            select: {
                versionNumber: true,
            },
        });

        return latest ? latest.versionNumber : 0;
    }
}

// Export singleton instance
export const adriseSessionVersionRepository = new AdriseSessionVersionRepository();
