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

    async findPaginated(params: {
        where: Prisma.ReviewWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.ReviewOrderByWithRelationInput;
    }) {
        const [items, total] = await Promise.all([
            this.delegate.findMany({
                where: params.where,
                skip: params.skip,
                take: params.take,
                orderBy: params.orderBy || { publishedAt: 'desc' },
            }),
            this.count(params.where),
        ]);

        return { items, total };
    }
}

export const reviewRepository = new ReviewRepository();
