import { Request, Response } from 'express';
import { facebookService } from '../services/facebook.service';
import {
    createSuccessResponse,
    createErrorResponse,
    ErrorCode
} from '@platform/contracts';

export class FacebookController {
    /**
     * Get OAuth URL
     * GET /api/v1/social/facebook/auth-url
     */
    async getAuthUrl(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query as any;

            // Encode state to pass business/location context
            const state = Buffer.from(JSON.stringify({
                businessId,
                locationId: locationId || null
            })).toString('base64');

            const url = facebookService.getAuthUrl(state);
            
            const response = createSuccessResponse(
                { url },
                'Facebook OAuth URL generated successfully',
                200,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in getAuthUrl:', error);
            const response = createErrorResponse(
                'Failed to generate OAuth URL',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Handle OAuth Callback
     * POST /api/v1/social/facebook/callback
     */
    async handleCallback(req: Request, res: Response) {
        try {
            const { code, state } = req.body;

            // Exchange code for short-lived token
            const tokens = await facebookService.exchangeCodeForToken(code);

            // Exchange for long-lived token
            const longLivedToken = await facebookService.getLongLivedUserToken(tokens.access_token);

            const response = createSuccessResponse(
                {
                    accessToken: longLivedToken.access_token,
                    expiresIn: longLivedToken.expires_in,
                    state
                },
                'Facebook authentication successful',
                200,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);

        } catch (error: any) {
            console.error('Error in handleCallback:', error);
            const response = createErrorResponse(
                'Failed to authenticate with Facebook',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * List Pages
     * GET /api/v1/social/facebook/pages
     */
    async listPages(req: Request, res: Response) {
        try {
            const accessToken = req.headers['x-fb-access-token'] as string;

            if (!accessToken) {
                const response = createErrorResponse(
                    'x-fb-access-token header is required',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                );
                return res.status(response.statusCode).json(response);
            }

            const pages = await facebookService.listPages(accessToken);
            
            const response = createSuccessResponse(
                { pages },
                'Facebook pages retrieved successfully',
                200,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in listPages:', error);
            const response = createErrorResponse(
                'Failed to list Facebook pages',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Connect Page
     * POST /api/v1/social/facebook/connect
     */
    async connectPage(req: Request, res: Response) {
        try {
            const { businessId, locationId, page, userAccessToken } = req.body;

            const connection = await facebookService.connectPage(
                businessId,
                locationId || null,
                page,
                userAccessToken
            );

            // Sanitize connection (remove tokens)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { accessToken, refreshToken, ...sanitized } = connection as any;

            const response = createSuccessResponse(
                { connection: sanitized },
                'Facebook page connected successfully',
                201,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in connectPage:', error);
            const response = createErrorResponse(
                'Failed to connect Facebook page',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Get Instagram Accounts linked to a Page
     * GET /api/v1/social/facebook/pages/:pageId/instagram-accounts
     */
    async getInstagramAccounts(req: Request, res: Response) {
        try {
            const { pageId } = req.params;
            const accessToken = req.headers['x-fb-page-access-token'] as string;

            if (!accessToken) {
                const response = createErrorResponse(
                    'x-fb-page-access-token header is required',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                );
                return res.status(response.statusCode).json(response);
            }

            const igAccount = await facebookService.getInstagramBusinessAccount(pageId, accessToken);

            const response = createSuccessResponse(
                { instagramAccount: igAccount },
                'Instagram accounts retrieved successfully',
                200,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in getInstagramAccounts:', error);
            const response = createErrorResponse(
                'Failed to get Instagram accounts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Connect Instagram Account
     * POST /api/v1/social/instagram/connect
     */
    async connectInstagram(req: Request, res: Response) {
        try {
            const { businessId, locationId, igAccountId, pageId, userAccessToken } = req.body;

            const connection = await facebookService.connectInstagram(
                businessId,
                locationId || null,
                igAccountId,
                pageId,
                userAccessToken
            );

            // Sanitize connection (remove tokens)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { accessToken, refreshToken, ...sanitized } = connection as any;

            const response = createSuccessResponse(
                { connection: sanitized },
                'Instagram account connected successfully',
                201,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);

        } catch (error: any) {
            console.error('Error in connectInstagram:', error);
            const response = createErrorResponse(
                'Failed to connect Instagram account',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }
}

export const facebookController = new FacebookController();
