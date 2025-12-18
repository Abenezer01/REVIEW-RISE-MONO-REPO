import { createContext } from 'react';

import type { Pagination } from '@platform/contracts';

import type { EmptyStateProps } from '../states';

export interface ListingContextValue<T = any> {

    // Data
    items: T[];
    pagination: Pagination | null;

    // States
    isLoading: boolean;
    error: Error | null;

    // Actions
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSearch: (query: string) => void;
    setFilters: (filters: Record<string, any>) => void;
    retry: () => void;
    refresh: () => void;

    // Config
    layout: 'table' | 'card' | 'grid' | 'masonry' | 'list';
    setLayout: (layout: string) => void;

    // State configs
    emptyStateConfig?: EmptyStateProps;

    // Component configs
    ItemViewComponent?: React.ComponentType<{ data: T }>;
    tableColumns?: any[];
    breakpoints?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
    };

    // Bulk selection
    selectedItems: Set<string | number>;
    toggleSelection: (id: string | number) => void;
    selectAll: () => void;
    clearSelection: () => void;

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

export const ListingContext = createContext<ListingContextValue | null>(null);
