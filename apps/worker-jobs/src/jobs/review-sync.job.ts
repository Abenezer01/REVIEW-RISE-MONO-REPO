import { reviewSourceRepository } from '@platform/db';
import axios from 'axios';

export const runReviewSyncJob = async () => {
    // eslint-disable-next-line no-console
    console.log('Starting daily review sync job...');
    try {
        const sources = await reviewSourceRepository.findMany({ 
            where: { 
                status: 'active' 
            } 
        });
        
        // Group by locationId to avoid calling sync multiple times for same location
        const locationIds = [...new Set(sources.map(s => s.locationId))];
        
        // eslint-disable-next-line no-console
        console.log(`Found ${sources.length} active sources across ${locationIds.length} locations.`);

        const expressReviewsUrl = process.env.EXPRESS_REVIEWS_URL || 'http://express-reviews:3006';

        for (const locationId of locationIds) {
            try {
                // Call the internal sync endpoint
                await axios.post(`${expressReviewsUrl}/api/v1/locations/${locationId}/sync`);
                // eslint-disable-next-line no-console
                console.log(`Triggered reviews sync for location ${locationId}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                // eslint-disable-next-line no-console
                console.error(`Failed to trigger review sync for location ${locationId}:`, message);
            }
        }
        // eslint-disable-next-line no-console
        console.log('Daily review sync job completed.');
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error in review sync job:', e);
    }
}
