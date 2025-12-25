import { memo } from 'react';

import { Masonry } from '@mui/lab';

interface MasonryListingProps<T> {
  items: T[];
  ItemViewComponent: React.ComponentType<{ data: T }>;
}

const MasonryListing = memo(<T extends object>({ items, ItemViewComponent }: MasonryListingProps<T>) => {
  return (
    <Masonry columns={{ xs: 1, sm: 2, lg: 4, xl: 4 }} spacing={2}>
      {items.map((item, index) => (
        <ItemViewComponent key={index} data={item} />
      ))}
    </Masonry>
  );
}) as <T extends object>(props: MasonryListingProps<T>) => React.JSX.Element;

(MasonryListing as any).displayName = 'MasonryListing';

export default MasonryListing;

