/* eslint-disable import/no-unresolved */
import React, { useMemo } from 'react';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tooltip,
  Avatar,
  Stack,
  CircularProgress
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

import { formatDynamicDate } from '@platform/utils';

import { ListingProvider, ListingContent } from '@/components/shared/listing/listing';

interface AuditLogTabProps {
  logs: any[];
  isLoading?: boolean;
}

const getActionColor = (action: string) => {
  if (action.includes('FAILED')) return 'error';
  if (action.includes('COMPLETED') || action.includes('CONFIRM') || action.includes('SUCCESS')) return 'success';
  if (action.includes('STARTED')) return 'info';
  if (action.includes('UPDATE')) return 'warning';

  return 'default';
};

const getActionIcon = (action: string) => {
  if (action.includes('UPDATE')) return <EditIcon sx={{ fontSize: 16 }} />;
  if (action.includes('RE_EXTRACT')) return <RefreshIcon sx={{ fontSize: 16 }} />;
  if (action.includes('CONFIRM')) return <CheckIcon sx={{ fontSize: 16 }} />;
  if (action.includes('FAILED')) return <ErrorIcon sx={{ fontSize: 16 }} />;

  return <HistoryIcon sx={{ fontSize: 16 }} />;
};

const formatActionName = (action: string) => {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs, isLoading }) => {
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'action',
      headerName: 'Action',
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {getActionIcon(params.value)}
          <Typography variant="body2" fontWeight="700">
            {formatActionName(params.value)}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      renderCell: (params) => {
        const user = params.value;

        if (!user) return <Typography variant="body2" color="text.secondary">System</Typography>;

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={user.image}
              sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
            >
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </Avatar>
            <Typography variant="body2" noWrap>
              {user.name || user.email}
            </Typography>
          </Stack>
        );
      }
    },
    {
      field: 'details',
      headerName: 'Details',
      flex: 2,
      renderCell: (params) => {
        const details = params.value;

        if (!details) return null;

        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);

        return (
          <Tooltip title={detailsStr}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                maxWidth: '100%'
              }}
            >
              {detailsStr}
            </Typography>
          </Tooltip>
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDynamicDate(params.value, 'MMM DD, YYYY HH:mm')}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const action = params.row.action;
        const color = getActionColor(action);

        return (
          <Chip
            label={action.includes('FAILED') ? 'Failed' : 'Success'}
            size="small"
            color={color as any}
            variant="outlined"
          />
        );
      }
    }
  ], []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <ListingProvider
          items={logs || []}
          initialLayout="table"
          tableColumns={columns}
        >
          <ListingContent />
        </ListingProvider>
      </CardContent>
    </Card>
  );
};

export default AuditLogTab;
