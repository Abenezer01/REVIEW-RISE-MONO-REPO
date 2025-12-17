import { useState } from 'react';

import { Box, Card } from '@mui/material';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { Pagination } from '@platform/contracts';

// Make T a generic type parameter
interface TableListingProps<T> {
  columns: GridColDef[];
  items: T[]; // Use T[] for items
  pagination: Pagination;
  isLoading: boolean;
  onPagination?: (pageSize: number, page: number) => void;
}

const TableListing = <T,>({ columns, items, pagination, onPagination, isLoading }: TableListingProps<T>) => {

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination?.page - 1,
    pageSize: pagination?.pageSize
  });

  const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel); // Update model unconditionally
    onPagination && onPagination(newPaginationModel.pageSize, newPaginationModel.page + 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <DataGrid
          rows={items} // Use items from state
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          pagination
          rowHeight={62}
          rowCount={pagination?.total}
          columns={columns}
          paginationMode="server"
          disableRowSelectionOnClick
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          loading={isLoading}
        />
      </Card>
    </Box>
  );
};

export default TableListing;
