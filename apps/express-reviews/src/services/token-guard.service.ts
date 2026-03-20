import { PlatformIntegration } from '@prisma/client';
import { platformIntegrationRepository } from '@platform/db';
import { decryptToken, encryptToken, isEncryptedToken } from '@platform/utils';
import { googleReviewsService } from './google-reviews.service';

/**
 * TokenGuardService
 *
 * Ensures a valid, non-expired access token is available before every GBP API call.
 * Handles decryption, expiry checks, silent refresh, and re-encryption.
 */
export class TokenGuardService {
    /**
     * Returns a valid plain-text access token for the given PlatformIntegration.
     * Refreshes and re-encrypts automatically if the token is within 5 minutes of expiry.
     * Throws if the token cannot be decrypted or refreshed.
     */
    async getValidAccessToken(integration: PlatformIntegration): Promise<string> {
        if (!integration.accessToken) {
            throw new Error(`PlatformIntegration ${integration.id} has no accessToken.`);
        }

        const plainAccessToken = this.decryptSafe(integration.accessToken);

        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const expiryMs = integration.expiresAt ? Number(integration.expiresAt) : 0;
        const needsRefresh = expiryMs > 0 && expiryMs - Date.now() < FIVE_MINUTES_MS;

        if (!needsRefresh) {
            return plainAccessToken;
        }

        if (!integration.refreshToken) {
            throw new Error(
                `PlatformIntegration ${integration.id} token is expired but no refreshToken is available. ` +
                `User must reconnect.`
            );
        }

        // eslint-disable-next-line no-console
        console.log(`[TokenGuard] Refreshing token for PlatformIntegration ${integration.id}`);
        const plainRefreshToken = this.decryptSafe(integration.refreshToken);

        try {
            const newCredentials = await googleReviewsService.refreshAccessToken(plainRefreshToken);

            if (!newCredentials.access_token) {
                throw new Error('Refresh returned no access_token');
            }

            const newEncryptedAccess = encryptToken(newCredentials.access_token);
            const newEncryptedRefresh = newCredentials.refresh_token
                ? encryptToken(newCredentials.refresh_token)
                : undefined;

            await platformIntegrationRepository.updateTokens(
                integration.id,
                newEncryptedAccess,
                newEncryptedRefresh,
                newCredentials.expiry_date ?? undefined
            );

            return newCredentials.access_token;
        } catch (error: any) {
            // Mark integration as error so the frontend shows "Reconnect"
            await platformIntegrationRepository.updateStatus(integration.id, 'error').catch(() => { });
            throw new Error(
                `Failed to refresh Google token for integration ${integration.id}: ${error.message}. ` +
                `The connection has been marked as errored.`
            );
        }
    }

    /**
     * Safely decrypt a token — handles both encrypted (new format) and plain-text (legacy) tokens.
     * During migration, existing rows may still have unencrypted tokens.
     */
    private decryptSafe(token: string): string {
        if (isEncryptedToken(token)) {
            return decryptToken(token);
        }
        // Legacy plain-text token — return as-is
        return token;
    }
}

export const tokenGuardService = new TokenGuardService();
