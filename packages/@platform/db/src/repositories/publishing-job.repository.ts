import { Prisma, PublishingJob } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * PublishingJob Repository
 * 
 * Handles all database operations related to publishing jobs.
 * Provides type-safe methods for job tracking and retry logic.
 */
export class PublishingJobRepository extends BaseRepository<
    PublishingJob,
    typeof prisma.publishingJob,
    Prisma.PublishingJobWhereInput,
    Prisma.PublishingJobOrderByWithRelationInput,
    Prisma.PublishingJobCreateInput,
    Prisma.PublishingJobUpdateInput
> {
    constructor() {
        super(prisma.publishingJob, 'PublishingJob');
    }

    /**
     * Find jobs for a specific scheduled post
     */
    async findByPostId(scheduledPostId: string) {
        return this.delegate.findMany({
            where: { scheduledPostId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find pending jobs that need to be processed
     */
    async findPendingJobs() {
        return this.delegate.findMany({
            where: {
                status: 'pending',
                scheduledPost: {
                    scheduledAt: {
                        lte: new Date(),
                    },
                    status: 'scheduled',
                },
            },
            include: {
                scheduledPost: true,
            },
        });
    }

    /**
     * Increment attempt count and update status
     */
    async incrementAttempt(id: string, error?: string) {
        return this.delegate.update({
            where: { id },
            data: {
                attemptCount: {
                    increment: 1,
                },
                lastAttemptAt: new Date(),
                error: error || null,
                status: 'failed',
            },
        });
    }
}

export const publishingJobRepository = new PublishingJobRepository();
