import React, { useState, useCallback, useMemo } from 'react';

import type { Pagination } from '@platform/contracts';

import { ListingContext } from './listing-context';
import type { EmptyStateProps } from '../states';

export interface ListingProviderProps<T = any> {
    children: React.ReactNode;

    // Data
    items: T[];
    pagination?: Pagination | null;

    // States
    isLoading?: boolean;
    error?: Error | null;

    // Callbacks
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    onSearch?: (query: string) => void;
    onFilter?: (filters: Record<string, any>) => void;
    onRetry?: () => void;
    onRefresh?: () => void;

    // Config
    initialLayout?: 'table' | 'card' | 'grid' | 'masonry' | 'list';
    emptyStateConfig?: EmptyStateProps;

    // Component configs
    ItemViewComponent?: React.ComponentType<{ data: any }>;
    tableColumns?: any[];
    breakpoints?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
    };

    // Features
    features?: {
        filter?: {
            enabled: boolean;
            onFilter: (values: Record<string, any>) => void;
            permission: { action: string; subject: string };
            component?: React.ComponentType<any>;
        };
        search?: {
            enabled: boolean;
            onSearch: (searchTerm: string, searchKeys: string[]) => void;
            searchKeys: string[];
            permission: { action: string; subject: string };
        };
        export?: {
            enabled: boolean;
            onExport?: (exportConfig: any) => Promise<void>;
            availableFields?: any[];
            permission: { action: string; subject: string };
        };
    };
}

export const ListingProvider = <T extends object>({
    children,
    items,
    pagination = null,
    isLoading = false,
    error = null,
    onPageChange,
    onPageSizeChange,
    onSearch,
    onFilter,
    onRetry,
    onRefresh,
    initialLayout = 'table',
    emptyStateConfig,
    ItemViewComponent,
    tableColumns,
    breakpoints,
    features
}: ListingProviderProps<T>) => {
    const [layout, setLayout] = useState<'table' | 'card' | 'grid' | 'masonry' | 'list'>(initialLayout);
    const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

    const setPage = useCallback((page: number) => {
        onPageChange?.(page);
    }, [onPageChange]);

    const setPageSize = useCallback((size: number) => {
        onPageSizeChange?.(size);
    }, [onPageSizeChange]);

    const setSearch = useCallback((query: string) => {
        onSearch?.(query);
    }, [onSearch]);

    const setFilters = useCallback((filters: Record<string, any>) => {
        onFilter?.(filters);
    }, [onFilter]);

    const retry = useCallback(() => {
        onRetry?.();
    }, [onRetry]);

    const refresh = useCallback(() => {
        onRefresh?.();
    }, [onRefresh]);

    const handleSetLayout = useCallback((newLayout: string) => {
        setLayout(newLayout as 'table' | 'card' | 'grid' | 'masonry' | 'list');
    }, []);

    const toggleSelection = useCallback((id: string | number) => {
        setSelectedItems(prev => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            
return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        const allIds = items.map((item: any) => item.id);

        setSelectedItems(new Set(allIds));
    }, [items]);

    const clearSelection = useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    const value = useMemo(() => ({
        items,
        pagination,
        isLoading,
        error,
        setPage,
        setPageSize,
        setSearch,
        setFilters,
        retry,
        refresh,
        layout,
        setLayout: handleSetLayout,
        emptyStateConfig,
        ItemViewComponent,
        tableColumns,
        breakpoints,
        features,
        selectedItems,
        toggleSelection,
        selectAll,
        clearSelection
    }), [
        items,
        pagination,
        isLoading,
        error,
        setPage,
        setPageSize,
        setSearch,
        setFilters,
        retry,
        refresh,
        layout,
        handleSetLayout,
        emptyStateConfig,
        ItemViewComponent,
        tableColumns,
        breakpoints,
        features,
        selectedItems,
        toggleSelection,
        selectAll,
        clearSelection
    ]);

    return (
        <ListingContext.Provider value={value}>
            {children}
        </ListingContext.Provider>
    );
};
