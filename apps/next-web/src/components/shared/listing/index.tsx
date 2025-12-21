/* eslint-disable import/no-unresolved */
import { Fragment, useState } from 'react';

import type { GridSize } from '@mui/material';
import { Container, useMediaQuery } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';


import type { GetRequestParams, Pagination } from '@platform/contracts';

import { defaultGetRequestParams } from '@platform/contracts';

import type { CreateActionConfig , ExportConfigValues, ExportFieldOption } from '@/types/general/listing';
import { defaultCreateActionConfig } from '@/types/general/listing';



import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig';
import PaginationComponent from '../pagination';

import ListHeader from './header';
import GridListing from './list-types/grid-listing';
import ListListing from './list-types/list-listing';
import MasonryListing from './list-types/masonry-listing';
import TableListing from './list-types/table-listing';
import type { EmptyStateProps } from './states';
import { EmptyState, ErrorState, SkeletonCard, SkeletonGrid, SkeletonTable } from './states';


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
  emptyStateConfig
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
}) => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const [fetchRequestParams, setFetchRequestParams] = useState<GetRequestParams>(defaultGetRequestParams);

  const onPagination =
    onPaginationChange ||
    ((pageSize: any, page: any) => {
      const fetchParam: GetRequestParams = {
        ...fetchRequestParams,
        ...additionalParams,
        pagination: { pageSize: pageSize, page: page }
      };

      fetchDataFunction(fetchParam);
    });

  const handleFilter = (values: { [key: string]: any }) => {
    setFetchRequestParams({ ...fetchRequestParams, filter: values });
    fetchDataFunction({ ...fetchRequestParams, filter: values });
  };

  const adjustedType = getAdjustedListingType(type, isSmallScreen);

  const listingComponents = {
    [ITEMS_LISTING_TYPE.masonry.value]: ItemViewComponent && <MasonryListing ItemViewComponent={ItemViewComponent} items={items} />,
    [ITEMS_LISTING_TYPE.list.value]: ItemViewComponent && <ListListing ItemViewComponent={ItemViewComponent} items={items} />,
    [ITEMS_LISTING_TYPE.grid.value]: ItemViewComponent && (
      <GridListing ItemViewComponent={ItemViewComponent} items={items} breakpoints={breakpoints} />
    ),
    [ITEMS_LISTING_TYPE.table.value]: tableProps?.headers && (
      <TableListing
        isLoading={isLoading}
        pagination={pagination as Pagination}
        onPagination={onPagination}
        items={items}
        columns={tableProps?.headers}
        getRowClassName={tableProps?.getRowClassName}
        onRowClick={tableProps?.onRowClick}
      />
    ),
    default: ItemViewComponent && <GridListing ItemViewComponent={ItemViewComponent} items={items} />
  };

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
            {items.length === 0 ? (
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
