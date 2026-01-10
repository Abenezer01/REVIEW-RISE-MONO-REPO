import { Prisma, Review } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class ReviewRepository extends BaseRepository<
    Review,
    typeof prisma.review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewOrderByWithRelationInput,
    Prisma.ReviewCreateInput,
    Prisma.ReviewUpdateInput
> {
    constructor() {
        super(prisma.review, 'Review');
    }

    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: { publishedAt: 'desc' },
        });
    }

    async countByBusinessId(businessId: string) {
        return this.count({ businessId });
    }
}

export const reviewRepository = new ReviewRepository();
