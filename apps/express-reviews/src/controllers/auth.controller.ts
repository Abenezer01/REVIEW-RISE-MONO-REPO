import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { reviewSourceRepository } from '@platform/db';
import { googleReviewsService } from '../services/google-reviews.service';

export const connectGoogle = (req: Request, res: Response) => {
    try {
        const { locationId } = req.query;

        if (!locationId) {
            const errorResponse = createErrorResponse('locationId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        // State should encode locationId + security token to prevent CSRF.
        // For MVP, just locationId.
        const state = JSON.stringify({ locationId });
        const url = googleReviewsService.getAuthUrl(state);

        // If client wants JSON URL
        const response = createSuccessResponse({ url }, 'Auth URL generated', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        console.error('Connect Google error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;

        // Exchange code for tokens
        const tokens = await googleReviewsService.getTokens(code as string);

        const { locationId } = JSON.parse(state as string);

        try {
            const accounts = await googleReviewsService.listAccounts(tokens.access_token!);
            const account = accounts[0]; // Assume first account for now.
            if (!account) throw new Error("No Google Business Profile account found.");
            
            const locations = await googleReviewsService.listLocations(tokens.access_token!, account.name);
            
            const gbpLocation = locations[0];
            if (!gbpLocation) throw new Error("No locations found in this Google Account.");

            // Create/Update ReviewSource
            await reviewSourceRepository.create({
                location: { connect: { id: locationId } },
                platform: 'google',
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!,
                expiresAt: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
                metadata: {
                    accountId: account.name, // "accounts/X"
                    locationName: gbpLocation.name, // "accounts/X/locations/Y"
                    locationTitle: gbpLocation.title
                }
            });

            // Redirect to frontend success page
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/locations/${locationId}?google_connected=true`);

        } catch (innerError: any) {
             console.error("Error fetching GBP details:", innerError);
             res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/locations/${locationId}?google_error=fetch_failed`);
        }

    } catch (error: any) {
        console.error('Google callback error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
