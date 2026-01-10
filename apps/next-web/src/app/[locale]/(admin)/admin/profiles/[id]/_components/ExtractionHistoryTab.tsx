/* eslint-disable import/no-unresolved */
import React, { useMemo } from 'react';

import { Card, CardContent, Typography, Chip, Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { formatDynamicDate } from '@platform/utils';

import { ListingProvider, ListingContent } from '@/components/shared/listing/listing';

interface ExtractionHistoryTabProps {
  historyVersions: any[];
}

const ExtractionHistoryTab: React.FC<ExtractionHistoryTabProps> = ({ historyVersions }) => {
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'versionNumber',
      headerName: 'Version',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="700">
          v{params.value}
        </Typography>
      )
    },
    {
      field: 'id',
      headerName: 'ID',
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography 
            variant="body2" 
            noWrap
            sx={{ 
              fontFamily: 'monospace', 
              color: 'text.secondary', 
              fontSize: '0.75rem',
              maxWidth: '100%'
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Extracted At',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDynamicDate(params.value, 'MMM DD, YYYY HH:mm')}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: () => (
        <Chip label="Completed" size="small" color="success" variant="outlined" />
      )
    }
  ], []);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <ListingProvider
          items={historyVersions || []}
          initialLayout="table"
          tableColumns={columns}
        >
          <ListingContent />
        </ListingProvider>
      </CardContent>
    </Card>
  );
};

export default ExtractionHistoryTab;
