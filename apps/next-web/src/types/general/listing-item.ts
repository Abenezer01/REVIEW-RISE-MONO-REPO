import type { AbilityRule } from './permission';

/**
 * Status configuration for listing items
 */
export interface ListingItemStatus {
    label: string;
    color: 'success' | 'warning' | 'error' | 'info' | 'default';
    variant?: 'filled' | 'outlined' | 'soft';
}

/**
 * Action configuration for listing items
 */
export interface ListingItemAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void | Promise<void>;
    permission?: AbilityRule;
    variant?: 'primary' | 'secondary' | 'danger' | 'text';
    disabled?: boolean;
    loading?: boolean;
}

/**
 * Standardized listing item interface
 * All domain models should be adapted to this shape for consistent rendering
 */
export interface ListingItem {
    // Core identification
    id: string | number;

    // Display labels
    primaryLabel: string;
    secondaryLabel?: string;
    tertiaryLabel?: string;

    // Visual indicators
    status?: ListingItemStatus;
    avatar?: {
        src?: string;
        alt?: string;
        fallback?: string;
        color?: string;
    };

    // Additional data
    meta?: Record<string, any>;
    tags?: string[];

    // Actions
    actions?: ListingItemAction[];

    // Navigation
    href?: string;
    onClick?: () => void;
}

/**
 * Adapter function type
 * Transforms a domain model to a ListingItem
 */
export type ListingItemAdapter<T> = (item: T) => ListingItem;

/**
 * Batch adapter function type
 * Transforms an array of domain models to ListingItems
 */
export type ListingItemBatchAdapter<T> = (items: T[]) => ListingItem[];
