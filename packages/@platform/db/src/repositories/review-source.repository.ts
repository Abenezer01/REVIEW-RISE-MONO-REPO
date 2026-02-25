import { Prisma, ReviewSource } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class ReviewSourceRepository extends BaseRepository<
    ReviewSource,
    typeof prisma.reviewSource,
    Prisma.ReviewSourceWhereInput,
    Prisma.ReviewSourceOrderByWithRelationInput,
    Prisma.ReviewSourceCreateInput,
    Prisma.ReviewSourceUpdateInput
> {
    constructor() {
        super(prisma.reviewSource, 'ReviewSource');
    }

    async findByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId },
        });
    }

    async findActiveByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId, status: 'active' },
        });
    }

    async findByLocationIdAndPlatform(locationId: string, platform: string) {
        return this.delegate.findFirst({
            where: { locationId, platform },
        });
    }

    async updateStatus(id: string, status: 'active' | 'error' | 'disconnected') {
        return this.update(id, { status });
    }

    async upsertLocationPlatform(locationId: string, platform: string) {
        return (this.delegate as any).upsert({
            where: {
                locationId_platform: {
                    locationId,
                    platform
                }
            },
            update: {
                status: 'active'
            },
            create: {
                locationId,
                platform,
                status: 'active'
            }
        });
    }
}

export const reviewSourceRepository = new ReviewSourceRepository();

