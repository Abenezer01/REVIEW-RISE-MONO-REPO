import { platformIntegrationRepository } from '@platform/db';

export class GbpProfileService {

    /**
     * Get the Google connection for a location
     */
    async getConnection(locationId: string) {
        return platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');
    }

    /**
     * Get a valid access token for a location, refreshing it if necessary.
     */
    async getAccessToken(locationId: string): Promise<string> {
        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!connection) {
            throw new Error('No Google connection found for this location');
        }

        // Check if token is expired or close to expiring (within 5 minutes)
        const isExpired = connection.expiresAt && Number(connection.expiresAt) < Date.now() + 5 * 60 * 1000;

        if (isExpired && connection.refreshToken) {
            return this.refreshTokens(locationId, connection.refreshToken);
        }

        if (!connection.accessToken) {
            throw new Error('Access token is missing from connection');
        }

        return connection.accessToken;
    }

    /**
     * Refresh the Google OAuth tokens and save them to the database.
     */
    async refreshTokens(locationId: string, refreshToken: string): Promise<string> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Google OAuth credentials not configured');
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to refresh Google token: ${error}`);
        }

        const data = await response.json() as { access_token: string; expires_in: number; id_token?: string };

        const expiresAt = Date.now() + data.expires_in * 1000;

        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (connection) {
            await platformIntegrationRepository.updateTokens(
                connection.id,
                data.access_token,
                refreshToken,
                expiresAt
            );
        }

        return data.access_token;
    }

    /**
     * Example method demonstrating metadata access as seen in original error trace.
     */
    async getProfileMetadata(locationId: string) {
        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!connection) {
            throw new Error('No Google connection found for this location');
        }

        const metadata = connection.metadata;

        return metadata;
    }
}

export const gbpProfileService = new GbpProfileService();
