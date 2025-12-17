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

const GridListing = <T extends object>({
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
};

export default GridListing;
