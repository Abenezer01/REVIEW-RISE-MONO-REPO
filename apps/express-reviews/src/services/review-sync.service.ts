import { googleReviewsService } from './google-reviews.service';
import { 
    reviewRepository, 
    reviewSourceRepository, 
    reviewSyncLogRepository, 
    locationRepository 
} from '@platform/db';
import { ReviewSource } from '@prisma/client';

export class ReviewSyncService {
    async syncReviewsForLocation(locationId: string) {
        const sources = await reviewSourceRepository.findByLocationId(locationId);
        
        const results = [];
        for (const source of sources) {
            if (source.status !== 'active' || !source.accessToken) continue;

            if (source.platform === 'google') {
                results.push(this.syncGoogleReviews(source));
            }
        }
        
        return Promise.all(results);
    }

    private async syncGoogleReviews(source: ReviewSource) {
        let status = 'success';
        let errorMessage: string | undefined;
        let reviewsSynced = 0;
        const startedAt = new Date();

        try {
            // Refresh token if needed? 
            // Google tokens expire in 1 hour. We likely need to refresh if close to expiry.
            // For now, let's assume valid or auto-refresh in wrapper (not implemented yet).
            // Better: Check expiry and refresh.
            
            let accessToken = source.accessToken!;
            if (source.refreshToken && source.expiresAt && BigInt(new Date().getTime()) > (source.expiresAt - BigInt(300000))) {
                 console.log("Refreshing token for source:", source.id);
                 const tokens = await googleReviewsService.refreshAccessToken(source.refreshToken);
                 accessToken = tokens.access_token!;
                 // Update DB
                 await reviewSourceRepository.updateTokens(
                    source.id, 
                    tokens.access_token!, 
                    tokens.refresh_token || undefined, 
                    tokens.expiry_date || undefined
                 );
            }

            const metadata = source.metadata as any;
            if (!metadata?.locationName) {
                throw new Error('Missing locationName in metadata');
            }

            // Fetch location to get businessId
            const location = await locationRepository.findById(source.locationId);
            if (!location) throw new Error('Location not found');

            const { reviews } = await googleReviewsService.listReviews(accessToken, metadata.locationName);
            
            if (reviews && reviews.length > 0) {
                for (const review of reviews) {
                    await reviewRepository.upsertReview({
                        business: { connect: { id: location.businessId } },
                        location: { connect: { id: source.locationId } },
                        platform: 'google',
                        externalId: review.reviewId,
                        author: review.reviewer.displayName,
                        rating: this.mapRating(review.starRating),
                        content: review.comment || '',
                        publishedAt: new Date(review.createTime),
                        response: review.reviewReply?.comment,
                        respondedAt: review.reviewReply?.updateTime ? new Date(review.reviewReply.updateTime) : null,
                        reviewSource: { connect: { id: source.id } }
                    });
                    reviewsSynced++;
                }
            }

        } catch (error: any) {
            status = 'failed';
            errorMessage = error.message;
            console.error('Error syncing Google reviews:', error);
        }

        // Log the sync
        const location = await locationRepository.findById(source.locationId);
        if (location) {
             await reviewSyncLogRepository.createLog({
                business: { connect: { id: location.businessId } },
                location: { connect: { id: source.locationId } },
                platform: source.platform,
                status,
                errorMessage,
                reviewsSynced,
                startedAt,
                completedAt: new Date(),
                durationMs: new Date().getTime() - startedAt.getTime()
            });
        }
       
        return { sourceId: source.id, status, reviewsSynced };
    }

    private mapRating(starRating: string): number {
        switch (starRating) {
            case 'ONE': return 1;
            case 'TWO': return 2;
            case 'THREE': return 3;
            case 'FOUR': return 4;
            case 'FIVE': return 5;
            default: return 0;
        }
    }
}

export const reviewSyncService = new ReviewSyncService();
