import axios from 'axios';
import { socialConnectionRepository } from '@platform/db';
import { LINKEDIN_API } from '../config/external-apis.config';

// Defined based on LinkedIn API docs
interface LinkedInTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    refresh_token?: string; // If requested with r_offline_access? LinkedIn V2 mostly uses access_token
    refresh_token_expires_in?: number;
}

interface LinkedInOrganization {
    id: string; // "urn:li:organization:12345" or just "12345"
    localizedName: string;
    vanityName: string;
    logoV2?: any;
    // ...
}

export class LinkedInService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor() {
        this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
        this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
        this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || '';

        if (!this.clientId || !this.clientSecret) {
            console.warn('LinkedIn OAuth credentials missing');
        }
    }

    /**
     * Generate OAuth URL
     */
    getAuthUrl(state: string): string {
        const scopes = [
            'openid',
            'profile',
            'email',
            'w_member_social', // Posting on personal profile
            'r_organization_social', // Reading org posts
            'w_organization_social', // Posting to org
            // 'rw_organization_admin' // Admin
        ];

        return `${LINKEDIN_API.AUTHORIZATION_URL}?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}&scope=${scopes.join(' ')}`;
    }

    /**
     * Exchange code for token
     */
    async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', this.redirectUri);
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);

            const response = await axios.post(LINKEDIN_API.ACCESS_TOKEN_URL, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Error exchanging LinkedIn code:', error.response?.data || error.message);
            throw new Error('Failed to exchange LinkedIn code');
        }
    }

    /**
     * List Organizations user is admin of
     */
    async listOrganizations(accessToken: string): Promise<LinkedInOrganization[]> {
        try {
            // First get the user's organizational entity acls to find orgs they manage
            const aclsResponse = await axios.get(`${LINKEDIN_API.API_BASE_URL}/organizationalEntityAcls`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    q: 'roleAssignee',
                    role: 'ADMINISTRATOR',
                    state: 'APPROVED',
                    projection: '(elements*(*,organization~(localizedName,vanityName,logoV2(original~:playableStreams))))'
                }
            });

            // Parse response to extract organization details
            const orgs = aclsResponse.data.elements.map((el: any) => {
                const org = el.organization;
                // org ID comes as "urn:li:organization:12345"
                // const id = el.organizationUrn || `urn:li:organization:${el.organization.id}`; // It varies based on projection
                // Actually with projection `organization~` the object inside is the org details.
                // The URN is commonly in `organizationUrn` field of the element if not projected.

                // Let's simplify and mapping
                return {
                    id: el.organizationUrn, // e.g. urn:li:organization:2414183
                    localizedName: org.localizedName,
                    vanityName: org.vanityName,
                    logoUrl: org.logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier
                };
            });

            return orgs;

        } catch (error: any) {
            console.error('Error listing LinkedIn orgs:', error.response?.data || error.message);
            throw new Error('Failed to list LinkedIn organizations');
        }
    }

    /**
     * Connect LinkedIn Organization
     */
    async connectOrganization(
        businessId: string,
        locationId: string | null,
        org: any,
        tokenResponse: LinkedInTokenResponse
    ) {
        // Check for existing connection
        const existing = await socialConnectionRepository.findByUnique(
            businessId,
            locationId,
            'linkedin',
            org.id
        );

        // Calculate expiry
        const expiresIn = tokenResponse.expires_in || 5184000; // 60 days default
        const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

        const data = {
            businessId,
            locationId: locationId || undefined,
            platform: 'linkedin',
            pageId: org.id,
            pageName: org.localizedName,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token, // Might be undefined
            tokenExpiry: tokenExpiry,
            scopes: ['w_organization_social', 'r_organization_social'],
            status: 'active'
        };

        if (existing) {
            return await socialConnectionRepository.updateTokens(existing.id, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                tokenExpiry: data.tokenExpiry
            });
        } else {
            return await socialConnectionRepository.createWithEncryption(data);
        }
    }
    /**
     * Refresh Access Token
     * Note: LinkedIn v2 OAuth may not always provide refresh tokens.
     * This method attempts to use a refresh token if available.
     */
    async refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken);
            params.append('client_id', this.clientId);
            params.append('client_secret', this.clientSecret);

            const response = await axios.post(LINKEDIN_API.ACCESS_TOKEN_URL, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Error refreshing LinkedIn token:', error.response?.data || error.message);
            throw new Error('Failed to refresh LinkedIn access token');
        }
    }
}

export const linkedInService = new LinkedInService();
