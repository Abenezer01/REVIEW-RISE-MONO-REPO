import { Fragment, useState } from 'react';

import type { GridSize } from '@mui/material';
import { Container, Typography, useMediaQuery } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';


import type { GetRequestParams, Pagination } from '@platform/contracts';

import { defaultGetRequestParams } from '@platform/contracts';

import type { CreateActionConfig } from '@/types/general/listing';
import { defaultCreateActionConfig } from '@/types/general/listing';



import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig';
import { useTranslation } from '@/hooks/useTranslation';
import PaginationComponent from '../pagination';
import type { ExportConfigValues, ExportFieldOption } from "./export";
import ListHeader from './header';
import GridListing from './list-types/grid-listing';
import ListListing from './list-types/list-listing';
import MasonryListing from './list-types/masonry-listing';
import TableListing from './list-types/table-listing';


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
  breakpoints
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
}) => {
  const t = useTranslation();
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

      {isLoading ? (
        <Typography variant="h6" align="center" sx={{ m: 5 }}>
          {t('common.loading')}
        </Typography>
      ) : (
        Array.isArray(items) && (
          <Fragment>
            {items.length === 0 ? (
              <Typography variant="h6" align="center" sx={{ m: 5 }}>
                No items available
              </Typography>
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
