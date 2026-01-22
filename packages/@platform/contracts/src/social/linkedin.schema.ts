import { z } from 'zod';
import type { SanitizedConnection } from './social-connection.schema';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Query parameters for getting LinkedIn OAuth URL
 * GET /api/v1/social/linkedin/auth-url
 */
export const LinkedInAuthUrlQuerySchema = z.object({
    businessId: z.string().uuid('businessId must be a valid UUID'),
    locationId: z.string().uuid('locationId must be a valid UUID').optional()
});

export type LinkedInAuthUrlQuery = z.infer<typeof LinkedInAuthUrlQuerySchema>;

/**
 * Body for LinkedIn OAuth callback
 * POST /api/v1/social/linkedin/callback
 */
export const LinkedInCallbackBodySchema = z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().min(1, 'State parameter is required')
});

export type LinkedInCallbackBody = z.infer<typeof LinkedInCallbackBodySchema>;

/**
 * LinkedIn token data structure
 */
export const LinkedInTokenDataSchema = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    scope: z.string().optional(),
    refresh_token: z.string().optional()
});

export type LinkedInTokenData = z.infer<typeof LinkedInTokenDataSchema>;

/**
 * Body for connecting a LinkedIn organization
 * POST /api/v1/social/linkedin/connect
 */
export const LinkedInConnectOrgBodySchema = z.object({
    businessId: z.string().uuid('businessId must be a valid UUID'),
    locationId: z.string().uuid('locationId must be a valid UUID').nullable().optional(),
    organization: z.object({
        id: z.string(),
        localizedName: z.string(),
        vanityName: z.string(),
        logoUrl: z.string().optional()
    }),
    tokenData: LinkedInTokenDataSchema
});

export type LinkedInConnectOrgBody = z.infer<typeof LinkedInConnectOrgBodySchema>;

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response for auth URL request
 */
export interface LinkedInAuthUrlResponse {
    url: string;
}

/**
 * LinkedIn organization structure
 */
export interface LinkedInOrganization {
    id: string;
    localizedName: string;
    vanityName: string;
    logoUrl?: string;
}

/**
 * Response for listing organizations
 */
export interface LinkedInOrganizationsResponse {
    organizations: LinkedInOrganization[];
}

/**
 * Response for connecting an organization
 */
export interface LinkedInConnectionResponse {
    connection: SanitizedConnection;
}
