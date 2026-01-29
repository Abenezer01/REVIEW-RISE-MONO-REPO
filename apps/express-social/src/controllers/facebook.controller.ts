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
            
            res.json(createSuccessResponse(
                { url },
                'Facebook OAuth URL generated successfully',
                200,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error in getAuthUrl:', error);
            res.status(500).json(createErrorResponse(
                'Failed to generate OAuth URL',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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

            res.json(createSuccessResponse(
                {
                    accessToken: longLivedToken.access_token,
                    expiresIn: longLivedToken.expires_in,
                    state
                },
                'Facebook authentication successful',
                200,
                { requestId: req.id }
            ));

        } catch (error: any) {
            console.error('Error in handleCallback:', error);
            res.status(500).json(createErrorResponse(
                'Failed to authenticate with Facebook',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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
                return res.status(400).json(createErrorResponse(
                    'x-fb-access-token header is required',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                ));
            }

            const pages = await facebookService.listPages(accessToken);
            
            res.json(createSuccessResponse(
                { pages },
                'Facebook pages retrieved successfully',
                200,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error in listPages:', error);
            res.status(500).json(createErrorResponse(
                'Failed to list Facebook pages',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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

            res.status(201).json(createSuccessResponse(
                { connection: sanitized },
                'Facebook page connected successfully',
                201,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error in connectPage:', error);
            res.status(500).json(createErrorResponse(
                'Failed to connect Facebook page',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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
                return res.status(400).json(createErrorResponse(
                    'x-fb-page-access-token header is required',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                ));
            }

            const igAccount = await facebookService.getInstagramBusinessAccount(pageId, accessToken);

            res.json(createSuccessResponse(
                { instagramAccount: igAccount },
                'Instagram accounts retrieved successfully',
                200,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error in getInstagramAccounts:', error);
            res.status(500).json(createErrorResponse(
                'Failed to get Instagram accounts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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

            res.status(201).json(createSuccessResponse(
                { connection: sanitized },
                'Instagram account connected successfully',
                201,
                { requestId: req.id }
            ));

        } catch (error: any) {
            console.error('Error in connectInstagram:', error);
            res.status(500).json(createErrorResponse(
                'Failed to connect Instagram account',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
        }
    }
}

export const facebookController = new FacebookController();
