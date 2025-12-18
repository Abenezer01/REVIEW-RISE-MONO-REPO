import type { ListingItemAdapter } from '@/types/general/listing-item';

import { createStatus, createAction, createBatchAdapter } from './adapter-utils';

/**
 * Location type (from your API/database)
 */
interface Location {
    id: number;
    name: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    status: 'active' | 'inactive' | 'pending';
    businessId?: number;
    businessName?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Adapter to transform Location to ListingItem
 */
export const adaptLocationToListingItem: ListingItemAdapter<Location> = (location) => {
    // Determine status color based on location status
    const statusConfig = {
        active: createStatus('Active', 'success'),
        inactive: createStatus('Inactive', 'error'),
        pending: createStatus('Pending', 'warning')
    };

    // Build full address for secondary label
    const fullAddress = [
        location.address,
        location.city,
        location.state,
        location.zipCode
    ].filter(Boolean).join(', ');

    return {
        id: location.id,
        primaryLabel: location.name,
        secondaryLabel: fullAddress || location.address,
        tertiaryLabel: (location as any).business?.name || location.businessName,
        status: statusConfig[location.status],
        meta: {
            businessId: location.businessId,
            createdAt: location.createdAt,
            updatedAt: location.updatedAt
        },
        actions: [
            createAction(
                'Edit',
                () => {
                    // Will be provided by parent component
                    console.log('Edit location', location.id);
                },
                {
                    permission: { action: 'update', subject: 'Location' },
                    variant: 'secondary'
                }
            ),
            createAction(
                'Delete',
                () => {
                    // Will be provided by parent component
                    console.log('Delete location', location.id);
                },
                {
                    permission: { action: 'delete', subject: 'Location' },
                    variant: 'danger'
                }
            )
        ]
    };
};

/**
 * Batch adapter for multiple locations
 */
export const adaptLocationsToListingItems = createBatchAdapter(adaptLocationToListingItem);

/**
 * Factory function to create location adapter with custom action handlers
 */
export const createLocationAdapter = (
    onEdit: (id: number) => void,
    onDelete: (id: number) => void
): ListingItemAdapter<Location> => {
    return (location) => {
        const baseItem = adaptLocationToListingItem(location);

        return {
            ...baseItem,
            actions: [
                createAction(
                    'Edit',
                    () => onEdit(location.id),
                    {
                        permission: { action: 'update', subject: 'Location' },
                        variant: 'secondary',
                        icon: 'tabler-edit'
                    }
                ),
                createAction(
                    'Delete',
                    () => onDelete(location.id),
                    {
                        permission: { action: 'delete', subject: 'Location' },
                        variant: 'danger',
                        icon: 'tabler-trash'
                    }
                )
            ]
        };
    };
};
