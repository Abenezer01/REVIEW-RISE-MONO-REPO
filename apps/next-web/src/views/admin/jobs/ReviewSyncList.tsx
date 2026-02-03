/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect, useCallback } from 'react'

import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'

import { SystemMessageCode } from '@platform/contracts'
import type { GridColDef } from '@mui/x-data-grid'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { useTranslation } from '@/hooks/useTranslation'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { getReviewSyncLogs, retryJob } from '@/app/actions/job'

import ReviewSyncDetailModal from './ReviewSyncDetailModal'

const ReviewSyncList = () => {
  const { notify } = useSystemMessages()
  const theme = useTheme()
  const t = useTranslation('dashboard')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [openDetail, setOpenDetail] = useState(false)

  const [filters, setFilters] = useState({
    status: '',
    platform: '',
    search: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  })

  const fetchData = useCallback(async () => {
    setLoading(true)

    const res = await getReviewSyncLogs({
      page: page + 1,
      limit: rowsPerPage,
      status: filters.status || undefined,
      platform: filters.platform || undefined,
      search: filters.search,
      fromDate: filters.startDate,
      toDate: filters.endDate
    })

    if (res.success) {
      console.log('[ReviewSyncList] Data received:', res.data)
      setData(res.data)
      setTotal(res.meta.total)
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }

    setLoading(false)
  }, [page, rowsPerPage, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleDateChange = (type: 'start' | 'end', date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      startDate: type === 'start' ? date : prev.startDate,
      endDate: type === 'end' ? date : prev.endDate
    }))
    setPage(0)
  }

  const handleRetry = async (jobId: string) => {
    if (!jobId) {
      notify(SystemMessageCode.GENERIC_ERROR)

      return
    }

    const res = await retryJob(jobId)

    if (res.success) {
      notify(SystemMessageCode.SUCCESS)

      // We might not see status update immediately in logs unless a new log is created
      fetchData()

      if (selectedJob?.jobId === jobId) {
        setOpenDetail(false)
      }
    } else {
      notify(SystemMessageCode.GENERIC_ERROR)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      success: 'success',
      completed: 'success',
      failed: 'error',
      pending: 'warning',
      processing: 'info',
    }

    return colors[status] || 'secondary'
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('jobs.reviewSync.columns.logId'),
      minWidth: 100,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant='body2' sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            {params.value.substring(0, 8)}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'business',
      headerName: t('jobs.reviewSync.columns.account'),
      minWidth: 180,
      valueGetter: (value, row) => row?.business?.name || 'N/A',
      renderCell: (params) => (
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Avatar
            src={params.row.business?.logo}
            alt={params.row.business?.name}
            sx={{ width: 28, height: 28, fontSize: '0.75rem' }}
          >
            {params.row.business?.name?.charAt(0)}
          </Avatar>
          <Stack>
            <Typography variant='body2' fontWeight={500} color='text.primary'>
              {params.row.business?.name || 'N/A'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {params.row.location?.name || 'All Locations'}
            </Typography>
          </Stack>
        </Stack>
      )
    },
    {
      field: 'platform',
      headerName: t('jobs.reviewSync.columns.provider'),
      minWidth: 140,
      renderCell: (params) => {
        const platform = params.value || 'unknown';

        const iconMap: Record<string, string> = {
          google: 'tabler-brand-google',
          facebook: 'tabler-brand-facebook',
          instagram: 'tabler-brand-instagram',
          twitter: 'tabler-brand-twitter',
          linkedin: 'tabler-brand-linkedin',
          tripadvisor: 'tabler-brand-tripadvisor',
          yelp: 'tabler-brand-yelp'
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className={iconMap[platform.toLowerCase()] || 'tabler-world'} style={{ fontSize: '1.2rem' }} />
            <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
              {platform}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: t('jobs.reviewSync.columns.status'),
      minWidth: 120,
      renderCell: (params) => {
        const isRetrying = params.row.job?.status === 'pending' || params.row.job?.status === 'processing'

        if (isRetrying && params.value === 'failed') {
          return (
            <CustomChip
              size='small'
              variant='tonal'
              color='warning'
              label={t('common.status.processing')}
              icon={<i className='tabler-loader animate-spin' />}
              sx={{ textTransform: 'capitalize', fontWeight: 500 }}
            />
          )
        }

        return (
          <CustomChip
            size='small'
            variant='tonal'
            color={getStatusColor(params.value)}
            label={t(`common.status.${params.value}`)}
            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
          />
        )
      }
    },
    {
      field: 'reviewsSynced',
      headerName: t('jobs.reviewSync.columns.synced'),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant='body2' fontWeight={600}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'durationMs',
      headerName: t('jobs.reviewSync.columns.duration'),
      width: 100,
      valueGetter: (value) => {
        if (value) {
          return `${(value / 1000).toFixed(1)}s`
        }

        return '-'
      },
      renderCell: (params) => (
        <Typography variant='body2' color='text.secondary'>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: t('jobs.reviewSync.columns.date'),
      minWidth: 180,
      valueGetter: (value, row) => row.createdAt,
      renderCell: (params) => (
        <Stack>
          <Typography variant='body2'>
            {new Date(params.value).toLocaleDateString()}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {new Date(params.value).toLocaleTimeString()}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'actions',
      headerName: t('jobs.reviewSync.columns.actions'),
      sortable: false,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {params.row.status === 'failed' && params.row.jobId && (
            <Tooltip title={t('jobs.failed.actions.retryJob')}>
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry(params.row.jobId);
                }}
                color='primary'
              >
                <i className='tabler-refresh' />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('jobs.failed.actions.viewDetails')}>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedJob(params.row)
                setOpenDetail(true)
              }}
              sx={{ color: 'text.secondary' }}
            >
              <i className='tabler-eye' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <>
      <Card elevation={0} sx={{ mb: 4, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={fetchData}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (theme) => `rgba(${theme.palette.info.mainChannel} / 0.1)`,
                  color: 'info.main',
                  '&:hover': {
                    bgcolor: (theme) => `rgba(${theme.palette.info.mainChannel} / 0.2)`,
                  }
                }}
              >
                <i className='tabler-refresh' style={{ fontSize: '1.5rem' }} />
              </IconButton>
              <Box>
                <Typography variant='h5' fontWeight={600} sx={{ mb: 0.5 }}>
                  {t('jobs.reviewSync.title')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {t('jobs.reviewSync.subtitle')}
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1 }}>
              <CustomChip
                label={t('jobs.reviewSync.logsCount', { count: total })}
                size='small'
                variant='tonal'
                color='primary'
              />
            </Box>
          }
          sx={{ pb: 3 }}
        />
        <Divider sx={{ borderStyle: 'dashed' }} />
        <CardContent sx={{ pt: 4, pb: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <CustomTextField
                fullWidth
                label={t('jobs.reviewSync.searchLabel')}
                placeholder={t('jobs.reviewSync.searchPlaceholder')}
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' style={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CustomTextField
                select
                fullWidth
                label={t('jobs.reviewSync.columns.status')}
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>{t('jobs.reviewSync.allStatuses')}</MenuItem>
                <MenuItem value='success'>{t('common.status.success')}</MenuItem>
                <MenuItem value='failed'>{t('common.status.failed')}</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CustomTextField
                select
                fullWidth
                label={t('jobs.reviewSync.columns.provider')}
                value={filters.platform}
                onChange={e => handleFilterChange('platform', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>{t('jobs.reviewSync.allProviders')}</MenuItem>
                <MenuItem value='google'>{t('common.channel.google')}</MenuItem>
                <MenuItem value='facebook'>{t('common.channel.facebook')}</MenuItem>
                <MenuItem value='tripadvisor'>{t('common.channel.tripadvisor')}</MenuItem>
                <MenuItem value='yelp'>{t('common.channel.yelp')}</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <CustomTextField
                  fullWidth
                  type="date"
                  label={t('jobs.social.startDate')}
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('start', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
                <CustomTextField
                  fullWidth
                  type="date"
                  label={t('jobs.social.endDate')}
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('end', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ItemsListing
        type={ITEMS_LISTING_TYPE.table.value}
        items={data}
        isLoading={loading}
        pagination={{
          page: page + 1,
          pageSize: rowsPerPage,
          total: total,
          lastPage: Math.ceil(total / rowsPerPage)
        }}
        onPaginationChange={(pageSize, newPage) => {
          setRowsPerPage(pageSize)
          setPage(newPage - 1)
        }}
        tableProps={{
          headers: columns,
          onRowClick: (params) => {
            setSelectedJob(params.row)
            setOpenDetail(true)
          }
        }}
        hasListHeader={false}
        createActionConfig={{
          show: false,
          onlyIcon: false,
          onClick: () => { },
          permission: { action: 'read', subject: 'job' }
        }}
        emptyStateConfig={{
          title: t('jobs.reviewSync.empty.title'),
          description: t('jobs.reviewSync.empty.description'),
          icon: 'tabler:clipboard-list'
        }}
      />

      <ReviewSyncDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        onRetry={() => selectedJob?.jobId && handleRetry(selectedJob.jobId)}
        job={selectedJob}
      />
    </>
  )
}

export default ReviewSyncList