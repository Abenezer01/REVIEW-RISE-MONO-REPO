import axios from 'axios';

import { businessRepository, locationRepository, reviewSourceRepository } from '@platform/db';

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

const refreshGoogleAccessToken = async (refreshToken: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials missing');
  }

  const response = await axios.post(GOOGLE_OAUTH_TOKEN_URL, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  return response.data as { access_token: string; expires_in?: number };
};

const fetchLocationDetails = async (accessToken: string, locationName: string) => {
  const response = await axios.get(`${GOOGLE_GBP_LOCATION_URL}/${locationName}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      readMask: 'name,title,profile,regularHours,primaryCategory,storefrontAddress,phoneNumbers,websiteUri,metadata'
    }
  });

  return response.data || null;
};

const toEpochMsBigInt = (value: number) => BigInt(String(value));

export const syncLocationBusinessProfile = async (locationId: string) => {
  const source = (await reviewSourceRepository.findByLocationId(locationId))
    .find((item) => item.platform === 'google' && item.status === 'active');

  if (!source || !source.accessToken) {
    throw new Error('Active Google review source not found for this location');
  }

  const location = await locationRepository.findById(locationId);

  if (!location) {
    throw new Error('Location not found');
  }

  let accessToken = source.accessToken;

  if (source.refreshToken && source.expiresAt && toEpochMsBigInt(Date.now() + 300000) > source.expiresAt) {
    const refreshed = await refreshGoogleAccessToken(source.refreshToken);

    accessToken = refreshed.access_token;

    await reviewSourceRepository.updateTokens(
      source.id,
      refreshed.access_token,
      undefined,
      refreshed.expires_in ? Date.now() + refreshed.expires_in * 1000 : undefined
    );
  }

  const metadata = (source.metadata || {}) as any;

  if (!metadata.locationName) {
    throw new Error('Missing GBP locationName metadata on review source');
  }

  const rawProfile = await fetchLocationDetails(accessToken, metadata.locationName);
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
};

export const getLocationBusinessProfile = async (locationId: string) => {
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
};
