import { memo } from 'react';

import Grid from '@mui/material/Grid';
import { Card, CardContent, Skeleton, Stack } from '@mui/material';

interface SkeletonGridProps {
    count?: number;
    columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export const SkeletonGrid = memo(({
    count = 6,
    columns = { xs: 12, sm: 6, md: 4, lg: 3 }
}: SkeletonGridProps) => {
    return (
        <Grid container spacing={3}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid key={index} size={columns}>
                    <Card>
                        <CardContent>
                            <Stack spacing={1.5}>
                                <Skeleton variant="rectangular" width="100%" height={140} />
                                <Skeleton variant="text" width="70%" height={24} />
                                <Skeleton variant="text" width="90%" height={20} />
                                <Skeleton variant="text" width="50%" height={20} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
});

SkeletonGrid.displayName = 'SkeletonGrid';

