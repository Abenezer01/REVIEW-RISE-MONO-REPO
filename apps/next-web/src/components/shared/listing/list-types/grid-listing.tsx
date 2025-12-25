import { memo } from 'react';

import type { GridProps, GridSize } from '@mui/material';
import { Box, Grid } from '@mui/material';

import { gridSpacing } from '@/configs/gridConfig';

interface GridListingProps<T> {
  items: T[];
  ItemViewComponent: React.ComponentType<{ data: T }>;
  spacing?: GridProps['spacing'];
  margin?: string | number;
  breakpoints?: {
    xs?: GridSize;
    sm?: GridSize;
    md?: GridSize;
    lg?: GridSize;
  };
}

const GridListing = memo(<T extends object>({
  items,
  ItemViewComponent,
  spacing = gridSpacing,
  margin = 3,
  breakpoints = { xs: 12, sm: 6, lg: 4 }
}: GridListingProps<T>) => {
  return (
    <Box sx={{ m: margin }}>
      <Grid container direction="row" spacing={spacing}>
        {items?.map((item, index) => (
          <Grid
            key={index}
            size={{
              xs: breakpoints.xs,
              sm: breakpoints.sm,
              md: breakpoints.md,
              lg: breakpoints.lg
            }}
            alignItems="stretch"
          >
            <ItemViewComponent data={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}) as <T extends object>(props: GridListingProps<T>) => React.JSX.Element;

(GridListing as any).displayName = 'GridListing';

export default GridListing;

