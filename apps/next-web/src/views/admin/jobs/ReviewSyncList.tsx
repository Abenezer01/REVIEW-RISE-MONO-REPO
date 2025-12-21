/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect } from 'react'

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
import { toast } from 'react-toastify'
import type { GridColDef } from '@mui/x-data-grid'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { getReviewSyncLogs, retryJob } from '@/app/actions/job'

import ReviewSyncDetailModal from './ReviewSyncDetailModal'

const ReviewSyncList = () => {
  const theme = useTheme()
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

  const fetchData = async () => {
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
      toast.error(res.error || 'Failed to fetch review sync logs')
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, rowsPerPage, filters])

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
        toast.error('Cannot retry: No associated job found')
    
        return
    }

    const res = await retryJob(jobId)
    
    if (res.success) {
        toast.success('Job retried successfully')

        // We might not see status update immediately in logs unless a new log is created
        fetchData()
    
        if (selectedJob?.jobId === jobId) {
            setOpenDetail(false)
        }
    } else {
        toast.error(res.error || 'Failed to retry job')
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
      headerName: 'Log ID',
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
      headerName: 'Account',
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
      headerName: 'Provider',
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
        headerName: 'Status',
        minWidth: 120,
        renderCell: (params) => {
            const isRetrying = params.row.job?.status === 'pending' || params.row.job?.status === 'processing'
            
            if (isRetrying && params.value === 'failed') {
                 return (
                    <CustomChip
                        size='small'
                        variant='tonal'
                        color='warning'
                        label='Retrying'
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
                    label={params.value}
                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                />
            )
        }
    },
    {
        field: 'reviewsSynced',
        headerName: 'Synced',
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
        headerName: 'Duration',
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
        headerName: 'Date',
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
      headerName: 'Actions',
      sortable: false,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {params.row.status === 'failed' && params.row.jobId && (
                <Tooltip title="Retry Job">
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
            <Tooltip title="View Details">
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
                  Review Sync Logs
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Monitor and debug review synchronization tasks
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1 }}>
                <CustomChip
                    label={`${total} Logs`}
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
                label='Search Account or ID'
                placeholder='Search...'
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
                label='Status'
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>All Statuses</MenuItem>
                <MenuItem value='success'>Success</MenuItem>
                <MenuItem value='failed'>Failed</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CustomTextField
                select
                fullWidth
                label='Provider'
                value={filters.platform}
                onChange={e => handleFilterChange('platform', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>All Providers</MenuItem>
                <MenuItem value='google'>Google</MenuItem>
                <MenuItem value='facebook'>Facebook</MenuItem>
                <MenuItem value='tripadvisor'>TripAdvisor</MenuItem>
                <MenuItem value='yelp'>Yelp</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <CustomTextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleDateChange('start', e.target.value ? new Date(e.target.value) : null)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <CustomTextField
                        fullWidth
                        type="date"
                        label="End Date"
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
            onClick: () => {},
            permission: { action: 'read', subject: 'job' }
        }}
        emptyStateConfig={{
            title: 'No Review Sync Logs',
            description: 'There are no review sync logs matching your criteria.',
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