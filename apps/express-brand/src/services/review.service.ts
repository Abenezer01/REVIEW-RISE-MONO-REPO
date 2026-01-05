import { prisma } from '@platform/db';

export const listReviews = async (businessId: string, params: { page?: number; limit?: number; platform?: string }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { businessId };
    if (params.platform && params.platform !== 'all') {
        where.platform = params.platform;
    }

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            skip,
            take: limit,
            orderBy: { publishedAt: 'desc' },
        }),
        prisma.review.count({ where }),
    ]);

    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

export const getReviewStats = async (businessId: string) => {
    const reviews = await prisma.review.findMany({
        where: { businessId },
        select: { rating: true },
    });

    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / total : 0;

    return {
        totalReviews: total,
        averageRating: parseFloat(average.toFixed(1)),
    };
};

export const replyReview = async (businessId: string, reviewId: string, response: string) => {
    return prisma.review.update({
        where: { id: reviewId, businessId },
        data: {
            response,
            respondedAt: new Date(),
        },
    });
};
