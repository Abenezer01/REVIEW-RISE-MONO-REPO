import { Request, Response } from 'express';
import { socialConnectionRepository } from '@platform/db';
import {
    createSuccessResponse,
    createErrorResponse,
    ErrorCode
} from '@platform/contracts';

export class SocialConnectionController {
    /**
     * List Connections
     * GET /api/v1/social/connections
     */
    async listConnections(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query as any;

            let connections;
            if (locationId) {
                connections = await socialConnectionRepository.findByLocationId(locationId);
            } else {
                connections = await socialConnectionRepository.findByBusinessId(businessId);
            }

            // Sanitize connections (remove tokens)
            const sanitized = connections.map((conn: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { accessToken, refreshToken, ...rest } = conn;
                return rest;
            });

            res.json(createSuccessResponse(
                { connections: sanitized },
                'Connections retrieved successfully',
                200,
                { requestId: req.id }
            ));

        } catch (error: any) {
            console.error('Error listing connections:', error);
            res.status(500).json(createErrorResponse(
                'Failed to list connections',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
        }
    }

    /**
     * Get Single Connection
     * GET /api/v1/social/connections/:id
     */
    async getConnection(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const connection = await socialConnectionRepository.findById(id);

            if (!connection) {
                return res.status(404).json(createErrorResponse(
                    'Connection not found',
                    ErrorCode.NOT_FOUND,
                    404,
                    undefined,
                    req.id
                ));
            }

            // Sanitize connection (remove tokens)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { accessToken, refreshToken, ...rest } = connection;
            
            res.json(createSuccessResponse(
                { connection: rest },
                'Connection retrieved successfully',
                200,
                { requestId: req.id }
            ));

        } catch (error: any) {
            console.error('Error getting connection:', error);
            res.status(500).json(createErrorResponse(
                'Failed to get connection',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
        }
    }

    /**
     * Disconnect/Delete Connection
     * DELETE /api/v1/social/connections/:id
     */
    async disconnect(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await socialConnectionRepository.delete(id);
            
            res.json(createSuccessResponse(
                { success: true, message: 'Connection removed' },
                'Connection deleted successfully',
                200,
                { requestId: req.id }
            ));

        } catch (error: any) {
            console.error('Error disconnecting:', error);
            res.status(500).json(createErrorResponse(
                'Failed to disconnect',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
        }
    }

    /**
     * Manual Refresh (Debug/Force)
     * POST /api/v1/social/connections/:id/refresh
     */
    async refreshConnection(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Fetch connection
            const connection = await socialConnectionRepository.findByIdWithDecryption(id);

            if (!connection) {
                return res.status(404).json(createErrorResponse(
                    'Connection not found',
                    ErrorCode.NOT_FOUND,
                    404,
                    undefined,
                    req.id
                ));
            }

            // Check if we have a refresh token
            if (!connection.refreshToken && connection.platform !== 'facebook') {
                return res.status(400).json(createErrorResponse(
                    'No refresh token available. Please reconnect the account.',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                ));
            }

            let newAccessToken: string;
            let newRefreshToken: string | undefined;
            let newExpiry: Date;

            // Refresh based on platform
            switch (connection.platform) {
                case 'facebook':
                case 'instagram': {
                    // For Facebook/Instagram, use the user token (refreshToken) to get new page token
                    const { facebookService } = await import('../services/facebook.service');
                    
                    if (!connection.pageId || !connection.refreshToken) {
                        return res.status(400).json(createErrorResponse(
                            'Missing required data for Facebook refresh',
                            ErrorCode.BAD_REQUEST,
                            400,
                            undefined,
                            req.id
                        ));
                    }

                    newAccessToken = await facebookService.refreshPageToken(
                        connection.pageId,
                        connection.refreshToken
                    );
                    newRefreshToken = connection.refreshToken; // User token stays the same
                    newExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
                    break;
                }

                case 'linkedin': {
                    const { linkedInService } = await import('../services/linkedin.service');
                    
                    if (!connection.refreshToken) {
                        return res.status(400).json(createErrorResponse(
                            'No refresh token available for LinkedIn. Please reconnect.',
                            ErrorCode.BAD_REQUEST,
                            400,
                            undefined,
                            req.id
                        ));
                    }

                    const tokenResponse = await linkedInService.refreshAccessToken(connection.refreshToken);
                    newAccessToken = tokenResponse.access_token;
                    newRefreshToken = tokenResponse.refresh_token || connection.refreshToken;
                    newExpiry = new Date(Date.now() + (tokenResponse.expires_in || 5184000) * 1000);
                    break;
                }

                default: {
                    return res.status(400).json(createErrorResponse(
                        `Token refresh not supported for platform: ${connection.platform}`,
                        ErrorCode.BAD_REQUEST,
                        400,
                        undefined,
                        req.id
                    ));
                }
            }

            // Update tokens in database
            const updated = await socialConnectionRepository.updateTokens(id, {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                tokenExpiry: newExpiry
            });

            res.json(createSuccessResponse(
                {
                    success: true,
                    message: 'Token refreshed successfully',
                    connection: {
                        id: updated.id,
                        platform: updated.platform,
                        status: updated.status,
                        tokenExpiry: updated.tokenExpiry
                    }
                },
                'Token refreshed successfully',
                200,
                { requestId: req.id }
            ));

        } catch (error: any) {
            console.error('Error refreshing connection:', error);
            
            // Update status to error
            if (req.params.id) {
                await socialConnectionRepository.updateStatus(
                    req.params.id,
                    'error',
                    error.message || 'Failed to refresh token'
                );
            }

            res.status(500).json(createErrorResponse(
                'Failed to refresh connection',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                { error: error.message },
                req.id
            ));
        }
    }
}

export const socialConnectionController = new SocialConnectionController();
