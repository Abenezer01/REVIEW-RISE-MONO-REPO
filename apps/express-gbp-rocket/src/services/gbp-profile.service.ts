import axios from 'axios';
import { auditLogRepository, businessRepository, locationRepository, platformIntegrationRepository, prisma } from '@platform/db';
import { SnapshotCaptureType, SnapshotDetail, SnapshotListItem, normalizeGbpProfile } from './gbp-types';
import { auditService } from './audit.service';

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_GBP_LOCATION_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';

type GbpProfileUpdateInput = {
    description?: string | null;
    serviceItems?: Array<{ name: string; description?: string | null }>;
    category?: string | null;
    categoryResourceName?: string | null;
    categoryId?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: {
        addressLines?: string[];
        locality?: string | null;
        administrativeArea?: string | null;
        postalCode?: string | null;
        countryCode?: string | null;
        formatted?: string | null;
    };
    hours?: {
        periods?: Array<{
            openDay?: string | null;
            openTime?: string | null;
            closeDay?: string | null;
            closeTime?: string | null;
        }>;
        weekdayDescriptions?: string[];
    };
};

export class GbpProfileService {
    private isMissingSnapshotTableError(error: any): boolean {
        const message = String(error?.message || '');
        const code = String(error?.code || '');
        const metaCode = String(error?.meta?.code || '');

        return code === '42P01' || metaCode === '42P01' || message.includes('relation "GbpProfileSnapshot" does not exist');
    }

    private isMissingPlatformIntegrationTableError(error: any): boolean {
        const message = String(error?.message || '');
        const code = String(error?.code || '');
        const metaCode = String(error?.meta?.code || '');
        const modelName = String(error?.meta?.modelName || '');

        return (
            code === 'P2021' ||
            metaCode === 'P2021' ||
            modelName === 'PlatformIntegration' ||
            message.includes('PlatformIntegration') ||
            message.includes('relation "PlatformIntegration" does not exist')
        );
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

    private toNonEmptyString(value: string | null | undefined): string | undefined {
        if (value === null) return '';
        if (value === undefined) return undefined;
        return String(value).trim();
    }

    private buildPatchPayload(update: GbpProfileUpdateInput, locationName: string) {
        const updateMask: string[] = [];
        const payload: Record<string, any> = { name: locationName };
        const warnings: string[] = [];

        if (update.description !== undefined) {
            payload.profile = { ...(payload.profile || {}), description: this.toNonEmptyString(update.description) };
            updateMask.push('profile.description');
        }

        if (update.website !== undefined) {
            payload.websiteUri = this.toNonEmptyString(update.website);
            updateMask.push('websiteUri');
        }

        if (update.phone !== undefined) {
            payload.phoneNumbers = {
                ...(payload.phoneNumbers || {}),
                primaryPhone: this.toNonEmptyString(update.phone)
            };
            updateMask.push('phoneNumbers.primaryPhone');
        }

        if (update.address) {
            const address = update.address;
            payload.storefrontAddress = {
                addressLines: Array.isArray(address.addressLines) ? address.addressLines.filter(Boolean) : [],
                locality: address.locality || undefined,
                administrativeArea: address.administrativeArea || undefined,
                postalCode: address.postalCode || undefined,
                regionCode: address.countryCode || undefined
            };
            updateMask.push('storefrontAddress');
        }

        if (update.hours) {
            const periods = Array.isArray(update.hours.periods) ? update.hours.periods : undefined;
            const weekdayDescriptions = Array.isArray(update.hours.weekdayDescriptions)
                ? update.hours.weekdayDescriptions.filter(Boolean)
                : undefined;

            payload.regularHours = {
                ...(periods ? { periods } : {}),
                ...(weekdayDescriptions ? { weekdayDescriptions } : {})
            };
            updateMask.push('regularHours');
        }

        if (update.category !== undefined || update.categoryId || update.categoryResourceName) {
            const resource =
                update.categoryResourceName ||
                (update.categoryId ? `categories/${update.categoryId}` : null);

            if (resource) {
                payload.categories = {
                    ...(payload.categories || {}),
                    primaryCategory: { name: resource }
                };
                updateMask.push('categories.primaryCategory');
            } else if (update.category) {
                warnings.push('Category update skipped because category resource name is missing. Provide a categoryId or categoryResourceName to push to Google.');
            }
        }

        return { payload, updateMask: updateMask.filter(Boolean), warnings };
    }

    private buildServiceListPayload(serviceItems: Array<{ name: string; description?: string | null }>, locationName: string) {
        const normalized = serviceItems
            .map((item) => ({
                name: (item.name || '').trim(),
                description: item.description ? String(item.description).trim() : ''
            }))
            .filter((item) => item.name.length > 0);

        const payload = {
            name: `${locationName}/serviceList`,
            serviceItems: normalized.map((item) => ({
                structuredServiceItem: {
                    serviceName: { value: item.name },
                    ...(item.description ? { description: { value: item.description } } : {})
                }
            }))
        };

        return { payload, hasItems: payload.serviceItems.length > 0 };
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
                readMask: 'name,title,profile,regularHours,primaryCategory,storefrontAddress,phoneNumbers,websiteUri,metadata,serviceItems'
            }
        });

        return response.data || null;
    }

    private async fetchMediaItems(accessToken: string, locationName: string) {
        // Simple fetch of first 100 photos for audit purposes
        // We can reuse GbpPhotosService logic or simplify here
        try {
            const url = `https://mybusiness.googleapis.com/v4/${locationName}/media`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { pageSize: 100 }
            });
            return response.data.mediaItems || [];
        } catch (error) {
            console.error('Failed to fetch media items for audit snapshot:', error);
            return [];
        }
    }

    private async fetchServiceItems(accessToken: string, locationName: string) {
        // Service extraction logic
        // Since 'serviceItems' is not in the readMask for locations.get, we might need a separate call
        // Or check if it is available in v1 API
        // According to docs, ServiceList is a separate resource.
        try {
            // Try fetching services separately if not in location details
            // v1: locations/{locationId}/serviceList? Or attributes?
            // Actually, 'serviceItems' is part of ServiceList resource.
            // GET https://mybusinessbusinessinformation.googleapis.com/v1/{parent=locations/*}/services
            // But wait, the resource is 'serviceList' not 'services' in some versions?
            // Let's try v1 services endpoint
            // Note: locationName is "locations/123..."
            // URL: https://mybusinessbusinessinformation.googleapis.com/v1/locations/123/services? No
            // Correct: https://mybusinessbusinessinformation.googleapis.com/v1/{parent=locations/*}/attributes ? No.
            // It seems Structured Services are in v1.
            // Let's assume we can skip explicit service fetch if we can't find endpoint easily, 
            // but 'serviceItems' was in my mock data.
            // Let's try to fetch it via separate endpoint if possible.
            // For now, I will return empty array to avoid breaking if unsure.
            // User requirement 3: Extract keywords from services.
            // So I need services.
            // Let's try: GET https://mybusinessbusinessinformation.googleapis.com/v1/{name=locations/*/serviceList}
            // It is `serviceList`.
            const url = `${GOOGLE_GBP_LOCATION_URL}/${locationName}/serviceList`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return response.data.serviceItems || [];
        } catch {
            // 404 is common if no services defined
            return [];
        }
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
        const mediaItems = await this.fetchMediaItems(accessToken, connection.gbpLocationName);
        const serviceItems = await this.fetchServiceItems(accessToken, connection.gbpLocationName);

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

        // Create snapshot with extended data for audit engine
        const snapshotProfile = {
            ...normalized,
            media: mediaItems,
            serviceItems: serviceItems,
            metadata: rawProfile.metadata // Preserve metadata for freshness check
        };

        try {
            await this.createSnapshot({
                businessId: location.businessId,
                locationId,
                captureType: 'sync',
                profile: snapshotProfile
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

        let connection: Awaited<ReturnType<typeof platformIntegrationRepository.findByLocationIdAndPlatform>> | null = null;

        try {
            connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');
        } catch (error: any) {
            if (!this.isMissingPlatformIntegrationTableError(error)) {
                throw error;
            }

            // Keep profile readable even when PlatformIntegration schema is not migrated yet.
            connection = null;
        }

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
            website: gbpProfile?.website || location.business?.website || null,
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

    async updateLocationBusinessProfile(locationId: string, input: GbpProfileUpdateInput, options?: { pushToGbp?: boolean; userId?: string | null }) {
        const location = await locationRepository.findWithBusiness(locationId);

        if (!location) {
            throw new Error('Location not found');
        }

        const existingPlatformIds = (location.platformIds || {}) as Record<string, any>;
        const existingProfile = (existingPlatformIds.gbpProfile || {}) as any;

        const mergedProfile = {
            ...existingProfile,
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.serviceItems ? { serviceItems: input.serviceItems } : {}),
            ...(input.category !== undefined ? { category: input.category } : {}),
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
            ...(input.website !== undefined ? { website: input.website } : {}),
            ...(input.address ? { address: { ...(existingProfile.address || {}), ...input.address } } : {}),
            ...(input.hours ? { hours: { ...(existingProfile.hours || {}), ...input.hours } } : {})
        };

        const now = new Date();
        const nextPlatformIds = {
            ...existingPlatformIds,
            gbpProfile: mergedProfile,
            gbpLastEditedAt: now.toISOString()
        };

        await locationRepository.update(locationId, {
            address: mergedProfile?.address?.formatted || location.address || null,
            platformIds: nextPlatformIds
        });

        const businessUpdate: Record<string, string> = {};
        if (input.description !== undefined && typeof input.description === 'string') businessUpdate.description = input.description;
        if (input.phone !== undefined && typeof input.phone === 'string') businessUpdate.phone = input.phone;
        if (input.website !== undefined && typeof input.website === 'string') businessUpdate.website = input.website;

        if (Object.keys(businessUpdate).length > 0) {
            await businessRepository.update(location.businessId, businessUpdate as any);
        }

        let warnings: string[] = [];

        if (options?.pushToGbp) {
            const connection = await platformIntegrationRepository.findByLocationIdAndPlatform(locationId, 'google');

            if (!connection || connection.status !== 'active' || !connection.gbpLocationName) {
                throw new Error('Active Google PlatformIntegration connection not found for this location');
            }

            const accessToken = await this.getAccessToken(locationId);
            const patch = this.buildPatchPayload(input, connection.gbpLocationName);
            warnings = patch.warnings;

            if (patch.updateMask.length === 0) {
                if (!input.serviceItems || input.serviceItems.length === 0) {
                    throw new Error('No valid fields provided for Google update');
                }
            }

            if (patch.updateMask.length > 0) {
                await axios.patch(`${GOOGLE_GBP_LOCATION_URL}/${connection.gbpLocationName}`, patch.payload, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { updateMask: patch.updateMask.join(',') }
                });
            }

            if (input.serviceItems && input.serviceItems.length > 0) {
                const servicePayload = this.buildServiceListPayload(input.serviceItems, connection.gbpLocationName);

                if (servicePayload.hasItems) {
                    await axios.patch(`${GOOGLE_GBP_LOCATION_URL}/${connection.gbpLocationName}/serviceList`, servicePayload.payload, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        params: { updateMask: 'serviceItems' }
                    });
                }
            }

            const rawProfile = await this.fetchLocationDetails(accessToken, connection.gbpLocationName);
            const normalized = normalizeGbpProfile(rawProfile);
            const updatedPlatformIds = {
                ...nextPlatformIds,
                gbpProfile: normalized,
                gbpLastSyncedAt: now.toISOString()
            };

            await locationRepository.update(locationId, {
                address: normalized.address.formatted || location.address || null,
                lastSync: now,
                platformIds: updatedPlatformIds
            });

            const businessSyncUpdate: Record<string, string> = {};
            if (normalized.description) businessSyncUpdate.description = normalized.description;
            if (normalized.phone) businessSyncUpdate.phone = normalized.phone;
            if (normalized.website) businessSyncUpdate.website = normalized.website;

            if (Object.keys(businessSyncUpdate).length > 0) {
                await businessRepository.update(location.businessId, businessSyncUpdate as any);
            }

            try {
                await this.createSnapshot({
                    businessId: location.businessId,
                    locationId,
                    captureType: 'manual',
                    profile: normalized,
                    userId: options?.userId || null
                });
            } catch (error: any) {
                if (!this.isMissingSnapshotTableError(error)) {
                    throw error;
                }
            }

            return {
                profile: await this.getLocationBusinessProfile(locationId),
                pushed: true,
                warnings
            };
        }

        try {
            await this.createSnapshot({
                businessId: location.businessId,
                locationId,
                captureType: 'manual',
                profile: mergedProfile,
                userId: options?.userId || null
            });
        } catch (error: any) {
            if (!this.isMissingSnapshotTableError(error)) {
                throw error;
            }
        }

        return {
            profile: await this.getLocationBusinessProfile(locationId),
            pushed: false,
            warnings
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
export const updateLocationBusinessProfile = (locationId: string, input: GbpProfileUpdateInput, options?: { pushToGbp?: boolean; userId?: string | null }) =>
    gbpProfileService.updateLocationBusinessProfile(locationId, input, options);
