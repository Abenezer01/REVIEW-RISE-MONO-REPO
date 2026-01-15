import { reviewRepository, Prisma } from '@platform/db';

export interface ListReviewsParams {
    locationId: string;
    page?: number;
    limit?: number;
    platform?: string;
    rating?: number;
    startDate?: string;
    endDate?: string;
    sentiment?: string;
}

export const listReviewsByLocation = async (params: ListReviewsParams) => {
    const {
        locationId,
        page = 1,
        limit = 10,
        platform,
        rating,
        startDate,
        endDate,
        sentiment,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
        locationId,
    };

    if (platform && platform !== 'all') {
        where.platform = platform;
    }

    if (rating) {
        where.rating = Number(rating);
    }

    if (startDate || endDate) {
        where.publishedAt = {};
        if (startDate) {
            where.publishedAt.gte = new Date(startDate);
        }
        if (endDate) {
            where.publishedAt.lte = new Date(endDate);
        }
    }

    if (sentiment && sentiment !== 'all') {
        where.sentiment = sentiment;
    }

    const { items: reviews, total } = await reviewRepository.findPaginated({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
    });

    return {
        reviews,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};
