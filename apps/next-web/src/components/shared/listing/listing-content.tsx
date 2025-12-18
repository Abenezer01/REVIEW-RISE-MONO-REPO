import { Fragment } from 'react';

import { Container, useMediaQuery } from '@mui/material';

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig';
import PaginationComponent from '../pagination';
import { SkeletonTable, SkeletonCard, SkeletonGrid, EmptyState, ErrorState } from './states';
import GridListing from './list-types/grid-listing';
import ListListing from './list-types/list-listing';
import MasonryListing from './list-types/masonry-listing';
import TableListing from './list-types/table-listing';
import { useListing, useListingState, useListingConfig } from './hooks';

/**
 * Context-aware listing content component
 * Uses context when available, falls back to props
 */
export const ListingContent = () => {
    const isSmallScreen = useMediaQuery('(max-width:600px)');

    // Get data from context
    const { items, pagination, isLoading, error } = useListingState();
    const { layout, emptyStateConfig, ItemViewComponent, tableColumns, breakpoints } = useListingConfig();
    const { retry, setPage, setPageSize } = useListing();

    const adjustedType = getAdjustedListingType(layout, isSmallScreen);

    // Error state
    if (error) {
        return (
            <ErrorState
                message={error.message || 'An error occurred while loading data'}
                onRetry={retry}
                showDetails={process.env.NODE_ENV === 'development'}
                details={error.stack}
            />
        );
    }

    // Loading state with skeletons
    if (isLoading) {
        return (
            <>
                {adjustedType === ITEMS_LISTING_TYPE.table.value && <SkeletonTable rows={5} columns={tableColumns?.length || 4} />}
                {adjustedType === ITEMS_LISTING_TYPE.grid.value && <SkeletonGrid count={6} columns={breakpoints} />}
                {(adjustedType === ITEMS_LISTING_TYPE.list.value || adjustedType === ITEMS_LISTING_TYPE.masonry.value) && <SkeletonCard count={4} />}
            </>
        );
    }

    // Empty state
    if (!Array.isArray(items) || items.length === 0) {
        return (
            <EmptyState
                title={emptyStateConfig?.title}
                description={emptyStateConfig?.description}
                action={emptyStateConfig?.action}
                illustration={emptyStateConfig?.illustration}
            />
        );
    }

    // Render listing based on layout type
    const listingComponents = {
        [ITEMS_LISTING_TYPE.masonry.value]: ItemViewComponent && <MasonryListing ItemViewComponent={ItemViewComponent} items={items} />,
        [ITEMS_LISTING_TYPE.list.value]: ItemViewComponent && <ListListing ItemViewComponent={ItemViewComponent} items={items} />,
        [ITEMS_LISTING_TYPE.grid.value]: ItemViewComponent && <GridListing ItemViewComponent={ItemViewComponent} items={items} breakpoints={breakpoints} />,
        [ITEMS_LISTING_TYPE.table.value]: tableColumns && (
            <TableListing
                isLoading={isLoading}
                pagination={pagination!}
                onPagination={(pageSize, page) => {
                    setPageSize(pageSize);
                    setPage(page);
                }}
                items={items}
                columns={tableColumns}
            />
        ),
        default: ItemViewComponent && <GridListing ItemViewComponent={ItemViewComponent} items={items} />
    };

    return (
        <Fragment>
            {listingComponents[adjustedType] || listingComponents.default}
            {adjustedType !== ITEMS_LISTING_TYPE.table.value && pagination && (
                <Container>
                    <PaginationComponent
                        onPaginationChange={(pageSize, page) => {
                            setPageSize(pageSize);
                            setPage(page);
                        }}
                        pagination={pagination}
                    />
                </Container>
            )}
        </Fragment>
    );
};

const getAdjustedListingType = (type: string, isSmallScreen: boolean) => {
    if (type === ITEMS_LISTING_TYPE.table.value && isSmallScreen) {
        return ITEMS_LISTING_TYPE.list.value;
    }


    return type;
};
