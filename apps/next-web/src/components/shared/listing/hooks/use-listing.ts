import { useContext } from 'react';

import { ListingContext } from '../context/listing-context';
import type { ListingContextValue } from '../context/listing-context';

/**
 * Main hook to access the listing context
 * @throws Error if used outside of ListingProvider
 */
export const useListing = <T = any>(): ListingContextValue<T> => {
    const context = useContext(ListingContext);

    if (!context) {
        throw new Error('useListing must be used within a ListingProvider');
    }

    return context as ListingContextValue<T>;
};

/**
 * Hook to access only listing actions
 * Useful for components that only need to trigger actions
 */
export const useListingActions = () => {
    const { setPage, setPageSize, setSearch, setFilters, retry, refresh } = useListing();

    return {
        setPage,
        setPageSize,
        setSearch,
        setFilters,
        retry,
        refresh
    };
};

/**
 * Hook to access only listing state
 * Useful for components that only need to read state
 */
export const useListingState = <T = any>() => {
    const { items, pagination, isLoading, error } = useListing<T>();

    return {
        items,
        pagination,
        isLoading,
        error
    };
};

/**
 * Hook to access listing configuration
 */
export const useListingConfig = () => {
    const { layout, setLayout, emptyStateConfig, ItemViewComponent, tableColumns, breakpoints, features } = useListing();

    return {
        layout,
        setLayout,
        emptyStateConfig,
        ItemViewComponent,
        tableColumns,
        breakpoints,
        features
    };
};
