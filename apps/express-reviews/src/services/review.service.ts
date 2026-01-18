import { reviewRepository, reviewSourceRepository, Prisma } from '@platform/db';
import { googleReviewsService } from './google-reviews.service';

export interface ListReviewsParams {
    locationId: string;
    page?: number;
    limit?: number;
    platform?: string;
    rating?: number;
    startDate?: string;
    endDate?: string;
    sentiment?: string;
    replyStatus?: string;
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
        replyStatus,
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

    if (replyStatus && replyStatus !== 'all') {
        (where as any).replyStatus = replyStatus;
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

export const postReviewReply = async (reviewId: string, comment: string) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new Error('Review not found');

    if (review.platform === 'google') {
        // 1. Get the ReviewSource to get the accessToken
        if (!review.reviewSourceId) throw new Error('Review source not found for this review');
        
        const source = await reviewSourceRepository.findById(review.reviewSourceId);
        if (!source || !source.accessToken) throw new Error('Review source or access token not found');

        const metadata = source.metadata as any;
        if (!metadata?.locationName) throw new Error('Missing locationName in source metadata');

        // 2. Reconstruct the full review name
        // locationName is "accounts/{accountId}/locations/{locationId}"
        // externalId is the reviewId
        const reviewName = `${metadata.locationName}/reviews/${review.externalId}`;

        // 3. Post the reply
        await googleReviewsService.updateReply(source.accessToken, reviewName, comment);

        // 4. Update the review in DB
        await reviewRepository.update(reviewId, {
            response: comment,
            respondedAt: new Date(),
            replyStatus: 'posted'
        } as any);

        return { success: true };
    }

    throw new Error(`Platform ${review.platform} not supported for posting replies yet`);
};

export const rejectReviewReply = async (reviewId: string) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new Error('Review not found');

    await reviewRepository.update(reviewId, {
        replyStatus: 'rejected'
    } as any);

    return { success: true };
};
