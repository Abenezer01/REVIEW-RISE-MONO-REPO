import axios from 'axios';
import { socialConnectionRepository } from '@platform/db';
import { FACEBOOK_API } from '../config/external-apis.config';

interface FacebookTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
    category: string;
    tasks: string[];
}

export class FacebookService {
    private readonly appId: string;
    private readonly appSecret: string;
    private readonly redirectUri: string;

    constructor() {
        this.appId = process.env.FACEBOOK_APP_ID || '';
        this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
        this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || '';

        if (!this.appId || !this.appSecret) {
            console.warn('Facebook OAuth credentials missing');
        }
    }

    /**
     * Generate OAuth URL for Facebook Login
     */
    getAuthUrl(state: string): string {
        const scopes = [
            'public_profile',
            'email',
            'pages_show_list',
            'pages_read_engagement',
            'pages_manage_posts',
            'pages_manage_metadata',
            'instagram_basic',
            'instagram_manage_comments',
            'instagram_manage_insights',
            'business_management'
        ];

        return `${FACEBOOK_API.OAUTH_DIALOG_URL}?client_id=${this.appId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}&scope=${scopes.join(',')}&response_type=code`;
    }

    /**
     * Exchange authorization code for user access token
     */
    async exchangeCodeForToken(code: string): Promise<FacebookTokenResponse> {
        try {
            const response = await axios.get(`${FACEBOOK_API.GRAPH_API_URL}/oauth/access_token`, {
                params: {
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    redirect_uri: this.redirectUri,
                    code,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Error exchanging code for token:', error.response?.data || error.message);
            throw new Error('Failed to exchange authorization code');
        }
    }

    /**
     * Get long-lived user access token
     */
    async getLongLivedUserToken(shortLivedToken: string): Promise<FacebookTokenResponse> {
        try {
            const response = await axios.get(`${FACEBOOK_API.GRAPH_API_URL}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: this.appId,
                    client_secret: this.appSecret,
                    fb_exchange_token: shortLivedToken,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Error getting long-lived token:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * List pages user manages
     */
    async listPages(userAccessToken: string): Promise<FacebookPage[]> {
        try {
            const response = await axios.get(`${FACEBOOK_API.GRAPH_API_URL}/me/accounts`, {
                params: {
                    access_token: userAccessToken,
                    fields: 'id,name,access_token,category,tasks',
                    limit: 100,
                },
            });

            return response.data.data || [];
        } catch (error: any) {
            console.error('Error listing pages:', error.response?.data || error.message);
            throw new Error('Failed to list Facebook pages');
        }
    }

    /**
     * Get Instagram Business Account connected to a Facebook Page
     */
    async getInstagramBusinessAccount(pageId: string, pageAccessToken: string) {
        try {
            const response = await axios.get(`${FACEBOOK_API.GRAPH_API_URL}/${pageId}`, {
                params: {
                    access_token: pageAccessToken,
                    fields: 'instagram_business_account',
                },
            });

            return response.data.instagram_business_account; // { id: "..." } or undefined
        } catch (error: any) {
            console.error(`Error getting IG account for page ${pageId}:`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Connect a Facebook Page
     */
    async connectPage(
        businessId: string,
        locationId: string | null,
        page: FacebookPage,
        userAccessToken: string
    ) {
        // We typically store the User Access Token AND the Page Access Token?
        // Actually, for page management, we need the Page Access Token.
        // But for refreshing, we might need the long-lived User Access Token.
        // Let's store the Page Access Token for the specific connection.

        // Ensure tokens are long-lived if possible before storing?
        // The token returned in `listPages` is a Page Access Token.
        // It generally doesn't expire if the User Token is long-lived, but we should verify.

        // Check for existing connection
        const existing = await socialConnectionRepository.findByUnique(
            businessId,
            locationId,
            'facebook',
            page.id
        );

        const data = {
            businessId,
            locationId: locationId || undefined,
            platform: 'facebook',
            pageId: page.id,
            pageName: page.name,
            accessToken: page.access_token, // This should be encrypted by the repo
            refreshToken: userAccessToken, // Storing user token as "refresh token" concept (it's used to get new page tokens)
            // Page tokens don't usually have expiry if generated from long-lived user token, 
            // but we can set a safe default or parse debug_token if needed.
            tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // ~60 days default for long-lived
            scopes: ['manage_pages', 'publish_pages'], // Simplified
            status: 'active'
        };

        if (existing) {
            return await socialConnectionRepository.updateTokens(existing.id, {
                accessToken: page.access_token,
                refreshToken: userAccessToken,
                tokenExpiry: data.tokenExpiry
            });
        } else {
            return await socialConnectionRepository.createWithEncryption(data);
        }
    }

    /**
     * Connect an Instagram Business Account
     */
    async connectInstagram(
        businessId: string,
        locationId: string | null,
        igAccountId: string,
        pageId: string,
        userAccessToken: string
    ) {
        // Need to get details about the IG account
        try {
            // We need page access token to query IG details broadly, but user token works for some basic info if linked
            // First get the page token again or use user token
            // Let's assume we use user token to fetch IG details
            const response = await axios.get(`${FACEBOOK_API.GRAPH_API_URL}/${igAccountId}`, {
                params: {
                    access_token: userAccessToken,
                    fields: 'username,name,profile_picture_url',
                },
            });

            const igData = response.data;

            const existing = await socialConnectionRepository.findByUnique(
                businessId,
                locationId,
                'instagram',
                igAccountId
            );

            const data = {
                businessId,
                locationId: locationId || undefined,
                platform: 'instagram',
                pageId: pageId, // Linked FB Page ID
                profileId: igAccountId,
                pageName: igData.username || igData.name,
                accessToken: userAccessToken, // IG Graph API uses User Access Token (with pages_show_list etc)
                refreshToken: userAccessToken,
                tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                scopes: ['instagram_basic', 'instagram_manage_comments'],
                status: 'active'
            };

            if (existing) {
                return await socialConnectionRepository.updateTokens(existing.id, {
                    accessToken: userAccessToken,
                    refreshToken: userAccessToken,
                    tokenExpiry: data.tokenExpiry
                });
            } else {
                return await socialConnectionRepository.createWithEncryption(data);
            }

        } catch (error: any) {
            console.error('Error connecting Instagram:', error.response?.data || error.message);
            throw error;
        }
    }
    /**
     * Refresh Page Access Token
     * Uses the long-lived user token (stored as refreshToken) to get a fresh page token
     */
    async refreshPageToken(pageId: string, userAccessToken: string): Promise<string> {
        try {
            // Get fresh page access token using user token
            const response = await axios.get(`${FACEBOOK_API.GRAPH_API_URL}/${pageId}`, {
                params: {
                    access_token: userAccessToken,
                    fields: 'access_token'
                }
            });

            return response.data.access_token;
        } catch (error: any) {
            console.error('Error refreshing page token:', error.response?.data || error.message);
            throw new Error('Failed to refresh Facebook page token');
        }
    }
}

export const facebookService = new FacebookService();
