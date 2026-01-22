import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Query parameters for listing connections
 * GET /api/v1/social/connections
 */
export const ListConnectionsQuerySchema = z.object({
    businessId: z.string().uuid('businessId must be a valid UUID'),
    locationId: z.string().uuid('locationId must be a valid UUID').optional()
});

export type ListConnectionsQuery = z.infer<typeof ListConnectionsQuerySchema>;

/**
 * Path parameters for connection operations
 * GET/DELETE/POST /api/v1/social/connections/:id
 */
export const ConnectionIdParamSchema = z.object({
    id: z.string().uuid('Connection ID must be a valid UUID')
});

export type ConnectionIdParam = z.infer<typeof ConnectionIdParamSchema>;

// ============================================================================
// Response Types
// ============================================================================

/**
 * Sanitized connection DTO (without sensitive tokens)
 */
export interface SanitizedConnection {
    id: string;
    businessId: string;
    locationId: string | null;
    platform: string;
    pageId: string;
    pageName: string;
    tokenExpiry: Date | string;
    scopes: string[];
    status: string;
    lastError: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Response for listing connections
 */
export interface ListConnectionsResponse {
    connections: SanitizedConnection[];
}

/**
 * Response for getting a single connection
 */
export interface GetConnectionResponse {
    connection: SanitizedConnection;
}

/**
 * Response for deleting a connection
 */
export interface DeleteConnectionResponse {
    success: boolean;
    message: string;
}

/**
 * Response for refreshing a connection
 */
export interface RefreshConnectionResponse {
    success: boolean;
    message: string;
    connection: {
        id: string;
        platform: string;
        status: string;
        tokenExpiry: Date | string;
    };
}
