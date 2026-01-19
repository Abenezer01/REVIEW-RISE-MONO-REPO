import { reviewRepository, reviewSourceRepository, reviewReplyRepository, Prisma } from '@platform/db';
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
        // 1. Get the ReviewSource to get the accessToken
        if (!review.reviewSourceId) {
            const errorMsg = 'Review source not found for this review';
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }
        
        const source = await reviewSourceRepository.findById(review.reviewSourceId);
        if (!source) {
            const errorMsg = 'Review source not found in database';
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }

        let accessToken = source.accessToken;

        // 2. Check if token is expired and refresh if necessary (with 5 min buffer)
        const now = Date.now();
        if (source.refreshToken && source.expiresAt && Number(source.expiresAt) <= (now + 300000)) {
            console.log(`[GBP] Token expired for source ${source.id}, refreshing...`);
            try {
                const credentials = await googleReviewsService.refreshAccessToken(source.refreshToken);
                if (credentials.access_token) {
                    accessToken = credentials.access_token;
                    const expiresAt = credentials.expiry_date || (now + 3600 * 1000);
                    
                    await reviewSourceRepository.updateTokens(
                        source.id, 
                        accessToken, 
                        credentials.refresh_token || undefined, 
                        expiresAt
                    );
                    console.log(`[GBP] Token refreshed successfully for source ${source.id}`);
                }
            } catch (refreshError: any) {
                const errorMsg = `Failed to refresh Google token: ${refreshError.message}`;
                await Promise.all([
                    reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                    reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
                ]);
                throw new Error(errorMsg);
            }
        }

        if (!accessToken) {
            const errorMsg = 'No access token available for GBP';
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }

        const metadata = source.metadata as any;
        if (!metadata?.locationName) {
            const errorMsg = 'Missing locationName in source metadata';
            await Promise.all([
                reviewRepository.update(reviewId, { replyStatus: 'failed', replyError: errorMsg } as any),
                reviewReplyRepository.update(replyRecord.id, { status: 'failed' })
            ]);
            throw new Error(errorMsg);
        }

        // 3. Reconstruct the full review name
        // locationName format: "accounts/{accountId}/locations/{locationId}"
        // externalId is the platform-specific reviewId
        const reviewName = `${metadata.locationName}/reviews/${review.externalId}`;

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
