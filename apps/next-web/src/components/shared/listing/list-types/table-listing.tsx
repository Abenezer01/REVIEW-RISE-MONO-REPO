import { useState, useMemo, memo } from 'react';

import { Box, Card } from '@mui/material';
import type { GridColDef, GridPaginationModel, GridRowParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { Pagination } from '@platform/contracts';

// Make T a generic type parameter
interface TableListingProps<T> {
  columns: GridColDef[];
  items: T[]; // Use T[] for items
  pagination: Pagination;
  isLoading: boolean;
  onPagination?: (pageSize: number, page: number) => void;
  getRowClassName?: (params: any) => string;
  onRowClick?: (params: GridRowParams) => void;
}

const TableListing = memo(<T,>({ columns, items, pagination, onPagination, isLoading, getRowClassName, onRowClick }: TableListingProps<T>) => {

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination?.page - 1,
    pageSize: pagination?.pageSize
  });

  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel); // Update model unconditionally
    onPagination && onPagination(newPaginationModel.pageSize, newPaginationModel.page + 1);
  };

  // Memoize index column to prevent recreation
  const indexColumn: GridColDef = useMemo(() => ({
    field: 'rowNumber',
    headerName: '#',
    width: 70,
    sortable: false,
    renderCell: (params) => {
      // Calculate global index based on pagination
      const currentRowIndex = items.findIndex((item: any) => item.id === params.row.id);

      
return (pagination?.page - 1) * pagination?.pageSize + currentRowIndex + 1;
    }
  }), [items, pagination]);

  // Memoize all columns to prevent recreation
  const allColumns = useMemo(() => [indexColumn, ...columns], [indexColumn, columns]);

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      <Card sx={{ borderRadius: 1.5, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <DataGrid
          rows={items}
          pageSizeOptions={[5, 10, 25, 50]}
          autoHeight
          pagination
          rowHeight={64}
          rowCount={pagination?.total}
          columns={allColumns}
          paginationMode="server"
          disableRowSelectionOnClick
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          loading={isLoading}
          getRowClassName={getRowClassName}
          onRowClick={onRowClick}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: (theme) => theme.palette.background.default,
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.17px',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              color: 'text.primary',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              alignContent: 'center',
              '&:focus': {
                outline: 'none'
              }
            },
            '& .MuiDataGrid-row': {
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
                transition: 'background-color 0.2s ease-in-out',
              }
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiTablePagination-root': {
                color: 'text.secondary'
              }
            },

            // Remove cell focus outline
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none'
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none'
            }
          }}
        />
      </Card>
    </Box>
  );
}) as <T>(props: TableListingProps<T>) => React.JSX.Element;

(TableListing as any).displayName = 'TableListing';

export default TableListing;

