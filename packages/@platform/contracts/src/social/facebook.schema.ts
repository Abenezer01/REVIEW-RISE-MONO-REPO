import { z } from 'zod';
import type { SanitizedConnection } from './social-connection.schema';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Query parameters for getting Facebook OAuth URL
 * GET /api/v1/social/facebook/auth-url
 */
export const FacebookAuthUrlQuerySchema = z.object({
    businessId: z.string().uuid('businessId must be a valid UUID'),
    locationId: z.string().uuid('locationId must be a valid UUID').optional()
});

export type FacebookAuthUrlQuery = z.infer<typeof FacebookAuthUrlQuerySchema>;

/**
 * Body for Facebook OAuth callback
 * POST /api/v1/social/facebook/callback
 */
export const FacebookCallbackBodySchema = z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().min(1, 'State parameter is required')
});

export type FacebookCallbackBody = z.infer<typeof FacebookCallbackBodySchema>;

/**
 * Facebook Page object structure
 */
export const FacebookPageSchema = z.object({
    id: z.string(),
    name: z.string(),
    access_token: z.string(),
    category: z.string(),
    tasks: z.array(z.string())
});

export type FacebookPage = z.infer<typeof FacebookPageSchema>;

/**
 * Body for connecting a Facebook Page
 * POST /api/v1/social/facebook/connect
 */
export const FacebookConnectPageBodySchema = z.object({
    businessId: z.string().uuid('businessId must be a valid UUID'),
    locationId: z.string().uuid('locationId must be a valid UUID').nullable().optional(),
    page: FacebookPageSchema,
    userAccessToken: z.string().min(1, 'User access token is required')
});

export type FacebookConnectPageBody = z.infer<typeof FacebookConnectPageBodySchema>;

/**
 * Path parameters for getting Instagram accounts
 * GET /api/v1/social/facebook/pages/:pageId/instagram-accounts
 */
export const FacebookPageIdParamSchema = z.object({
    pageId: z.string().min(1, 'Page ID is required')
});

export type FacebookPageIdParam = z.infer<typeof FacebookPageIdParamSchema>;

/**
 * Body for connecting an Instagram account
 * POST /api/v1/social/instagram/connect
 */
export const FacebookInstagramConnectBodySchema = z.object({
    businessId: z.string().uuid('businessId must be a valid UUID'),
    locationId: z.string().uuid('locationId must be a valid UUID').nullable().optional(),
    igAccountId: z.string().min(1, 'Instagram account ID is required'),
    pageId: z.string().min(1, 'Page ID is required'),
    userAccessToken: z.string().min(1, 'User access token is required')
});

export type FacebookInstagramConnectBody = z.infer<typeof FacebookInstagramConnectBodySchema>;

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response for auth URL request
 */
export interface FacebookAuthUrlResponse {
    url: string;
}

/**
 * Response for OAuth callback
 */
export interface FacebookCallbackResponse {
    accessToken: string;
    expiresIn: number;
    state: string;
}

/**
 * Response for listing pages
 */
export interface FacebookPagesResponse {
    pages: FacebookPage[];
}

/**
 * Instagram Business Account
 */
export interface InstagramBusinessAccount {
    id: string;
    username?: string;
    name?: string;
}

/**
 * Response for Instagram accounts
 */
export interface FacebookInstagramAccountsResponse {
    instagramAccount: InstagramBusinessAccount | null;
}

/**
 * Response for connecting a page/account
 */
export interface FacebookConnectionResponse {
    connection: SanitizedConnection;
}
