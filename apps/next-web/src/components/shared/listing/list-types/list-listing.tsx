import { memo } from 'react';

import { Stack } from '@mui/material';

import { gridSpacing } from '@/configs/gridConfig';

interface ListListingProps<T> {
  items: T[];
  ItemViewComponent: React.ComponentType<{ data: T }>;
}

const ListListing = memo(<T extends object>({ items, ItemViewComponent }: ListListingProps<T>) => {
  return (
    <Stack spacing={gridSpacing}>
      {items.map((item, index) => (
        <ItemViewComponent key={index} data={item} />
      ))}
    </Stack>
  );
}) as <T extends object>(props: ListListingProps<T>) => React.JSX.Element;

(ListListing as any).displayName = 'ListListing';

export default ListListing;

