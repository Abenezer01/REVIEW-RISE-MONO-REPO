import React, { Fragment } from 'react';

import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';

interface CustomTablePaginationProps {
  onPaginationChange: (pageSize: number, page: number) => void;
  pagination: {
    pageSize: number;
    page: number;
    total?: number;
    lastPage?: number;
  } | null;
}

const CustomTablePagination: React.FC<CustomTablePaginationProps> = ({ onPaginationChange, pagination }) => {
  // Use props directly, fallback to defaults
  const page = (pagination?.page || 1) - 1; // Convert 1-indexed to 0-indexed for MUI
  const rowsPerPage = pagination?.pageSize || 10;

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    if (pagination?.pageSize) {
      onPaginationChange(pagination.pageSize, newPage + 1); // Convert 0-indexed to 1-indexed
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);

    onPaginationChange(newRowsPerPage, 1); // Reset to first page
  };

  const totalRows = pagination?.total || 0;

  return totalRows >= rowsPerPage ? (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
    >
      <Typography sx={{ mr: 2, whiteSpace: 'nowrap' }}>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Items per page"
        />
      </Typography>
    </div>
  ) : (
    <Fragment></Fragment>
  );
};

export default CustomTablePagination;
