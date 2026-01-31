import { Request, Response } from 'express';
import { linkedInService } from '../services/linkedin.service';
import {
    createSuccessResponse,
    createErrorResponse,
    ErrorCode
} from '@platform/contracts';

export class LinkedInController {

    /**
     * Get Auth URL
     * GET /api/v1/social/linkedin/auth-url
     */
    async getAuthUrl(req: Request, res: Response) {
        try {
            const { businessId, locationId } = req.query as any;

            const state = Buffer.from(JSON.stringify({
                businessId,
                locationId: locationId || null
            })).toString('base64');

            const url = linkedInService.getAuthUrl(state);
            
            const response = createSuccessResponse(
                { url },
                'LinkedIn OAuth URL generated successfully',
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
     * Handle Callback
     * POST /api/v1/social/linkedin/callback
     */
    async handleCallback(req: Request, res: Response) {
        try {
            const { code, state } = req.body;

            const tokenResponse = await linkedInService.exchangeCodeForToken(code);

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
            console.error('Error in handleCallback:', error);
            const response = createErrorResponse(
                'Failed to authenticate with LinkedIn',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
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
                const response = createErrorResponse(
                    'x-li-access-token header is required',
                    ErrorCode.BAD_REQUEST,
                    400,
                    undefined,
                    req.id
                );
                return res.status(response.statusCode).json(response);
            }

            const orgs = await linkedInService.listOrganizations(accessToken);
            
            const response = createSuccessResponse(
                { organizations: orgs },
                'LinkedIn organizations retrieved successfully',
                200,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error in listOrganizations:', error);
            const response = createErrorResponse(
                'Failed to list LinkedIn organizations',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }

    /**
     * Connect Organization
     * POST /api/v1/social/linkedin/connect
     */
    async connectOrganization(req: Request, res: Response) {
        try {
            const { businessId, locationId, organization, tokenData } = req.body;

            const connection = await linkedInService.connectOrganization(
                businessId,
                locationId || null,
                organization,
                tokenData as any
            );

            // Sanitize connection (remove tokens)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { accessToken, refreshToken, ...sanitized } = connection as any;

            const response = createSuccessResponse(
                { connection: sanitized },
                'LinkedIn organization connected successfully',
                201,
                { requestId: req.id }
            );
            res.status(response.statusCode).json(response);

        } catch (error: any) {
            console.error('Error in connectOrganization:', error);
            const response = createErrorResponse(
                'Failed to connect LinkedIn organization',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(response.statusCode).json(response);
        }
    }
}

export const linkedInController = new LinkedInController();
