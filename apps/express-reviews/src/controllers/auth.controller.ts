import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { reviewSourceRepository } from '@platform/db';
import { googleReviewsService } from '../services/google-reviews.service';

export const connectGoogle = (req: Request, res: Response) => {
    try {
        const { locationId } = req.query;

        if (!locationId) {
            return res.status(400).json(createErrorResponse('locationId is required', ErrorCode.BAD_REQUEST, 400));
        }

        // State should encode locationId + security token to prevent CSRF.
        // For MVP, just locationId.
        const state = JSON.stringify({ locationId });
        const url = googleReviewsService.getAuthUrl(state);

        // If client wants JSON URL
        // res.status(200).json(createSuccessResponse({ url }, 'Auth URL generated'));
        
        // If client wants redirect directly (standard OAuth)
        // But we are API. Frontend should redirect.
        res.status(200).json(createSuccessResponse({ url }, 'Auth URL generated'));

    } catch (error) {
        console.error('Connect Google error:', error);
        res.status(500).json(createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;

        // Exchange code for tokens
        const tokens = await googleReviewsService.getTokens(code as string);

        const { locationId } = JSON.parse(state as string);

        // Now we simply store the ReviewSource with partial info?
        // Or we should fetch available locations and ask user to select?
        // Flow: 
        // 1. User authorizes.
        // 2. We get tokens.
        // 3. We assume 1:1 mapping or pick first one?
        // Requirement says "Fetch reviews from GBP for each connected location".
        // Usually we need to know WHICH GBP location maps to THIS ReviewRise location.
        // Let's list locations and pick the one that matches or auto-select if only 1.
        
        // MVP: Just save tokens and let a subsequent step "Complete Setup" pick the location?
        // Or try to automatch.
        
        try {
            const accounts = await googleReviewsService.listAccounts(tokens.access_token!);
            const account = accounts[0]; // Assume first account for now.
            if (!account) throw new Error("No Google Business Profile account found.");
            
            const locations = await googleReviewsService.listLocations(tokens.access_token!, account.name);
            
            // Just take the first location for MVP?? This is risky if user manages multiple.
            // Ideally we redirect user to a frontend page with the tokens (or temp session) to pick location.
            // But to satisfy "backend + basic UI" request efficiently:
            // Let's create the source for the FIRST location found.
            
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
            // Assuming frontend runs on localhost:3000 or defined URL
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/locations/${locationId}?google_connected=true`);

        } catch (innerError) {
             console.error("Error fetching GBP details:", innerError);
             res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/locations/${locationId}?google_error=fetch_failed`);
        }

    } catch (error) {
        console.error('Google callback error:', error);
        res.status(500).json(createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500));
    }
};
