import { Request, Response } from 'express';
import { facebookService } from '../services/facebook.service';
import {
    FacebookAuthUrlQuerySchema,
    FacebookCallbackBodySchema,
    FacebookConnectPageBodySchema,
    FacebookPageIdParamSchema,
    FacebookInstagramConnectBodySchema,
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
            // Validate query parameters
            const parseResult = FacebookAuthUrlQuerySchema.safeParse(req.query);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid query parameters',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues
                );
                return res.status(400).json(response);
            }

            const { businessId, locationId } = parseResult.data;

            // Encode state to pass business/location context
            const state = Buffer.from(JSON.stringify({
                businessId,
                locationId: locationId || null
            })).toString('base64');

            const url = facebookService.getAuthUrl(state);
            
            const response = createSuccessResponse(
                { url },
                'Facebook OAuth URL generated successfully'
            );
            res.json(response);
        } catch (error: any) {
            console.error('Error in getAuthUrl:', error);
            const response = createErrorResponse(
                'Failed to generate OAuth URL',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500
            );
            res.status(500).json(response);
        }
    }

    /**
     * Handle OAuth Callback
     * POST /api/v1/social/facebook/callback
     */
    async handleCallback(req: Request, res: Response) {
        try {
            const parseResult = FacebookCallbackBodySchema.safeParse(req.body);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid request body',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues
                );
                return res.status(400).json(response);
            }

            const { code, state } = parseResult.data;

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
                'Facebook authentication successful'
            );
            res.json(response);

        } catch (error: any) {
            console.error('Error in handleCallback:', error);
            const response = createErrorResponse(
                'Failed to authenticate with Facebook',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500
            );
            res.status(500).json(response);
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
                    400
                );
                return res.status(400).json(response);
            }

            const pages = await facebookService.listPages(accessToken);
            
            const response = createSuccessResponse(
                { pages },
                'Facebook pages retrieved successfully'
            );
            res.json(response);
        } catch (error: any) {
            console.error('Error in listPages:', error);
            const response = createErrorResponse(
                'Failed to list Facebook pages',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500
            );
            res.status(500).json(response);
        }
    }

    /**
     * Connect Page
     * POST /api/v1/social/facebook/connect
     */
    async connectPage(req: Request, res: Response) {
        try {
            const parseResult = FacebookConnectPageBodySchema.safeParse(req.body);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid request body',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues
                );
                return res.status(400).json(response);
            }

            const { businessId, locationId, page, userAccessToken } = parseResult.data;

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
                201
            );
            res.status(201).json(response);
        } catch (error: any) {
            console.error('Error in connectPage:', error);
            const response = createErrorResponse(
                'Failed to connect Facebook page',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500
            );
            res.status(500).json(response);
        }
    }

    /**
     * Get Instagram Accounts linked to a Page
     * GET /api/v1/social/facebook/pages/:pageId/instagram-accounts
     */
    async getInstagramAccounts(req: Request, res: Response) {
        try {
            const paramResult = FacebookPageIdParamSchema.safeParse(req.params);
            if (!paramResult.success) {
                const response = createErrorResponse(
                    'Invalid page ID',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    paramResult.error.issues
                );
                return res.status(400).json(response);
            }

            const { pageId } = paramResult.data;
            const accessToken = req.headers['x-fb-page-access-token'] as string;

            if (!accessToken) {
                const response = createErrorResponse(
                    'x-fb-page-access-token header is required',
                    ErrorCode.BAD_REQUEST,
                    400
                );
                return res.status(400).json(response);
            }

            const igAccount = await facebookService.getInstagramBusinessAccount(pageId, accessToken);

            const response = createSuccessResponse(
                { instagramAccount: igAccount },
                'Instagram accounts retrieved successfully'
            );
            res.json(response);
        } catch (error: any) {
            console.error('Error in getInstagramAccounts:', error);
            const response = createErrorResponse(
                'Failed to get Instagram accounts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500
            );
            res.status(500).json(response);
        }
    }

    /**
     * Connect Instagram Account
     * POST /api/v1/social/instagram/connect
     */
    async connectInstagram(req: Request, res: Response) {
        try {
            const parseResult = FacebookInstagramConnectBodySchema.safeParse(req.body);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid request body',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues
                );
                return res.status(400).json(response);
            }

            const { businessId, locationId, igAccountId, pageId, userAccessToken } = parseResult.data;

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
                201
            );
            res.status(201).json(response);

        } catch (error: any) {
            console.error('Error in connectInstagram:', error);
            const response = createErrorResponse(
                'Failed to connect Instagram account',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500
            );
            res.status(500).json(response);
        }
    }
}

export const facebookController = new FacebookController();
