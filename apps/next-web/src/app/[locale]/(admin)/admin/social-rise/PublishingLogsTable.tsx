/* eslint-disable import/no-unresolved */
'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
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
  const t = useTranslations('social.publishingLogs');
  const tc = useTranslations('common');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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

  const getStatusChip = useCallback((status: string) => {
    switch (status) {
      case 'completed':
      case 'published':
        return <Chip label={t('published')} color="success" size="small" variant="tonal" />;
      case 'failed':
        return <Chip label={t('failed')} color="error" size="small" variant="tonal" />;
      case 'processing':
        return <Chip label={t('processing')} color="info" size="small" variant="tonal" />;
      case 'pending':
        return <Chip label={t('pending')} color="warning" size="small" variant="tonal" />;
      default:
        return <Chip label={status} size="small" variant="tonal" />;
    }
  }, [t]);

  const getPlatformIcon = useCallback((platform: string) => {
    if (!platform) return <Icon icon="tabler-world" fontSize={20} />;

    const normalized = platform.toUpperCase().replace(/\s+/g, '_');

    switch (normalized) {
      case 'ALL_PLATFORMS':
        return <Icon icon="tabler-world" fontSize={20} />;
      case 'INSTAGRAM':
        return <Icon icon="tabler-brand-instagram" fontSize={20} style={{ color: '#E4405F' }} />;
      case 'FACEBOOK':
        return <Icon icon="tabler-brand-facebook" fontSize={20} style={{ color: '#1877F2' }} />;
      case 'LINKEDIN':
        return <Icon icon="tabler-brand-linkedin" fontSize={20} style={{ color: '#0A66C2' }} />;
      case 'TWITTER':
      case 'X':
        return <Icon icon="tabler-brand-x" fontSize={20} />;
      case 'GOOGLE_BUSINESS':
        return <Icon icon="tabler-brand-google" fontSize={20} style={{ color: '#4285F4' }} />;
      default:
        return <Icon icon="tabler-world" fontSize={20} />;
    }
  }, []);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'updatedAt',
      headerName: t('time'),
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const date = new Date(params.row.updatedAt);
        const isDark = theme.palette.mode === 'dark';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              color: 'primary.main',
              flexShrink: 0
            }}>
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.6rem', lineHeight: 1, mb: 0.5 }}>
                {date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.9rem', lineHeight: 1 }}>
                {date.getDate()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                {date.toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.8 }}>
                {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                  Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)), 
                  'day'
                )}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'platform',
      headerName: t('platform'),
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
      headerName: t('postContent'),
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
      headerName: t('status'),
      flex: 1,
      minWidth: 130,
      renderCell: (params) => getStatusChip(params.row.status),
    },
    {
      field: 'details',
      headerName: t('detailsErrors'),
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
          return <Typography variant="caption" color="success.main">{t('publishedSuccessfully')}</Typography>;
        }
        
        return (
          <Typography variant="caption" color="text.secondary">
            {log.attemptCount > 0 ? t('attempt', { count: log.attemptCount }) : t('waitingToStart')}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('actions'),
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      width: 100,
      renderCell: (params) => (
        <Tooltip title={t('viewOriginalPost')}>
          <IconButton size="small" onClick={() => onViewPost(params.row.scheduledPostId)}>
            <Icon icon="tabler-eye" fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [onViewPost, t, getStatusChip, getPlatformIcon, theme.palette.mode, theme.palette.primary.main]);

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 8,
        p: 5,
        borderRadius: '20px',
        bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.01),
        border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05)}`
      }}>
        <TextField
          id="log-platform-filter"
          select
          size="small"
          label={t('platform')}
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : 'background.paper',
              '& fieldset': { border: 'none' },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            },
            '& .MuiInputLabel-root': { fontWeight: 600 }
          }}
        >
          <MenuItem value="ALL">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon="tabler-world" fontSize={18} />
              <Typography variant="body2" fontWeight="600">{t('allPlatforms')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="INSTAGRAM">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon="tabler-brand-instagram" fontSize={18} style={{ color: '#E4405F' }} />
              <Typography variant="body2" fontWeight="600">{tc('channel.instagram')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="FACEBOOK">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon="tabler-brand-facebook" fontSize={18} style={{ color: '#1877F2' }} />
              <Typography variant="body2" fontWeight="600">{tc('channel.facebook')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="LINKEDIN">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon="tabler-brand-linkedin" fontSize={18} style={{ color: '#0A66C2' }} />
              <Typography variant="body2" fontWeight="600">{tc('channel.linkedin')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="TWITTER">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon="tabler-brand-x" fontSize={18} />
              <Typography variant="body2" fontWeight="600">{t('twitterX')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="GOOGLE_BUSINESS">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icon icon="tabler-brand-google" fontSize={18} style={{ color: '#4285F4' }} />
              <Typography variant="body2" fontWeight="600">{t('googleBusiness')}</Typography>
            </Box>
          </MenuItem>
        </TextField>

        <TextField
          id="log-status-filter"
          select
          size="small"
          label={t('status')}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          sx={{ 
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : 'background.paper',
              '& fieldset': { border: 'none' },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            },
            '& .MuiInputLabel-root': { fontWeight: 600 }
          }}
        >
          <MenuItem value="ALL">{t('allStatuses')}</MenuItem>
          <MenuItem value="completed">{t('published')}</MenuItem>
          <MenuItem value="failed">{t('failed')}</MenuItem>
          <MenuItem value="processing">{t('processing')}</MenuItem>
          <MenuItem value="pending">{t('pending')}</MenuItem>
        </TextField>

        <TextField
          id="log-start-date"
          type="date"
          size="small"
          label={t('startDate')}
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ 
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : 'background.paper',
              '& fieldset': { border: 'none' },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            },
            '& .MuiInputLabel-root': { fontWeight: 600 }
          }}
        />

        <TextField
          id="log-end-date"
          type="date"
          size="small"
          label={t('endDate')}
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ 
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : 'background.paper',
              '& fieldset': { border: 'none' },
              '&.Mui-focused': {
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            },
            '& .MuiInputLabel-root': { fontWeight: 600 }
          }}
        />
      </Box>

      <Box sx={{ 
        '& .MuiDataGrid-root': {
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.black, 0.01),
            borderRadius: '12px',
            mb: 2
          },
          '& .MuiDataGrid-cell': {
            borderColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05),
          }
        }
      }}>
        <TableListing
          columns={columns}
          items={logs}
          isLoading={loading}
        />
      </Box>
    </Box>
  );
};

export default PublishingLogsTable;
