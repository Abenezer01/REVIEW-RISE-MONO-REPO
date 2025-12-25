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
import { toast } from 'react-toastify'
import type { GridColDef } from '@mui/x-data-grid'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { getJobs } from '@/app/actions/job'

import SocialPostDetailModal from './SocialPostDetailModal'

const SocialPostList = () => {
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

  const fetchData = useCallback(async () => {
    setLoading(true)

    const res = await getJobs({
      page: page + 1,
      limit: rowsPerPage,
      type: 'social_posts',
      status: filters.status || undefined,
      platform: filters.platform || undefined,
      search: filters.search,
      fromDate: filters.startDate,
      toDate: filters.endDate
    })

    if (res.success) {
      setData(res.data)
      setTotal(res.meta.total)
    } else {
      toast.error(res.error || 'Failed to fetch social posts')
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      completed: 'success',
      failed: 'error',
      pending: 'warning',
      processing: 'info',
      scheduled: 'primary'
    }

    return colors[status] || 'secondary'
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Job ID',
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
      field: 'channel',
      headerName: 'Channel',
      minWidth: 140,
      valueGetter: (value, row) => row.payload?.platform || 'Unknown',
      renderCell: (params) => {
        const platform = params.row.payload?.platform || 'unknown';

        const iconMap: Record<string, string> = {
          google: 'tabler-brand-google',
          facebook: 'tabler-brand-facebook',
          instagram: 'tabler-brand-instagram',
          twitter: 'tabler-brand-twitter',
          linkedin: 'tabler-brand-linkedin'
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
      field: 'postType',
      headerName: 'Type',
      minWidth: 120,
      valueGetter: (value, row) => row.payload?.type || 'organic',
      renderCell: (params) => (
        <CustomChip
          size='small'
          variant='tonal'
          color={params.value === 'paid' ? 'primary' : 'secondary'}
          label={params.value || 'organic'}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 140,
      renderCell: (params) => (
        <CustomChip
          size='small'
          variant='tonal'
          color={getStatusColor(params.value)}
          label={params.value}
          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
        />
      )
    },
    {
      field: 'scheduledTime',
      headerName: 'Scheduled For',
      minWidth: 180,
      valueGetter: (value, row) => row.payload?.scheduledTime || row.createdAt,
      renderCell: (params) => (
        <Typography variant='body2'>
          {params.value ? new Date(params.value).toLocaleString() : '-'}
        </Typography>
      )
    },
    {
      field: 'publishedTime',
      headerName: 'Published At',
      minWidth: 180,
      valueGetter: (value, row) => row.completedAt,
      renderCell: (params) => (
        <Typography variant='body2' color='text.secondary'>
          {params.value ? new Date(params.value).toLocaleString() : '-'}
        </Typography>
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
      )
    }
  ]

  return (
    <>
      <Card elevation={0} sx={{ mb: 4, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.1)`,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className='tabler-social' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={600} sx={{ mb: 0.5 }}>
                  Social Media Post Logs
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Monitor and manage social media posting jobs
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1 }}>
              <CustomChip
                label={`${total} Posts`}
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
                label='Search Account or Location'
                placeholder='Search Account or Location...'
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
                <MenuItem value='completed'>Completed</MenuItem>
                <MenuItem value='failed'>Failed</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='processing'>Processing</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CustomTextField
                select
                fullWidth
                label='Channel'
                value={filters.platform}
                onChange={e => handleFilterChange('platform', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>All Channels</MenuItem>
                <MenuItem value='google'>Google</MenuItem>
                <MenuItem value='facebook'>Facebook</MenuItem>
                <MenuItem value='instagram'>Instagram</MenuItem>
                <MenuItem value='twitter'>Twitter</MenuItem>
                <MenuItem value='linkedin'>LinkedIn</MenuItem>
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
          onClick: () => { },
          permission: { action: 'read', subject: 'job' }
        }}
      />

      <SocialPostDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        job={selectedJob}
      />
    </>
  )
}

export default SocialPostList
