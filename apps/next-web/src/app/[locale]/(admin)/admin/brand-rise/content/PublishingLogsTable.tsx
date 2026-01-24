/* eslint-disable import/no-unresolved */
'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { GridColDef } from '@mui/x-data-grid';

import { BrandService, type PublishingLog } from '@/services/brand.service';
import TableListing from '@/components/shared/listing/list-types/table-listing';

interface PublishingLogsTableProps {
  businessId: string;
  locationId?: string;
  onViewPost: (postId: string) => void;
}

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />;
};

const PublishingLogsTable = ({ businessId, locationId, onViewPost }: PublishingLogsTableProps) => {
  const [logs, setLogs] = useState<PublishingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    platform: 'ALL',
    status: 'ALL',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(async () => {
    if (!businessId) return;

    setLoading(true);

    try {
      const data = await BrandService.listPublishingLogs(businessId, {
        platform: filters.platform === 'ALL' ? undefined : filters.platform,
        status: filters.status === 'ALL' ? undefined : filters.status,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        locationId: locationId || undefined,
      });

      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch publishing logs', error);
    } finally {
      setLoading(false);
    }
  }, [businessId, locationId, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
      case 'published':
        return <Chip label="Published" color="success" size="small" variant="tonal" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" variant="tonal" />;
      case 'processing':
        return <Chip label="Processing" color="info" size="small" variant="tonal" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" variant="tonal" />;
      default:
        return <Chip label={status} size="small" variant="tonal" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case 'INSTAGRAM':
        return <Icon icon="tabler-brand-instagram" fontSize={20} style={{ color: '#E4405F' }} />;
      case 'FACEBOOK':
        return <Icon icon="tabler-brand-facebook" fontSize={20} style={{ color: '#1877F2' }} />;
      case 'LINKEDIN':
        return <Icon icon="tabler-brand-linkedin" fontSize={20} style={{ color: '#0A66C2' }} />;
      case 'TWITTER':
        return <Icon icon="tabler-brand-x" fontSize={20} />;
      case 'GOOGLE_BUSINESS':
        return <Icon icon="tabler-brand-google" fontSize={20} style={{ color: '#4285F4' }} />;
      default:
        return <Icon icon="tabler-world" fontSize={20} />;
    }
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'updatedAt',
      headerName: 'Time',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const date = new Date(params.row.updatedAt);
        const options: Intl.DateTimeFormatOptions = { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        };
        return date.toLocaleDateString(undefined, options);
      },
    },
    {
      field: 'platform',
      headerName: 'Platform',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getPlatformIcon(params.row.platform)}
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {params.row.platform.toLowerCase()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'content',
      headerName: 'Post Content',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
          {params.row.scheduledPost.content.text}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => getStatusChip(params.row.status),
    },
    {
      field: 'details',
      headerName: 'Details/Errors',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => {
        const log = params.row;
        
        if (log.error) {
          return (
            <Tooltip title={log.error}>
              <Typography
                variant="caption"
                color="error"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {log.error}
              </Typography>
            </Tooltip>
          );
        }
       
        if (log.status === 'completed') {
          return <Typography variant="caption" color="success.main">Published successfully</Typography>;
        }
        
        return (
          <Typography variant="caption" color="text.secondary">
            {log.attemptCount > 0 ? `Attempt ${log.attemptCount}` : 'Waiting to start'}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="View Original Post">
          <IconButton size="small" onClick={() => onViewPost(params.row.scheduledPostId)}>
            <Icon icon="tabler-eye" fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [onViewPost]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 6 }}>
        <TextField
          id="log-platform-filter"
          select
          size="small"
          label="Platform"
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All Platforms</MenuItem>
          <MenuItem value="INSTAGRAM">Instagram</MenuItem>
          <MenuItem value="FACEBOOK">Facebook</MenuItem>
          <MenuItem value="LINKEDIN">LinkedIn</MenuItem>
          <MenuItem value="TWITTER">Twitter (X)</MenuItem>
          <MenuItem value="GOOGLE_BUSINESS">Google Business</MenuItem>
        </TextField>

        <TextField
          id="log-status-filter"
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          <MenuItem value="completed">Published</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
          <MenuItem value="processing">Processing</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </TextField>

        <TextField
          id="log-start-date"
          type="date"
          size="small"
          label="Start Date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          id="log-end-date"
          type="date"
          size="small"
          label="End Date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <TableListing
        columns={columns}
        items={logs}
        isLoading={loading}
      />
    </Box>
  );
};

export default PublishingLogsTable;
