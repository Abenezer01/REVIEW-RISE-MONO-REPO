import { Request, Response } from 'express';
import { socialConnectionRepository } from '@platform/db';
import { z } from 'zod';
import { SocialConnection } from '@prisma/client';

export class SocialConnectionController {
    /**
     * List Connections
     * GET /api/v1/social/connections
     */
    async listConnections(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query;

            if (!businessId) {
                return res.status(400).json({ message: 'businessId is required' });
            }

            let connections;
            if (locationId) {
                connections = await socialConnectionRepository.findByLocationId(locationId as string);
                // Filter by businessId to be safe? Repo findByLocationId doesn't check businessId
                // but locations belong to businesses.
                // Optionally verify location belongs to business.
            } else {
                connections = await socialConnectionRepository.findByBusinessId(businessId as string);
            }

            // Mask tokens in response?
            // The repository decrypts them. We should probably NOT send access tokens to the frontend
            // unless strictly necessary (which it isn't for listing).

            const sanitized = connections.map((conn: SocialConnection) => {
                const { accessToken, refreshToken, ...rest } = conn;
                return rest;
            });

            res.json({ connections: sanitized });

        } catch (error: any) {
            console.error('Error listing connections:', error);
            res.status(500).json({ message: 'Failed to list connections' });
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
                return res.status(404).json({ message: 'Connection not found' });
            }

            // Mask tokens
            const { accessToken, refreshToken, ...rest } = connection;
            res.json({ connection: rest });

        } catch (error: any) {
            console.error('Error getting connection:', error);
            res.status(500).json({ message: 'Failed to get connection' });
        }
    }

    /**
     * Disconnect/Delete Connection
     * DELETE /api/v1/social/connections/:id
     */
    async disconnect(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Verify ownership? Middleware handles basic auth, but we should verify business access.
            // For now assuming internal trust or future middleware expansion.

            await socialConnectionRepository.delete(id);
            res.json({ success: true, message: 'Connection removed' });

        } catch (error: any) {
            console.error('Error disconnecting:', error);
            res.status(500).json({ message: 'Failed to disconnect' });
        }
    }

    /**
     * Manual Refresh (Debug/Force)
     * POST /api/v1/social/connections/:id/refresh
     */
    async refreshConnection(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // This would trigger logic to use the refresh token to get a new access token
            // We haven't implemented the service method to do this generically yet.
            // It would require delegating to FacebookService or LinkedInService based on platform.

            // Placeholder for now
            res.status(501).json({ message: 'Not implemented' });

        } catch (error: any) {
            console.error('Error refreshing connection:', error);
            res.status(500).json({ message: 'Failed to refresh connection' });
        }
    }
}

export const socialConnectionController = new SocialConnectionController();
