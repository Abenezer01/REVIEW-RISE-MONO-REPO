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

    async upsertReview(data: Prisma.ReviewCreateInput) {
        return this.delegate.upsert({
            where: {
                platform_externalId: {
                    platform: data.platform,
                    externalId: data.externalId
                }
            },
            update: {
                rating: data.rating,
                content: data.content,
                author: data.author,
                response: data.response,
                respondedAt: data.respondedAt,
                // publishedAt is usually immutable but if platform updates it...
            },
            create: data
        });
    }

    async findByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId },
            orderBy: { publishedAt: 'desc' }
        });
    }
}

export const reviewRepository = new ReviewRepository();
