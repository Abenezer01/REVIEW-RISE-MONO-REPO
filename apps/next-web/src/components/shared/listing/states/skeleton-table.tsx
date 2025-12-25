import { memo } from 'react';

import { Skeleton, TableBody, TableCell, TableContainer, TableRow, Table } from '@mui/material';

interface SkeletonTableProps {
    rows?: number;
    columns?: number;
}

export const SkeletonTable = memo(({ rows = 5, columns = 4 }: SkeletonTableProps) => {
    return (
        <TableContainer>
            <Table>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton variant="text" width={colIndex === 0 ? '60%' : '80%'} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

SkeletonTable.displayName = 'SkeletonTable';

