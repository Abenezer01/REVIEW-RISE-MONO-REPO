import { Stack } from '@mui/material';

import { gridSpacing } from '@/configs/gridConfig';

interface ListListingProps<T> {
  items: T[];
  ItemViewComponent: React.ComponentType<{ data: T }>;
}

const ListListing = <T extends object>({ items, ItemViewComponent }: ListListingProps<T>) => {
  return (
    <Stack spacing={gridSpacing}>
      {items.map((item, index) => (
        <ItemViewComponent key={index} data={item} />
      ))}
    </Stack>
  );
};

export default ListListing;
