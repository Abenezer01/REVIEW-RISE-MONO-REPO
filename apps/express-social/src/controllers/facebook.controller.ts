import { Request, Response } from 'express';
import { facebookService } from '../services/facebook.service';
import { z } from 'zod';

export class FacebookController {
    /**
     * Get OAuth URL
     * GET /api/v1/social/facebook/auth-url
     */
    async getAuthUrl(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query;

            if (!businessId) {
                return res.status(400).json({ message: 'businessId is required' });
            }

            // Encode state to pass business/location context context
            const state = Buffer.from(JSON.stringify({
                businessId,
                locationId: locationId || null
            })).toString('base64');

            const url = facebookService.getAuthUrl(state);
            res.json({ url });
        } catch (error: any) {
            console.error('Error in getAuthUrl:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Handle OAuth Callback
     * POST /api/v1/social/facebook/callback
     */
    async handleCallback(req: Request, res: Response) {
        try {
            const schema = z.object({
                code: z.string(),
                state: z.string()
            });

            const parseResult = schema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ message: 'Invalid request body', errors: parseResult.error.issues });
            }

            const { code, state } = parseResult.data;

            // Exchange code for short-lived token
            const tokens = await facebookService.exchangeCodeForToken(code);

            // Exchange for long-lived token
            // TODO: Optimize if tokens are already long-lived or check response
            const longLivedToken = await facebookService.getLongLivedUserToken(tokens.access_token);

            // Decode state to get context
            // Note: we're not automatically connecting yet, the frontend will call listPages next
            // But we need to return the token to the frontend so it can call listPages
            // Or we can return a temporary session ID.
            // For simplicity, we'll return the user access token to the frontend (SSL required!)
            // Ideally we'd store it in a temp session, but we'll send it back for the immediate "select page" step.

            res.json({
                accessToken: longLivedToken.access_token,
                expiresIn: longLivedToken.expires_in,
                state
            });

        } catch (error: any) {
            console.error('Error in handleCallback:', error);
            res.status(500).json({ message: 'Failed to authenticate with Facebook' });
        }
    }

    /**
     * List Pages
     * GET /api/v1/social/facebook/pages
     */
    async listPages(req: Request, res: Response) {
        try {
            // Token passed in Authorization header or query param for this temp step?
            // Since this is a specialized flow where we haven't stored the token in DB yet,
            // we expect the frontend to pass the accessToken it got from callback.
            // CAUTION: passing FB access token in header.

            const accessToken = req.headers['x-fb-access-token'] as string;

            if (!accessToken) {
                return res.status(400).json({ message: 'x-fb-access-token header required' });
            }

            const pages = await facebookService.listPages(accessToken);
            res.json({ pages });
        } catch (error: any) {
            console.error('Error in listPages:', error);
            res.status(500).json({ message: 'Failed to list pages' });
        }
    }

    /**
     * Connect Page
     * POST /api/v1/social/facebook/connect
     */
    async connectPage(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                locationId: z.string().uuid().nullable().optional(),
                page: z.object({
                    id: z.string(),
                    name: z.string(),
                    access_token: z.string(),
                    category: z.string(),
                    tasks: z.array(z.string()) // Assuming tasks is array of strings
                }),
                userAccessToken: z.string()
            });

            const parseResult = schema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ message: 'Invalid request body', errors: parseResult.error.issues });
            }

            const { businessId, locationId, page, userAccessToken } = parseResult.data;

            const connection = await facebookService.connectPage(
                businessId,
                locationId || null,
                page,
                userAccessToken
            );

            res.json({ connection });
        } catch (error: any) {
            console.error('Error in connectPage:', error);
            res.status(500).json({ message: 'Failed to connect page' });
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
            // OR use user access token

            if (!accessToken) {
                return res.status(400).json({ message: 'x-fb-page-access-token header or user token required' });
            }

            // In the frontend flow, we might pass the page access token we just selected
            const igAccount = await facebookService.getInstagramBusinessAccount(pageId, accessToken);

            res.json({ instagramAccount: igAccount }); // Can be null
        } catch (error: any) {
            console.error('Error in getInstagramAccounts:', error);
            res.status(500).json({ message: 'Failed to get Instagram accounts' });
        }
    }

    /**
     * Connect Instagram Account
     * POST /api/v1/social/instagram/connect
     */
    async connectInstagram(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                locationId: z.string().uuid().nullable().optional(),
                igAccountId: z.string(),
                pageId: z.string(),
                userAccessToken: z.string()
            });

            const parseResult = schema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ message: 'Invalid request body', errors: parseResult.error.issues });
            }

            const { businessId, locationId, igAccountId, pageId, userAccessToken } = parseResult.data;

            const connection = await facebookService.connectInstagram(
                businessId,
                locationId || null,
                igAccountId,
                pageId,
                userAccessToken
            );

            res.json({ connection });

        } catch (error: any) {
            console.error('Error in connectInstagram:', error);
            res.status(500).json({ message: 'Failed to connect Instagram account' });
        }
    }
}

export const facebookController = new FacebookController();
