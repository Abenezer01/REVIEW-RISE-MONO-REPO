import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import type { GridColDef, GridPaginationModel, DataGridProps } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';

export interface PaginationModel {
    page: number;
    pageSize: number;
    total: number;
}

interface DataTableProps<T> extends Omit<DataGridProps, 'rows' | 'columns' | 'pagination'> {
    columns: GridColDef[];
    data: T[];
    pagination?: PaginationModel;
    onPaginationChange?: (model: PaginationModel) => void;
    loading?: boolean;
}

const DataTable = <T extends { id: string | number }>({
    columns,
    data,
    pagination,
    onPaginationChange,
    loading = false,
    ...props
}: DataTableProps<T>) => {

    const paginationModel = React.useMemo(() => ({
        page: pagination ? pagination.page - 1 : 0,
        pageSize: pagination ? pagination.pageSize : 10,
    }), [pagination]);

    const handlePaginationModelChange = (model: GridPaginationModel) => {
        if (onPaginationChange && pagination) {
            onPaginationChange({
                page: model.page + 1,
                pageSize: model.pageSize,
                total: pagination.total
            });
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Card>
                <DataGrid
                    rows={data}
                    columns={columns}
                    loading={loading}
                    pagination
                    paginationMode="server"
                    rowCount={pagination?.total || 0}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationModelChange}
                    pageSizeOptions={[5, 10, 25, 50]}
                    autoHeight
                    disableRowSelectionOnClick
                    {...props}
                />
            </Card>
        </Box>
    );
};

export default DataTable;
