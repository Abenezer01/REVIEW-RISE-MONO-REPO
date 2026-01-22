import { socialConnectionRepository } from '@platform/db';
import axios from 'axios';

const SOCIAL_SERVICE_URL = process.env.SOCIAL_SERVICE_URL || 'http://localhost:3003';

/**
 * Refresh Social Media Tokens Job
 * Runs periodically to refresh expiring social connection tokens
 */
export async function refreshSocialTokensJob() {
    console.log('[RefreshTokens] Starting social token refresh job...');

    try {
        // Find connections with tokens expiring in the next 48 hours
        const expiringConnections = await socialConnectionRepository.findExpiringTokens(48);

        console.log(`[RefreshTokens] Found ${expiringConnections.length} connections with expiring tokens`);

        let successCount = 0;
        let errorCount = 0;

        for (const connection of expiringConnections) {
            try {
                console.log(`[RefreshTokens] Refreshing ${connection.platform} connection ${connection.id}`);

                // Call the express-social API to refresh the connection
                await axios.post(`${SOCIAL_SERVICE_URL}/connections/${connection.id}/refresh`, {}, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                successCount++;
                console.log(`[RefreshTokens] ✓ Successfully refreshed ${connection.platform} connection ${connection.id}`);

            } catch (error: any) {
                errorCount++;
                console.error(`[RefreshTokens] ✗ Failed to refresh connection ${connection.id}:`, error.message);

                // The API endpoint already updates the status to error, so we don't need to do it here
            }
        }

        console.log(`[RefreshTokens] Job completed. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error: any) {
        console.error('[RefreshTokens] Job failed:', error);
    }
}
