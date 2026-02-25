import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const SCOPES = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
];

export interface GbpAccount {
    name: string;          // "accounts/123456"
    accountName: string;   // Display name
    type: string;          // "PERSONAL", "LOCATION_GROUP", etc.
    verificationState?: string;
}

export interface GbpLocation {
    name: string;          // "accounts/123456/locations/789"
    title: string;         // Business display name
    storeCode?: string;
    websiteUri?: string;
    phoneNumbers?: { primaryPhone?: string };
    storefrontAddress?: {
        addressLines?: string[];
        locality?: string;
        administrativeArea?: string;
        postalCode?: string;
        regionCode?: string;
    };
    metadata?: {
        mapsUri?: string;
        newReviewUri?: string;
    };
}

export class GoogleReviewsService {
    private oauth2Client: OAuth2Client;

    constructor() {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
            console.error('Google OAuth credentials missing');
        }

        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    getAuthUrl(state: string): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state,
            prompt: 'consent', // Always force consent to guarantee refresh_token
        });
    }

    async getTokens(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    async refreshAccessToken(refreshToken: string) {
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        return credentials;
    }

    /**
     * Revoke a Google OAuth token (access or refresh).
     * Call on disconnect.
     */
    async revokeToken(token: string): Promise<void> {
        try {
            await axios.post(
                `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`,
                {},
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
        } catch (error) {
            // Non-critical: token may already be expired/revoked
            console.warn('Token revocation failed (may already be revoked):', error);
        }
    }

    /**
     * List all GBP accounts for the authenticated user.
     */
    async listAccounts(accessToken: string): Promise<GbpAccount[]> {
        const response = await axios.get(
            'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data.accounts || [];
    }

    /**
     * List locations for a specific account.
     * accountId format: "accounts/{accountId}"
     */
    async listLocations(accessToken: string, accountId: string): Promise<GbpLocation[]> {
        const response = await axios.get(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    readMask: 'name,title,storeCode,websiteUri,phoneNumbers,storefrontAddress,metadata',
                },
            }
        );
        return response.data.locations || [];
    }

    /**
     * Fetch all locations across ALL accounts for the authenticated user.
     * Returns a flat array with an `accountId` attached to each location.
     */
    async listAllLocations(
        accessToken: string,
        accounts: GbpAccount[]
    ): Promise<Array<GbpLocation & { accountId: string }>> {
        const results = await Promise.allSettled(
            accounts.map(async (account) => {
                const locs = await this.listLocations(accessToken, account.name);
                return locs.map((loc) => ({ ...loc, accountId: account.name }));
            })
        );

        const locations: Array<GbpLocation & { accountId: string }> = [];
        for (const result of results) {
            if (result.status === 'fulfilled') {
                locations.push(...result.value);
            }
        }
        return locations;
    }

    /**
     * Fetch reviews for a specific GBP location.
     * locationName format: "accounts/{accountId}/locations/{locationId}"
     */
    async listReviews(accessToken: string, locationName: string, pageToken?: string) {
        const response = await axios.get(
            `https://mybusiness.googleapis.com/v4/${locationName}/reviews`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { pageSize: 50, pageToken },
            }
        );
        return {
            reviews: response.data.reviews || [],
            nextPageToken: response.data.nextPageToken,
        };
    }

    /**
     * Post or update a reply to a review.
     * reviewName format: "accounts/{accountId}/locations/{locationId}/reviews/{reviewId}"
     */
    async updateReply(accessToken: string, reviewName: string, comment: string) {
        const response = await axios.put(
            `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
            { comment },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    }

    /**
     * Delete a reply to a review.
     */
    async deleteReply(accessToken: string, reviewName: string) {
        await axios.delete(
            `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return { success: true };
    }
}

export const googleReviewsService = new GoogleReviewsService();
