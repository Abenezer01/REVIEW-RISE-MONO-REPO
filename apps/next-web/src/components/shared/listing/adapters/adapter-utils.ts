import type { ListingItem, ListingItemAdapter, ListingItemBatchAdapter } from '@/types/general/listing-item';

/**
 * Creates a batch adapter from a single-item adapter
 */
export const createBatchAdapter = <T>(
    adapter: ListingItemAdapter<T>
): ListingItemBatchAdapter<T> => {
    return (items: T[]) => items.map(adapter);
};

/**
 * Utility to create a status object
 */
export const createStatus = (
    label: string,
    color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default',
    variant: 'filled' | 'outlined' | 'soft' = 'filled'
) => ({
    label,
    color,
    variant
});

/**
 * Utility to create an action object
 */
export const createAction = (
    label: string,
    onClick: () => void | Promise<void>,
    options?: {
        icon?: React.ReactNode;
        permission?: { action: string; subject: string };
        variant?: 'primary' | 'secondary' | 'danger' | 'text';
        disabled?: boolean;
        loading?: boolean;
    }
) => ({
    label,
    onClick,
    ...options
});

/**
 * Utility to create an avatar object
 */
export const createAvatar = (
    options: {
        src?: string;
        alt?: string;
        fallback?: string;
        color?: string;
    }
) => options;
