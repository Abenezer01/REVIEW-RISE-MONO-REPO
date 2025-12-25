import { memo } from 'react';

import { Card, CardContent, Skeleton, Stack } from '@mui/material';

interface SkeletonCardProps {
    count?: number;
}

export const SkeletonCard = memo(({ count = 6 }: SkeletonCardProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Skeleton variant="text" width="40%" height={24} />
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="rectangular" width="100%" height={60} />
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Skeleton variant="rectangular" width={80} height={36} />
                                <Skeleton variant="rectangular" width={80} height={36} />
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </>
    );
});

SkeletonCard.displayName = 'SkeletonCard';

