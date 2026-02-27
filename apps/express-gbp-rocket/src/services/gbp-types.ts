export type NormalizedGbpProfile = {
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

export type SnapshotCaptureType = 'sync' | 'manual';

export type SnapshotListItem = {
    id: string;
    captureType: string;
    changedFields: string[];
    auditLogId: string | null;
    suggestionRefs: any;
    capturedAt: Date;
    diffBaseSnapshotId: string | null;
};

export type SnapshotDetail = SnapshotListItem & {
    snapshot: any;
};

export const normalizeGbpProfile = (raw: any): NormalizedGbpProfile => {
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
