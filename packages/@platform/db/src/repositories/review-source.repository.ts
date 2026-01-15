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

    async findByLocationIdAndPlatform(locationId: string, platform: string) {
        return this.delegate.findFirst({
            where: { locationId, platform },
        });
    }

    async updateTokens(id: string, accessToken: string, refreshToken?: string, expiresAt?: number) {
        return this.update(id, {
            accessToken,
            ...(refreshToken && { refreshToken }),
            ...(expiresAt && { expiresAt })
        });
    }
}

export const reviewSourceRepository = new ReviewSourceRepository();
