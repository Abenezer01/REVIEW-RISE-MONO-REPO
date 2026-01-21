import { Request, Response } from 'express';
import { linkedInService } from '../services/linkedin.service';
import { z } from 'zod';

export class LinkedInController {

    /**
     * Get Auth URL
     * GET /api/v1/social/linkedin/auth-url
     */
    async getAuthUrl(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query;
            if (!businessId) {
                return res.status(400).json({ message: 'businessId is required' });
            }

            const state = Buffer.from(JSON.stringify({
                businessId,
                locationId: locationId || null
            })).toString('base64');

            const url = linkedInService.getAuthUrl(state);
            res.json({ url });
        } catch (error: any) {
            console.error('Error in CI getAuthUrl:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Handle Callback
     * POST /api/v1/social/linkedin/callback
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

            const tokenResponse = await linkedInService.exchangeCodeForToken(code);

            // Render HTML to post message to opener
            const responseHtml = `
                <html>
                <script>
                    window.opener.postMessage({
                        type: 'LINKEDIN_AUTH_SUCCESS',
                        accessToken: '${tokenResponse.access_token}',
                        expiresIn: ${tokenResponse.expires_in},
                        refreshToken: '${tokenResponse.refresh_token || ""}',
                        state: '${state}'
                    }, '*');
                    window.close();
                </script>
                </html>
            `;

            res.send(responseHtml);

        } catch (error: any) {
            console.error('Error in LI handleCallback:', error);
            res.status(500).json({ message: 'Failed to authenticate with LinkedIn' });
        }
    }

    /**
     * List Organizations
     * GET /api/v1/social/linkedin/organizations
     */
    async listOrganizations(req: Request, res: Response) {
        try {
            const accessToken = req.headers['x-li-access-token'] as string;
            if (!accessToken) {
                return res.status(400).json({ message: 'x-li-access-token header required' });
            }

            const orgs = await linkedInService.listOrganizations(accessToken);
            res.json({ organizations: orgs });
        } catch (error: any) {
            console.error('Error in listOrganizations:', error);
            res.status(500).json({ message: 'Failed to list organizations' });
        }
    }

    /**
     * Connect Organization
     * POST /api/v1/social/linkedin/connect
     */
    async connectOrganization(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                locationId: z.string().uuid().nullable().optional(),
                organization: z.any(), // Structure checked in service or trusted from list
                tokenData: z.object({
                    access_token: z.string(),
                    expires_in: z.number(),
                    scope: z.string().optional(),
                    refresh_token: z.string().optional()
                })
            });

            const parseResult = schema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ message: 'Invalid request body', errors: parseResult.error.issues });
            }

            const { businessId, locationId, organization, tokenData } = parseResult.data;

            const connection = await linkedInService.connectOrganization(
                businessId,
                locationId || null,
                organization,
                tokenData as any
            );

            res.json({ connection });

        } catch (error: any) {
            console.error('Error in connectOrganization:', error);
            res.status(500).json({ message: 'Failed to connect organization' });
        }
    }
}

export const linkedInController = new LinkedInController();
