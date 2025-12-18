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
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f9fafb' : '#1f2937'),
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f3f4f6' : '#374151'),
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease-in-out'
                            }
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            '&[data-field="name"]': {
                                color: 'text.primary',
                                fontWeight: 600
                            }
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                            '& .MuiTablePagination-root': {
                                color: 'text.secondary'
                            }
                        }
                    }}
                    {...props}
                />
            </Card>
        </Box>
    );
};

export default DataTable;
