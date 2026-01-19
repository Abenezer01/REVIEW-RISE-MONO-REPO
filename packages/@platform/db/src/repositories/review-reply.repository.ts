import { Prisma, ReviewReply } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class ReviewReplyRepository extends BaseRepository<
    ReviewReply,
    typeof prisma.reviewReply,
    Prisma.ReviewReplyWhereInput,
    Prisma.ReviewReplyOrderByWithRelationInput,
    Prisma.ReviewReplyCreateInput,
    Prisma.ReviewReplyUpdateInput
> {
    constructor() {
        super(prisma.reviewReply, 'ReviewReply');
    }

    async findByReviewId(reviewId: string) {
        return this.delegate.findMany({
            where: { reviewId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findLatestByReviewId(reviewId: string) {
        return this.delegate.findFirst({
            where: { reviewId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const reviewReplyRepository = new ReviewReplyRepository();
