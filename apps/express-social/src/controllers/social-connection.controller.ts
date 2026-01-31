import { Request, Response } from 'express';
import { socialConnectionRepository } from '@platform/db';
import {
    createSuccessResponse,
    createErrorResponse,
    ErrorCode
} from '@platform/contracts';

export class SocialConnectionController {

    /**
     * List all active connections for a business/location
     * GET /api/v1/social/connections
     */
    async listConnections(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query as any;

            if (!businessId) {
                const errorResponse = createErrorResponse('businessId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
                return res.status(errorResponse.statusCode).json(errorResponse);
            }

            const connections = await socialConnectionRepository.findByBusiness(businessId, locationId);

            // Sanitize (don't return tokens)
            const sanitized = connections.map(conn => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { accessToken, refreshToken, ...rest } = conn as any;
                return rest;
            });

            const successResponse = createSuccessResponse(
                { connections: sanitized },
                'Connections retrieved successfully',
                200,
                { requestId: req.id }
            );
            res.status(successResponse.statusCode).json(successResponse);

        } catch (error: any) {
            console.error('Error listing connections:', error);
            const errorResponse = createErrorResponse(
                'Failed to list connections',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    }

    /**
     * Disconnect/Delete a connection
     * DELETE /api/v1/social/connections/:id
     */
    async disconnect(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await socialConnectionRepository.delete(id);

            const successResponse = createSuccessResponse(
                { success: true, message: 'Connection removed' },
                'Connection deleted successfully',
                200,
                { requestId: req.id }
            );
            res.status(successResponse.statusCode).json(successResponse);

        } catch (error: any) {
            console.error('Error disconnecting:', error);
            const errorResponse = createErrorResponse(
                'Failed to disconnect',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(errorResponse.statusCode).json(errorResponse);
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
                const errorResponse = createErrorResponse(
                    'Connection not found',
                    ErrorCode.NOT_FOUND,
                    404,
                    undefined,
                    req.id
                );
                return res.status(errorResponse.statusCode).json(errorResponse);
            }

            // Check if we have a refresh token
            if (!connection.refreshToken && connection.platform !== 'facebook') {
                const errorResponse = createErrorResponse(
                    'No refresh token available. Please reconnect the account.',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                );
                return res.status(errorResponse.statusCode).json(errorResponse);
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
                        const errorResponse = createErrorResponse(
                            'Missing required data for Facebook refresh',
                            ErrorCode.BAD_REQUEST,
                            400,
                            undefined,
                            req.id
                        );
                        return res.status(errorResponse.statusCode).json(errorResponse);
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
                        const errorResponse = createErrorResponse(
                            'No refresh token available for LinkedIn. Please reconnect.',
                            ErrorCode.BAD_REQUEST,
                            400,
                            undefined,
                            req.id
                        );
                        return res.status(errorResponse.statusCode).json(errorResponse);
                    }

                    const tokenResponse = await linkedInService.refreshAccessToken(connection.refreshToken);
                    newAccessToken = tokenResponse.access_token;
                    newRefreshToken = tokenResponse.refresh_token || connection.refreshToken;
                    newExpiry = new Date(Date.now() + (tokenResponse.expires_in || 5184000) * 1000);
                    break;
                }

                default: {
                    const errorResponse = createErrorResponse(
                        `Token refresh not supported for platform: ${connection.platform}`,
                        ErrorCode.BAD_REQUEST,
                        400,
                        undefined,
                        req.id
                    );
                    return res.status(errorResponse.statusCode).json(errorResponse);
                }
            }

            // Update tokens in database
            const updated = await socialConnectionRepository.updateTokens(id, {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                tokenExpiry: newExpiry
            });

            const successResponse = createSuccessResponse(
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
            );
            res.status(successResponse.statusCode).json(successResponse);

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

            const errorResponse = createErrorResponse(
                'Failed to refresh connection',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                { error: error.message },
                req.id
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    }
}

export const socialConnectionController = new SocialConnectionController();
