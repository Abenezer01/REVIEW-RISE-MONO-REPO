import { Prisma, SeoSnapshot } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * SeoSnapshot Repository
 * 
 * Handles all database operations related to SEO snapshots.
 */
export class SeoSnapshotRepository extends BaseRepository<
    SeoSnapshot,
    typeof prisma.seoSnapshot,
    Prisma.SeoSnapshotWhereInput,
    Prisma.SeoSnapshotOrderByWithRelationInput,
    Prisma.SeoSnapshotCreateInput,
    Prisma.SeoSnapshotUpdateInput
> {
    constructor() {
        super(prisma.seoSnapshot, 'SeoSnapshot');
    }

    /**
     * Find snapshots by URL
     */
    async findByUrl(url: string) {
        return this.findMany({
            where: { url },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Find snapshots by User
     */
    async findByUser(userId: string) {
        return this.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export const seoSnapshotRepository = new SeoSnapshotRepository();
