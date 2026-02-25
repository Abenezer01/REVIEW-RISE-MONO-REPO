import { platformIntegrationRepository, Prisma, reviewReplyRepository, reviewRepository } from '@platform/db';
import { googleReviewsService } from './google-reviews.service';
import { tokenGuardService } from './token-guard.service';

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

export const postReviewReply = async (
    reviewId: string, 
    comment: string,
    options: {
        authorType?: 'user' | 'auto';
        sourceType?: 'ai' | 'manual';
        userId?: string;
    } = {}
) => {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new Error('Review not found');

    // Create a draft reply record first
    const replyRecord = await reviewReplyRepository.create({
        review: { connect: { id: reviewId } },
        content: comment,
        authorType: options.authorType || 'user',
        sourceType: options.sourceType || 'manual',
        status: 'draft',
        user: options.userId ? { connect: { id: options.userId } } : undefined
    });

    // Handle both 'google' and 'gbp' as platform identifiers
    if (review.platform === 'google' || review.platform === 'gbp') {
        // 1. Get the PlatformIntegration for the location
        if (!review.locationId) throw new Error('Review must have a locationId to post a reply');
        const integration = await platformIntegrationRepository.findByLocationIdAndPlatform(review.locationId, 'google');
        if (!integration || integration.status !== 'active') {
            const errorMsg = 'Active Google Platform Integration not found for this location';
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }

        // 2. Get valid access token (TokenGuard handles decrypt and refresh)
        let accessToken;
        try {
            accessToken = await tokenGuardService.getValidAccessToken(integration);
        } catch (tokenError: any) {
            const errorMsg = `Failed to get valid Google token: ${tokenError.message}`;
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }

        const gbpLocationName = integration.gbpLocationName;
        if (!gbpLocationName) {
            const errorMsg = 'Missing GBP locationName in integration';
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }

        // 3. Reconstruct the full review name
        // externalId is the platform-specific reviewId
        const reviewName = `${gbpLocationName}/reviews/${review.externalId}`;

        try {
            console.log(`[GBP] Posting/Updating reply for review ${reviewId} (${reviewName})`);
            
            // 4. Post the reply (PUT handles both creation and updates in GBP API)
            const result = await googleReviewsService.updateReply(accessToken, reviewName, comment);

            // 5. Update the review and reply record in DB
            await Promise.all([
                reviewRepository.update(reviewId, {
                    response: comment,
                    respondedAt: new Date(),
                    replyStatus: 'posted',
                    replyError: null // Clear any previous errors
                } as any),
                reviewReplyRepository.update(replyRecord.id, {
                    status: 'posted'
                })
            ]);

            return { success: true, data: result };
        } catch (apiError: any) {
            const errorMsg = `Google API Error: ${apiError.response?.data?.error?.message || apiError.message}`;
            console.error(`[GBP] Error posting reply:`, errorMsg);
            
            await Promise.all([
                reviewRepository.update(reviewId, { 
                    replyStatus: 'failed', 
                    replyError: errorMsg 
                } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            
            throw new Error(errorMsg);
        }
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
