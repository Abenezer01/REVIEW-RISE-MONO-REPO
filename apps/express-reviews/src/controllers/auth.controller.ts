 import { Request, Response } from 'express';
import crypto from 'crypto';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { platformIntegrationRepository, pendingGoogleConnectionRepository } from '@platform/db';
import { encryptToken, decryptToken, isEncryptedToken } from '@platform/utils';
import { googleReviewsService } from '../services/google-reviews.service';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─────────────────────────────────────────────────────────────
// Phase 1 — Initiate OAuth
// GET /auth/google/connect?locationId=xxx
// ─────────────────────────────────────────────────────────────
export const connectGoogle = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.query;

        if (!locationId || typeof locationId !== 'string') {
            return res.status(400).json(
                createErrorResponse('locationId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id)
            );
        }

        // Generate a CSRF nonce
        const nonce = crypto.randomUUID();

        // Pre-create a pending record so we can validate the nonce on callback
        await pendingGoogleConnectionRepository.create({
            id: crypto.randomUUID(),
            nonce,
            location: { connect: { id: locationId } },
            encryptedAccessToken: '',  // Will be filled in callback
            encryptedRefreshToken: '',
            expiryDate: BigInt(0),
            accountsJson: [],
            locationsJson: [],
            expiresAt: new Date(Date.now() + PENDING_TTL_MS),
        });

        // Encode locationId + nonce in state
        const state = Buffer.from(JSON.stringify({ locationId, nonce })).toString('base64url');
        const url = googleReviewsService.getAuthUrl(state);

        return res.status(200).json(
            createSuccessResponse({ url }, 'Auth URL generated', 200, { requestId: req.id })
        );
    } catch (error: any) {
        console.error('[connectGoogle] Error:', error);
        return res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id)
        );
    }
};

// ─────────────────────────────────────────────────────────────
// Phase 2 — OAuth Callback
// GET /auth/google/callback?code=...&state=...
// ─────────────────────────────────────────────────────────────
export const googleCallback = async (req: Request, res: Response) => {
    let locationId: string | undefined;

    try {
        const { code, state, error: oauthError } = req.query;

        // Handle user cancellation
        if (oauthError === 'access_denied') {
            return res.redirect(`${FRONTEND_URL}/admin/locations?google_error=access_denied`);
        }

        if (!code || !state) {
            return res.redirect(`${FRONTEND_URL}/admin/locations?google_error=invalid_callback`);
        }

        // Decode state
        let stateData: { locationId: string; nonce: string };
        try {
            stateData = JSON.parse(Buffer.from(state as string, 'base64url').toString('utf8'));
            locationId = stateData.locationId;
        } catch {
            return res.redirect(`${FRONTEND_URL}/admin/locations?google_error=invalid_state`);
        }

        // Validate nonce (anti-CSRF)
        const pendingRecord = await pendingGoogleConnectionRepository.findByNonce(stateData.nonce);
        if (!pendingRecord || pendingRecord.locationId !== locationId) {
            return res.redirect(
                `${FRONTEND_URL}/admin/locations/${locationId}?google_error=invalid_state`
            );
        }
        if (await pendingGoogleConnectionRepository.isExpired(pendingRecord)) {
            await pendingGoogleConnectionRepository.deleteById(pendingRecord.id);
            return res.redirect(
                `${FRONTEND_URL}/admin/locations/${locationId}?google_error=session_expired`
            );
        }

        // Exchange code for tokens
        const tokens = await googleReviewsService.getTokens(code as string);

        if (!tokens.access_token) {
            return res.redirect(
                `${FRONTEND_URL}/admin/locations/${locationId}?google_error=token_exchange_failed`
            );
        }

        // Fetch all accounts and locations
        let accounts: any[] = [];
        let locations: any[] = [];

        try {
            accounts = await googleReviewsService.listAccounts(tokens.access_token);
        } catch {
            return res.redirect(
                `${FRONTEND_URL}/admin/locations/${locationId}?google_error=no_accounts`
            );
        }

        if (!accounts.length) {
            return res.redirect(
                `${FRONTEND_URL}/admin/locations/${locationId}?google_error=no_accounts`
            );
        }

        try {
            locations = await googleReviewsService.listAllLocations(tokens.access_token, accounts);
        } catch {
            // Non-fatal — we'll show empty list in selector
            locations = [];
        }

        if (!locations.length) {
            return res.redirect(
                `${FRONTEND_URL}/admin/locations/${locationId}?google_error=no_locations`
            );
        }

        // Encrypt tokens and update the pending record
        const encryptedAccessToken = encryptToken(tokens.access_token);
        const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : '';
        const expiryDate = tokens.expiry_date ? BigInt(tokens.expiry_date) : BigInt(0);

        await pendingGoogleConnectionRepository.deleteById(pendingRecord.id);
        const newPending = await pendingGoogleConnectionRepository.create({
            id: crypto.randomUUID(),
            nonce: crypto.randomUUID(), // New nonce for the finalize step
            location: { connect: { id: locationId } },
            encryptedAccessToken,
            encryptedRefreshToken,
            expiryDate,
            accountsJson: accounts,
            locationsJson: locations,
            expiresAt: new Date(Date.now() + PENDING_TTL_MS),
        });

        // Redirect to frontend with pendingId so the UI can show the location selector
        return res.redirect(
            `${FRONTEND_URL}/admin/locations/${locationId}?pending_google=${newPending.id}`
        );
    } catch (error: any) {
        console.error('[googleCallback] Error:', error);
        const redirect = locationId
            ? `${FRONTEND_URL}/admin/locations/${locationId}?google_error=server_error`
            : `${FRONTEND_URL}/admin/locations?google_error=server_error`;
        return res.redirect(redirect);
    }
};

// ─────────────────────────────────────────────────────────────
// Phase 2b — Get Pending Connection (Location Selector Data)
// GET /auth/google/pending/:id
// ─────────────────────────────────────────────────────────────
export const getPendingConnection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pending = await pendingGoogleConnectionRepository.findById(id);

        if (!pending) {
            return res.status(404).json(
                createErrorResponse('Pending connection not found', ErrorCode.NOT_FOUND, 404, undefined, req.id)
            );
        }

        if (await pendingGoogleConnectionRepository.isExpired(pending)) {
            await pendingGoogleConnectionRepository.deleteById(id);
            return res.status(410).json(
                createErrorResponse('Session expired. Please reconnect.', ErrorCode.BAD_REQUEST, 410, undefined, req.id)
            );
        }

        return res.status(200).json(
            createSuccessResponse(
                {
                    locationId: pending.locationId,
                    accounts: pending.accountsJson,
                    locations: pending.locationsJson,
                },
                'Pending connection data',
                200,
                { requestId: req.id }
            )
        );
    } catch (error: any) {
        console.error('[getPendingConnection] Error:', error);
        return res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id)
        );
    }
};

// ─────────────────────────────────────────────────────────────
// Phase 3 — Finalize Connection
// POST /auth/google/finalize
// Body: { pendingId, gbpLocationName, gbpAccountId, gbpLocationTitle }
// ─────────────────────────────────────────────────────────────
export const finalizeConnection = async (req: Request, res: Response) => {
    try {
        const { pendingId, gbpLocationName, gbpAccountId, gbpLocationTitle } = req.body;

        if (!pendingId || !gbpLocationName || !gbpAccountId) {
            return res.status(400).json(
                createErrorResponse('pendingId, gbpLocationName and gbpAccountId are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id)
            );
        }

        const pending = await pendingGoogleConnectionRepository.findById(pendingId);

        if (!pending) {
            return res.status(404).json(
                createErrorResponse('Pending connection not found or expired', ErrorCode.NOT_FOUND, 404, undefined, req.id)
            );
        }

        if (await pendingGoogleConnectionRepository.isExpired(pending)) {
            await pendingGoogleConnectionRepository.deleteById(pendingId);
            return res.status(410).json(
                createErrorResponse('Session expired. Please reconnect.', ErrorCode.BAD_REQUEST, 410, undefined, req.id)
            );
        }

        // Persist encrypted tokens to PlatformIntegration (upsert handles reconnect)
        const integration = await platformIntegrationRepository.upsertGoogleIntegration({
            locationId: pending.locationId,
            accessToken: pending.encryptedAccessToken,
            refreshToken: pending.encryptedRefreshToken,
            expiresAt: pending.expiryDate,
            gbpAccountId,
            gbpLocationName,
            gbpLocationTitle: gbpLocationTitle || '',
        });

        // Clean up the pending record
        await pendingGoogleConnectionRepository.deleteById(pendingId);

        return res.status(200).json(
            createSuccessResponse(
                {
                    connected: true,
                    integrationId: integration.id,
                    locationId: integration.locationId,
                    gbpLocationTitle: integration.gbpLocationTitle,
                    connectedAt: integration.connectedAt,
                },
                'Google Business Profile connected successfully',
                200,
                { requestId: req.id }
            )
        );
    } catch (error: any) {
        console.error('[finalizeConnection] Error:', error);
        return res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id)
        );
    }
};

// ─────────────────────────────────────────────────────────────
// Disconnect
// POST /auth/google/disconnect/:locationId
// ─────────────────────────────────────────────────────────────
export const disconnectGoogle = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        const integration = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!integration) {
            return res.status(404).json(
                createErrorResponse('No Google connection found for this location', ErrorCode.NOT_FOUND, 404, undefined, req.id)
            );
        }

        // Attempt token revocation (non-critical)
        if (integration.accessToken) {
            try {
                const plainToken = isEncryptedToken(integration.accessToken)
                    ? decryptToken(integration.accessToken)
                    : integration.accessToken;
                await googleReviewsService.revokeToken(plainToken);
            } catch {
                // Non-fatal
            }
        }

        // Delete the integration record
        await platformIntegrationRepository.delete(integration.id);

        return res.status(200).json(
            createSuccessResponse({}, 'Google Business Profile disconnected', 200, { requestId: req.id })
        );
    } catch (error: any) {
        console.error('[disconnectGoogle] Error:', error);
        return res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id)
        );
    }
};

// ─────────────────────────────────────────────────────────────
// Connection Status
// GET /auth/google/status/:locationId
// ─────────────────────────────────────────────────────────────
export const getConnectionStatus = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        const integration = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!integration || integration.status === 'disconnected') {
            return res.status(200).json(
                createSuccessResponse({ connected: false }, 'Not connected', 200, { requestId: req.id })
            );
        }

        return res.status(200).json(
            createSuccessResponse(
                {
                    connected: integration.status === 'active',
                    status: integration.status,
                    integrationId: integration.id,
                    gbpLocationTitle: integration.gbpLocationTitle,
                    gbpLocationName: integration.gbpLocationName,
                    connectedAt: integration.connectedAt,
                },
                'Connection status',
                200,
                { requestId: req.id }
            )
        );
    } catch (error: any) {
        console.error('[getConnectionStatus] Error:', error);
        return res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id)
        );
    }
};
