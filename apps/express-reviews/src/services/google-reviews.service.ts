import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const SCOPES = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

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
            access_type: 'offline', // Request refresh token
            scope: SCOPES,
            state: state,
            prompt: 'consent' // Force consent to ensure refresh token is returned
        });
    }

    async getTokens(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    async refreshAccessToken(refreshToken: string) {
        this.oauth2Client.setCredentials({
            refresh_token: refreshToken
        });
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        return credentials;
    }

    /**
     * Fetch all accounts for the authorized user.
     * Useful to let the user select which account represents this business.
     */
    async listAccounts(accessToken: string) {
        try {
            const response = await axios.get('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return response.data.accounts || [];
        } catch (error) {
            console.error('Error listing accounts:', error);
            throw error;
        }
    }

    /**
     * Fetch locations for a specific account.
     */
    async listLocations(accessToken: string, accountId: string) {
        try {
            // accountId format: "accounts/{accountId}"
            const response = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    readMask: 'name,title,storeCode,metadata'
                }
            });
            return response.data.locations || [];
        } catch (error) {
            console.error('Error listing locations:', error);
            throw error;
        }
    }

    /**
     * Fetch reviews for a specific location.
     * locationName format: "accounts/{accountId}/locations/{locationId}"
     */
    async listReviews(accessToken: string, locationName: string, pageToken?: string) {
         try {
            // Note: Reviews are fetched from mybusiness.googleapis.com v4 (legacy) or v1 (new)?
            // The new API is https://mybusiness.googleapis.com/v4/{name}/reviews
            // Wait, GBP API v1 has taken over. 
            // The API is `https://mybusiness.googleapis.com/v4/${locationName}/reviews`
            // Actually, for reviews, we should check api documentation.
            // Documentation says: GET https://mybusiness.googleapis.com/v4/{name=accounts/*/locations/*}/reviews
            
            const response = await axios.get(`https://mybusiness.googleapis.com/v4/${locationName}/reviews`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    pageSize: 50,
                    pageToken: pageToken
                }
            });
            return {
                reviews: response.data.reviews || [],
                nextPageToken: response.data.nextPageToken
            };
        } catch (error) {
            console.error('Error listing reviews:', error);
            throw error; // Handle or rethrow
        }
    }
}

export const googleReviewsService = new GoogleReviewsService();
