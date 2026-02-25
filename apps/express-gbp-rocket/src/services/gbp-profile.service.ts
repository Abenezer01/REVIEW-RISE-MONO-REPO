import axios from 'axios';
import { platformIntegrationRepository, businessRepository, locationRepository } from '@platform/db';

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_GBP_LOCATION_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';

type NormalizedGbpProfile = {
    source: 'google_business_profile';
    locationName: string | null;
    locationTitle: string | null;
    description: string | null;
    category: string | null;
    phone: string | null;
    website: string | null;
    address: {
        addressLines: string[];
        locality: string | null;
        administrativeArea: string | null;
        postalCode: string | null;
        countryCode: string | null;
        formatted: string | null;
    };
    hours: {
        periods: Array<{
            openDay: string | null;
            openTime: string | null;
            closeDay: string | null;
            closeTime: string | null;
        }>;
        weekdayDescriptions: string[];
    };
};

const normalizeGbpProfile = (raw: any): NormalizedGbpProfile => {
    const address = raw?.storefrontAddress || {};
    const addressLines = Array.isArray(address?.addressLines) ? address.addressLines.filter(Boolean) : [];
    const locality = address?.locality || null;
    const administrativeArea = address?.administrativeArea || null;
    const postalCode = address?.postalCode || null;
    const countryCode = address?.regionCode || null;
    const formattedAddress = [addressLines.join(', '), locality, administrativeArea, postalCode, countryCode]
        .filter(Boolean)
        .join(', ') || null;

    const periods = Array.isArray(raw?.regularHours?.periods) ? raw.regularHours.periods : [];
    const normalizedPeriods = periods.map((period: any) => ({
        openDay: period?.openDay || null,
        openTime: period?.openTime || null,
        closeDay: period?.closeDay || null,
        closeTime: period?.closeTime || null
    }));

    const weekdayDescriptions = Array.isArray(raw?.regularHours?.weekdayDescriptions)
        ? raw.regularHours.weekdayDescriptions
        : [];

    return {
        source: 'google_business_profile',
        locationName: raw?.name || null,
        locationTitle: raw?.title || null,
        description: raw?.profile?.description || null,
        category: raw?.primaryCategory?.displayName || null,
        phone: raw?.phoneNumbers?.primaryPhone || raw?.phoneNumbers?.additionalPhones?.[0] || null,
        website: raw?.websiteUri || null,
        address: {
            addressLines,
            locality,
            administrativeArea,
            postalCode,
            countryCode,
            formatted: formattedAddress
        },
        hours: {
            periods: normalizedPeriods,
            weekdayDescriptions
        }
    };
};

export class GbpProfileService {

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

        const platformIds = (location.platformIds || {}) as any;
        const gbpProfile = (platformIds?.gbpProfile || {}) as any;
        const lastSynced = platformIds?.gbpLastSyncedAt || location.lastSync || null;

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
            lastSynced
        };
    }
}

export const gbpProfileService = new GbpProfileService();

export const syncLocationBusinessProfile = (locationId: string) => gbpProfileService.syncLocationBusinessProfile(locationId);
export const getLocationBusinessProfile = (locationId: string) => gbpProfileService.getLocationBusinessProfile(locationId);
