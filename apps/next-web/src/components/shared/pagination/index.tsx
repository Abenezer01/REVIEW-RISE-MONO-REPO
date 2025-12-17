import React, { Fragment, useState } from 'react';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pagination?.pageSize || 10);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);

    if (pagination?.pageSize) {
      onPaginationChange(pagination.pageSize, newPage + 1); // Adjust page number (+1) to match your backend's page numbering
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);

    setRowsPerPage(newRowsPerPage);
    setPage(0);

    if (pagination?.pageSize) {
      onPaginationChange(newRowsPerPage, 1); // Reset to the first page when changing rows per page
    }
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
