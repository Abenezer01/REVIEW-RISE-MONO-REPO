/* eslint-disable import/no-unresolved */
import { Fragment, useState, useMemo, useCallback, lazy, Suspense } from 'react';

import type { GridSize } from '@mui/material';
import { Container, useMediaQuery } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';


import type { GetRequestParams, Pagination } from '@platform/contracts';

import { defaultGetRequestParams } from '@platform/contracts';

import type { CreateActionConfig, ExportConfigValues, ExportFieldOption } from '@/types/general/listing';
import { defaultCreateActionConfig } from '@/types/general/listing';



import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig';
import PaginationComponent from '../pagination';

import ListHeader from './header';
import type { EmptyStateProps } from './states';
import { EmptyState, ErrorState, SkeletonCard, SkeletonGrid, SkeletonTable } from './states';

// Lazy load list type components for better code splitting
const GridListing = lazy(() => import('./list-types/grid-listing'));
const ListListing = lazy(() => import('./list-types/list-listing'));
const MasonryListing = lazy(() => import('./list-types/masonry-listing'));
const TableListing = lazy(() => import('./list-types/table-listing'));


const ItemsListing = <T extends object>({
  items,
  pagination,
  fetchDataFunction,
  ItemViewComponent,
  title,

  isLoading = false,
  type = ITEMS_LISTING_TYPE.grid.value,
  onPaginationChange,
  additionalParams = {},
  tableProps,
  hasListHeader = true,
  hasFilter = false,
  hasSearch = false,
  FilterComponentItems,
  searchKeys = [],
  createActionConfig = defaultCreateActionConfig,
  features = {},
  breakpoints,
  error,
  onRetry,
  emptyStateConfig,
  showEmptyTable
}: {
  items: T[];
  pagination?: Pagination | null;
  fetchDataFunction?: any;
  ItemViewComponent?: React.ComponentType<{ data: T }>;
  title?: string;
  baseUrl?: string;
  isLoading?: boolean;
  type?: string;
  onPaginationChange?: (pageSize: any, page: any) => void;
  additionalParams?: any | null;
  onCreateClick?: () => void;
  tableProps?: {
    headers: GridColDef[];
    getRowClassName?: (params: any) => string;
    onRowClick?: (params: any) => void;
  };
  hasCreate?: boolean;
  hasFilter?: boolean;
  hasSearch?: boolean;
  FilterComponentItems?: React.ComponentType<any>;
  searchKeys?: string[];
  hasListHeader?: boolean;
  createActionConfig: CreateActionConfig;
  features?: {
    filter?: {
      enabled: boolean;
      onFilter: (values: Record<string, any>) => void;
      permission: {
        action: string;
        subject: string;
      };
      component?: React.ComponentType<any>;
    };
    search?: {
      enabled: boolean;
      onSearch: (searchTerm: string, searchKeys: string[]) => void;
      searchKeys: string[],
      permission: {
        action: string;
        subject: string;
      };
      component?: React.ComponentType<any>;
      placeholder?: string;
    };
    export?: {
      enabled: boolean;
      onExport?: (exportConfig: {
        export: ExportConfigValues;
      }) => Promise<void>;
      availableFields?: ExportFieldOption[];
      permission: {
        action: string;
        subject: string;
      };
    };
  };
  breakpoints?: {
    xs?: GridSize;
    sm?: GridSize;
    md?: GridSize;
    lg?: GridSize;
  };
  error?: Error | null;
  onRetry?: () => void;
  emptyStateConfig?: EmptyStateProps;
  showEmptyTable?: boolean;
}) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const [fetchRequestParams, setFetchRequestParams] = useState<GetRequestParams>(defaultGetRequestParams);

  // Memoize pagination handler to prevent unnecessary re-renders
  const onPagination = useMemo(
    () =>
      onPaginationChange ||
      ((pageSize: any, page: any) => {
        const fetchParam: GetRequestParams = {
          ...fetchRequestParams,
          ...additionalParams,
          pagination: { pageSize: pageSize, page: page }
        };

        fetchDataFunction(fetchParam);
      }),
    [onPaginationChange, fetchRequestParams, additionalParams, fetchDataFunction]
  );

  // Memoize filter handler
  const handleFilter = useCallback((values: { [key: string]: any }) => {
    setFetchRequestParams((prev) => ({ ...prev, filter: values }));
    fetchDataFunction({ ...fetchRequestParams, filter: values });
  }, [fetchDataFunction, fetchRequestParams]);

  // Memoize adjusted type calculation
  const adjustedType = useMemo(() => getAdjustedListingType(type, isSmallScreen), [type, isSmallScreen]);

  // Memoize listing components to prevent recreation on every render
  const listingComponents = useMemo(() => ({
    [ITEMS_LISTING_TYPE.masonry.value]: ItemViewComponent && (
      <Suspense fallback={<SkeletonCard count={4} />}>
        <MasonryListing ItemViewComponent={ItemViewComponent as any} items={items} />
      </Suspense>
    ),
    [ITEMS_LISTING_TYPE.list.value]: ItemViewComponent && (
      <Suspense fallback={<SkeletonCard count={4} />}>
        <ListListing ItemViewComponent={ItemViewComponent as any} items={items} />
      </Suspense>
    ),
    [ITEMS_LISTING_TYPE.grid.value]: ItemViewComponent && (
      <Suspense fallback={<SkeletonGrid count={6} columns={breakpoints as any} />}>
        <GridListing ItemViewComponent={ItemViewComponent as any} items={items} breakpoints={breakpoints} />
      </Suspense>
    ),
    [ITEMS_LISTING_TYPE.table.value]: tableProps?.headers && (
      <Suspense fallback={<SkeletonTable rows={5} columns={tableProps?.headers?.length || 4} />}>
        <TableListing
          isLoading={isLoading}
          pagination={pagination as Pagination}
          onPagination={onPagination}
          items={items}
          columns={tableProps?.headers}
          getRowClassName={tableProps?.getRowClassName}
          onRowClick={tableProps?.onRowClick}
        />
      </Suspense>
    ),
    default: ItemViewComponent && (
      <Suspense fallback={<SkeletonGrid count={6} columns={breakpoints as any} />}>
        <GridListing ItemViewComponent={ItemViewComponent as any} items={items} />
      </Suspense>
    )
  }), [ItemViewComponent, items, breakpoints, tableProps, isLoading, pagination, onPagination]);

  return (
    <>
      {hasListHeader && (
        <ListHeader
          createActionConfig={createActionConfig}
          hasFilter={hasFilter}
          FilterComponentItems={FilterComponentItems}
          handleFilter={handleFilter}
          hasSearch={hasSearch}
          searchKeys={searchKeys}
          title={title || ''}
          features={features}
        />
      )}

      {error ? (
        <ErrorState
          message={error.message || 'An error occurred while loading data'}
          onRetry={onRetry}
          showDetails={process.env.NODE_ENV === 'development'}
          details={error.stack}
        />
      ) : isLoading ? (
        <>
          {adjustedType === ITEMS_LISTING_TYPE.table.value && <SkeletonTable rows={5} columns={tableProps?.headers?.length || 4} />}
          {adjustedType === ITEMS_LISTING_TYPE.grid.value && <SkeletonGrid count={6} columns={breakpoints as any} />}
          {(adjustedType === ITEMS_LISTING_TYPE.list.value || adjustedType === ITEMS_LISTING_TYPE.masonry.value) && <SkeletonCard count={4} />}
        </>
      ) : (
        Array.isArray(items) && (
          <Fragment>
            {items.length === 0 && !showEmptyTable ? (
              <EmptyState
                title={emptyStateConfig?.title}
                description={emptyStateConfig?.description}
                action={emptyStateConfig?.action}
                illustration={emptyStateConfig?.illustration}
                icon={emptyStateConfig?.icon}
              />
            ) : (
              <>
                {listingComponents[adjustedType] || listingComponents.default}
                {adjustedType !== ITEMS_LISTING_TYPE.table.value && pagination && (
                  <Container>
                    <PaginationComponent onPaginationChange={onPagination} pagination={pagination} />
                  </Container>
                )}
              </>
            )}
          </Fragment>
        )
      )}
    </>
  );
};

const getAdjustedListingType = (type: string, isSmallScreen: boolean) => {
  if (type === ITEMS_LISTING_TYPE.table.value && isSmallScreen) {
    return ITEMS_LISTING_TYPE.list.value;
  }


  return type;
};

export default ItemsListing;
