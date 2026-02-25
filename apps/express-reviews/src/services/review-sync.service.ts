import { googleReviewsService } from './google-reviews.service';
import { tokenGuardService } from './token-guard.service';
import { 
    reviewRepository, 
    reviewSourceRepository, 
    reviewSyncLogRepository, 
    locationRepository,
    platformIntegrationRepository 
} from '@platform/db';
import { ReviewSource } from '@prisma/client';

export class ReviewSyncService {
    async syncReviewsForLocation(locationId: string) {
        const sources = await reviewSourceRepository.findByLocationId(locationId);
        
        const results = [];
        for (const source of sources) {
            if (source.status !== 'active') continue;
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
            // Fetch the Google platform integration for this location
            const integration = await platformIntegrationRepository.findByLocationIdAndPlatform(source.locationId, 'google');
            
            if (!integration || integration.status !== 'active') {
                throw new Error('No active Google PlatformIntegration found for this location. Reconnection required.');
            }

            // Token guard handles decryption + auto-refresh for PlatformIntegration
            const accessToken = await tokenGuardService.getValidAccessToken(integration);

            // Use dedicated gbpLocationName field from integration
            const gbpLocationName = integration.gbpLocationName;

            if (!gbpLocationName) {
                throw new Error('No GBP locationName found on the PlatformIntegration. User may need to reconnect.');
            }

            const location = await locationRepository.findById(source.locationId);
            if (!location) throw new Error('Location not found');

            const { reviews } = await googleReviewsService.listReviews(accessToken, gbpLocationName);
            
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
