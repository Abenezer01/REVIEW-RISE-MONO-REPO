import { Prisma, ScheduledPost } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * ScheduledPost Repository
 * 
 * Handles all database operations related to scheduled posts.
 * Provides type-safe methods for post scheduling management.
 */
export class ScheduledPostRepository extends BaseRepository<
    ScheduledPost,
    typeof prisma.scheduledPost,
    Prisma.ScheduledPostWhereInput,
    Prisma.ScheduledPostOrderByWithRelationInput,
    Prisma.ScheduledPostCreateInput,
    Prisma.ScheduledPostUpdateInput
> {
    constructor() {
        super(prisma.scheduledPost, 'ScheduledPost');
    }

    /**
     * Find scheduled posts by business ID
     */
    async findByBusinessId(businessId: string, options?: { 
        status?: string;
        from?: Date;
        to?: Date;
    }) {
        const where: Prisma.ScheduledPostWhereInput = {
            businessId,
        };

        if (options?.status) {
            where.status = options.status;
        }

        if (options?.from || options?.to) {
            where.scheduledAt = {
                gte: options.from,
                lte: options.to,
            };
        }

        return this.delegate.findMany({
            where,
            include: {
                publishingJobs: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });
    }

    /**
     * Find scheduled posts by location ID
     */
    async findByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId },
            include: {
                publishingJobs: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });
    }

    /**
     * Find post with its publishing jobs
     */
    async findWithJobs(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                publishingJobs: true,
            },
        });
    }
}

export const scheduledPostRepository = new ScheduledPostRepository();
