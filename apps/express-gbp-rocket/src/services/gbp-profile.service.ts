import axios from 'axios';
import { auditLogRepository, businessRepository, locationRepository, platformIntegrationRepository, prisma } from '@platform/db';
import { SnapshotCaptureType, SnapshotDetail, SnapshotListItem, normalizeGbpProfile } from './gbp-types';
import { auditService } from './audit.service';

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_GBP_LOCATION_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';

export class GbpProfileService {
    private isMissingSnapshotTableError(error: any): boolean {
        const message = String(error?.message || '');
        const code = String(error?.code || '');
        const metaCode = String(error?.meta?.code || '');

        return code === '42P01' || metaCode === '42P01' || message.includes('relation "GbpProfileSnapshot" does not exist');
    }

    private toFieldMap(profile: any) {
        return {
            description: profile?.description ?? null,
            category: profile?.category ?? null,
            phone: profile?.phone ?? null,
            website: profile?.website ?? null,
            address: profile?.address ?? null,
            hours: profile?.hours ?? { periods: [], weekdayDescriptions: [] }
        };
    }

    private computeChangedFields(previousSnapshot: any, currentSnapshot: any): string[] {
        if (!previousSnapshot) {
            return Object.keys(this.toFieldMap(currentSnapshot));
        }

        const previousFields = this.toFieldMap(previousSnapshot);
        const currentFields = this.toFieldMap(currentSnapshot);
        const changed: string[] = [];

        for (const key of Object.keys(currentFields)) {
            if (JSON.stringify(previousFields[key as keyof typeof previousFields]) !== JSON.stringify(currentFields[key as keyof typeof currentFields])) {
                changed.push(key);
            }
        }

        return changed;
    }

    private async getLatestSnapshot(locationId: string): Promise<SnapshotDetail | null> {
        try {
            const rows = await prisma.$queryRawUnsafe<Array<SnapshotDetail>>(
                `
                SELECT
                    "id",
                    "captureType",
                    "changedFields",
                    "auditLogId",
                    "suggestionRefs",
                    "capturedAt",
                    "diffBaseSnapshotId",
                    "snapshot"
                FROM "GbpProfileSnapshot"
                WHERE "locationId" = $1::uuid
                ORDER BY "capturedAt" DESC
                LIMIT 1
                `,
                locationId
            );

            return rows[0] || null;
        } catch (error: any) {
            if (this.isMissingSnapshotTableError(error)) {
                return null;
            }

            throw error;
        }
    }

    private async createSnapshot(params: {
        businessId: string;
        locationId: string;
        captureType: SnapshotCaptureType;
        profile: any;
        userId?: string | null;
        suggestionRefs?: any;
    }) {
        const previous = await this.getLatestSnapshot(params.locationId);
        const changedFields = this.computeChangedFields(previous?.snapshot, params.profile);
        const snapshotPayload = {
            schemaVersion: 1,
            capturedAt: new Date().toISOString(),
            fields: this.toFieldMap(params.profile),
            profile: params.profile
        };

        const auditLog = await auditLogRepository.log({
            user: params.userId ? { connect: { id: params.userId } } : undefined,
            action: 'gbp_profile_snapshot_created',
            entityType: 'location',
            entityId: params.locationId,
            details: {
                captureType: params.captureType,
                changedFields
            }
        });

        try {
            const rows = await prisma.$queryRawUnsafe<Array<SnapshotDetail>>(
                `
                INSERT INTO "GbpProfileSnapshot" (
                    "businessId",
                    "locationId",
                    "captureType",
                    "snapshot",
                    "changedFields",
                    "diffBaseSnapshotId",
                    "auditLogId",
                    "suggestionRefs",
                    "capturedAt",
                    "createdAt"
                )
                VALUES (
                    $1::uuid,
                    $2::uuid,
                    $3,
                    $4::jsonb,
                    $5::jsonb,
                    $6::uuid,
                    $7::uuid,
                    $8::jsonb,
                    $9::timestamp,
                    $10::timestamp
                )
                RETURNING
                    "id",
                    "captureType",
                    "changedFields",
                    "auditLogId",
                    "suggestionRefs",
                    "capturedAt",
                    "diffBaseSnapshotId",
                    "snapshot"
                `,
                params.businessId,
                params.locationId,
                params.captureType,
                JSON.stringify(snapshotPayload),
                JSON.stringify(changedFields),
                previous?.id || null,
                auditLog.id,
                JSON.stringify(params.suggestionRefs ?? null),
                new Date(),
                new Date()
            );

            // Trigger audit in background
            if (rows[0]?.id) {
                auditService.runAudit(rows[0].id).catch(err => {
                    console.error(`[GBP Audit] Failed to run audit for snapshot ${rows[0].id}`, err);
                });
            }

            return rows[0];
        } catch (error: any) {
            if (this.isMissingSnapshotTableError(error)) {
                console.warn('[GBP Snapshot] GbpProfileSnapshot table is missing. Apply DB migration to enable snapshot storage.');
                return {
                    id: '',
                    captureType: params.captureType,
                    changedFields,
                    auditLogId: auditLog.id,
                    suggestionRefs: params.suggestionRefs ?? null,
                    capturedAt: new Date(),
                    diffBaseSnapshotId: previous?.id || null,
                    snapshot: snapshotPayload
                };
            }

            throw error;
        }
    }

    /**
     * Get the Google connection for a location
     */
    async getConnection(locationId: string) {
        return platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');
    }

    /**
     * Get a valid access token for a location, refreshing it if necessary.
     */
    async getAccessToken(locationId: string): Promise<string> {
        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!connection) {
            throw new Error('No Google connection found for this location');
        }

        // Check if token is expired or close to expiring (within 5 minutes)
        const isExpired = connection.expiresAt && Number(connection.expiresAt) < Date.now() + 5 * 60 * 1000;

        if (isExpired && connection.refreshToken) {
            return this.refreshTokens(locationId, connection.refreshToken);
        }

        if (!connection.accessToken) {
            throw new Error('Access token is missing from connection');
        }

        return connection.accessToken;
    }

    /**
     * Refresh the Google OAuth tokens and save them to the database.
     */
    async refreshTokens(locationId: string, refreshToken: string): Promise<string> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Google OAuth credentials not configured');
        }

        const response = await axios.post(GOOGLE_OAUTH_TOKEN_URL, {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });

        const data = response.data as { access_token: string; expires_in: number };

        const expiresAt = Date.now() + data.expires_in * 1000;

        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (connection) {
            await platformIntegrationRepository.updateTokens(
                connection.id,
                data.access_token,
                refreshToken,
                expiresAt
            );
        }

        return data.access_token;
    }

    /**
     * Example method demonstrating metadata access as seen in original error trace.
     */
    async getProfileMetadata(locationId: string) {
        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!connection) {
            throw new Error('No Google connection found for this location');
        }

        return connection.metadata;
    }

    /**
     * Fetch raw location details from Google Business API
     */
    private async fetchLocationDetails(accessToken: string, locationName: string) {
        const response = await axios.get(`${GOOGLE_GBP_LOCATION_URL}/${locationName}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                readMask: 'name,title,profile,regularHours,primaryCategory,storefrontAddress,phoneNumbers,websiteUri,metadata'
            }
        });

        return response.data || null;
    }

    /**
     * Sync business profile information from GBP to the local DB
     */
    async syncLocationBusinessProfile(locationId: string) {
        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        if (!connection || !connection.accessToken || connection.status !== 'active') {
            throw new Error('Active Google PlatformIntegration connection not found for this location');
        }

        const location = await locationRepository.findById(locationId);

        if (!location) {
            throw new Error('Location not found');
        }

        const accessToken = await this.getAccessToken(locationId);

        if (!connection.gbpLocationName) {
            throw new Error('Missing GBP locationName on platform integration');
        }

        const rawProfile = await this.fetchLocationDetails(accessToken, connection.gbpLocationName);
        const normalized = normalizeGbpProfile(rawProfile);
        const now = new Date();
        const existingPlatformIds = (location.platformIds || {}) as Record<string, any>;

        await locationRepository.update(locationId, {
            address: normalized.address.formatted || location.address || null,
            lastSync: now,
            platformIds: {
                ...existingPlatformIds,
                gbpProfile: normalized,
                gbpLastSyncedAt: now.toISOString()
            }
        });

        const businessUpdate: Record<string, string> = {};

        if (normalized.description) businessUpdate.description = normalized.description;
        if (normalized.phone) businessUpdate.phone = normalized.phone;

        if (Object.keys(businessUpdate).length > 0) {
            await businessRepository.update(location.businessId, businessUpdate as any);
        }

        try {
            await this.createSnapshot({
                businessId: location.businessId,
                locationId,
                captureType: 'sync',
                profile: normalized
            });
        } catch (error: any) {
            if (!this.isMissingSnapshotTableError(error)) {
                throw error;
            }
        }

        return {
            locationId,
            businessId: location.businessId,
            ...normalized,
            lastSynced: now.toISOString()
        };
    }

    /**
     * Get the synced profile details from the DB
     */
    async getLocationBusinessProfile(locationId: string) {
        const location = await locationRepository.findWithBusiness(locationId);

        if (!location) {
            return null;
        }

        const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

        const platformIds = (location.platformIds || {}) as any;
        const gbpProfile = (platformIds?.gbpProfile || {}) as any;
        const lastSynced = platformIds?.gbpLastSyncedAt || location.lastSync || null;
        const connectionStatus = connection?.status || 'disconnected';
        const connectedAt = connection?.connectedAt || null;

        return {
            locationId: location.id,
            businessId: location.businessId,
            description: gbpProfile?.description || location.business?.description || null,
            category: gbpProfile?.category || null,
            phone: gbpProfile?.phone || location.business?.phone || null,
            address: gbpProfile?.address || {
                addressLines: [],
                locality: null,
                administrativeArea: null,
                postalCode: null,
                countryCode: null,
                formatted: location.address || null
            },
            hours: gbpProfile?.hours || { periods: [], weekdayDescriptions: [] },
            lastSynced,
            connectedAt,
            connectionStatus
        };
    }

    async createOnDemandSnapshot(locationId: string, userId?: string | null, suggestionRefs?: any) {
        const profile = await this.getLocationBusinessProfile(locationId);

        if (!profile) {
            throw new Error('Location not found');
        }

        return this.createSnapshot({
            businessId: profile.businessId,
            locationId,
            captureType: 'manual',
            profile,
            userId,
            suggestionRefs
        });
    }

    async listSnapshots(locationId: string, limit = 20, offset = 0): Promise<{ total: number; items: SnapshotListItem[] }> {
        try {
            const countRows = await prisma.$queryRawUnsafe<Array<{ total: bigint }>>(
                `SELECT COUNT(*)::bigint AS total FROM "GbpProfileSnapshot" WHERE "locationId" = $1::uuid`,
                locationId
            );

            const items = await prisma.$queryRawUnsafe<Array<SnapshotListItem>>(
                `
                SELECT
                    "id",
                    "captureType",
                    "changedFields",
                    "auditLogId",
                    "suggestionRefs",
                    "capturedAt",
                    "diffBaseSnapshotId"
                FROM "GbpProfileSnapshot"
                WHERE "locationId" = $1::uuid
                ORDER BY "capturedAt" DESC
                LIMIT $2 OFFSET $3
                `,
                locationId,
                limit,
                offset
            );

            return {
                total: Number(countRows[0]?.total || 0),
                items: items.map((item) => ({
                    ...item,
                    changedFields: Array.isArray(item.changedFields) ? item.changedFields : []
                }))
            };
        } catch (error: any) {
            if (this.isMissingSnapshotTableError(error)) {
                return { total: 0, items: [] };
            }

            throw error;
        }
    }

    async getSnapshotDetail(locationId: string, snapshotId: string): Promise<SnapshotDetail | null> {
        try {
            const rows = await prisma.$queryRawUnsafe<Array<SnapshotDetail>>(
                `
                SELECT
                    "id",
                    "captureType",
                    "changedFields",
                    "auditLogId",
                    "suggestionRefs",
                    "capturedAt",
                    "diffBaseSnapshotId",
                    "snapshot"
                FROM "GbpProfileSnapshot"
                WHERE "locationId" = $1::uuid
                  AND "id" = $2::uuid
                LIMIT 1
                `,
                locationId,
                snapshotId
            );

            if (!rows[0]) {
                return null;
            }

            return {
                ...rows[0],
                changedFields: Array.isArray(rows[0].changedFields) ? rows[0].changedFields : []
            };
        } catch (error: any) {
            if (this.isMissingSnapshotTableError(error)) {
                return null;
            }

            throw error;
        }
    }
}

export const gbpProfileService = new GbpProfileService();

export const syncLocationBusinessProfile = (locationId: string) => gbpProfileService.syncLocationBusinessProfile(locationId);
export const getLocationBusinessProfile = (locationId: string) => gbpProfileService.getLocationBusinessProfile(locationId);
export const createLocationSnapshot = (locationId: string, userId?: string | null, suggestionRefs?: any) =>
    gbpProfileService.createOnDemandSnapshot(locationId, userId, suggestionRefs);
export const listLocationSnapshots = (locationId: string, limit?: number, offset?: number) =>
    gbpProfileService.listSnapshots(locationId, limit, offset);
export const getLocationSnapshotDetail = (locationId: string, snapshotId: string) =>
    gbpProfileService.getSnapshotDetail(locationId, snapshotId);
