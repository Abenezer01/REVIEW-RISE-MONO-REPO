/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect, useCallback } from 'react'

import { LoadingButton } from '@mui/lab'
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
import { toast } from 'react-toastify'
import type { GridColDef } from '@mui/x-data-grid'
import { useTheme } from '@mui/material/styles'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'

import { getJobs, retryJob, resolveJob, ignoreJob } from '@/app/actions/job'

import JobDetailModal from './JobDetailModal'

const getJobTypeColor = (type: string): any => {
  const colors: Record<string, any> = {
    reviews: 'info',
    social_posts: 'success',
    seo_crawls: 'warning',
    ai_tasks: 'primary'
  }

  return colors[type] || 'secondary'
}

type Props = {
  initialType?: string
}

const JobList = ({ initialType = '' }: Props) => {
  const theme = useTheme()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [filters, setFilters] = useState({
    type: initialType,
    status: 'failed',
    search: ''
  })

  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [openDetail, setOpenDetail] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)

    const res = await getJobs({
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    })

    if (res.success) {
      setData(res.data)
      setTotal(res.meta.total)
    } else {
      toast.error(res.error || 'Failed to fetch jobs')
    }

    setLoading(false)
  }, [page, rowsPerPage, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleRetry = async (id: string) => {
    const res = await retryJob(id)

    if (res.success) {
      toast.success('Job queued for retry')
      fetchData()
      if (selectedJob?.id === id) setOpenDetail(false)
    } else {
      toast.error(res.error || 'Failed to retry job')
    }
  }

  const handleResolve = async (id: string) => {
    const res = await resolveJob(id, 'Resolved by admin')

    if (res.success) {
      toast.success('Job marked as resolved')
      fetchData()
      if (selectedJob?.id === id) setOpenDetail(false)
    } else {
      toast.error(res.error || 'Failed to resolve job')
    }
  }

  const handleIgnore = async (id: string) => {
    const res = await ignoreJob(id, 'Ignored by admin')

    if (res.success) {
      toast.success('Job ignored')
      fetchData()
      if (selectedJob?.id === id) setOpenDetail(false)
    } else {
      toast.error(res.error || 'Failed to ignore job')
    }
  }

  const convertToCSV = (data: any[]) => {
    const headers = ['Job ID', 'Type', 'Business', 'Error Details', 'Retries', 'Created At']

    const rows = data.map(job => [
      job.id,
      job.type,
      job.business?.name || 'N/A',
      `"${(job.error?.message || '').replace(/"/g, '""')}"`,
      `${job.retryCount}/${job.maxRetries}`,
      new Date(job.createdAt).toLocaleString()
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = async () => {
    setLoadingExport(true)

    try {
      // Fetch all filtered jobs (up to a reasonable limit, e.g., 1000)
      const res = await getJobs({
        page: 1,
        limit: 1000,
        ...filters
      })

      if (res.success && res.data.length > 0) {
        const csvContent = convertToCSV(res.data)

        downloadCSV(csvContent, `failed_jobs_${new Date().toISOString().split('T')[0]}.csv`)
        toast.success(`Exported ${res.data.length} jobs`)
      } else if (res.success && res.data.length === 0) {
        toast.info('No jobs to export')
      } else {
        toast.error(res.error || 'Failed to fetch jobs for export')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('An error occurred during export')
    } finally {
      setLoadingExport(false)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Job ID',
      minWidth: 120,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant='body2' sx={{ fontFamily: 'monospace', color: 'text.secondary', letterSpacing: 0.5 }}>
            {params.value.substring(0, 8)}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      minWidth: 150,
      renderCell: (params) => (
        <CustomChip
          size='small'
          variant='tonal'
          color={getJobTypeColor(params.value)}
          label={params.value.replace('_', ' ')}
          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
        />
      )
    },
    {
      field: 'business',
      headerName: 'Business',
      minWidth: 200,
      valueGetter: (value, row) => row?.business?.name || 'N/A',
      renderCell: (params) => (
        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'error',
      headerName: 'Error Details',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.row.error?.message || 'Unknown error'} placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className='tabler-alert-circle' style={{ color: theme.palette.error.main, fontSize: '1.1rem' }} />
            <Typography variant='body2' noWrap color='text.secondary'>
              {params.row.error?.message || 'Unknown error'}
            </Typography>
          </Box>
        </Tooltip>
      )
    },
    {
      field: 'retryCount',
      headerName: 'Retries',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='body2' fontWeight={500}>
            {params.row.retryCount}/{params.row.maxRetries}
          </Typography>
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      minWidth: 180,
      valueFormatter: (value: string) => new Date(value).toLocaleString(),
      renderCell: (params) => (
        <Stack>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
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
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Tooltip title='View Details'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedJob(params.row)
                setOpenDetail(true)
              }}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' } }}
            >
              <i className='tabler-eye' />
            </IconButton>
          </Tooltip>
          {params.row.status === 'failed' && (
            <Tooltip title='Retry Job'>
              <IconButton
                size='small'
                onClick={() => handleRetry(params.row.id)}
                sx={{ color: 'text.secondary', ml: 1, '&:hover': { color: 'success.main', bgcolor: 'success.lighter' } }}
              >
                <i className='tabler-refresh' />
              </IconButton>
            </Tooltip>
          )}
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
              <Box sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `rgba(${theme.palette.error.mainChannel} / 0.1)`,
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className='tabler-alert-triangle' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={600} sx={{ mb: 0.5 }}>
                  Failed Jobs Management
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Monitor, investigate and retry failed background tasks
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1 }}>
              <CustomChip
                label={`${total} Jobs Found`}
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
            <Grid size={{ xs: 12, md: 4 }}>
              <CustomTextField
                id='job-search-input'
                fullWidth
                placeholder='Search by ID or Error...'
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomTextField
                id='job-type-select'
                select
                fullWidth
                defaultValue=''
                value={filters.type}
                onChange={e => handleFilterChange('type', e.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: any) => {
                    if (!selected) {
                      return <Typography color='text.secondary'>Filter by Type</Typography>
                    }

                    return selected.replace('_', ' ');
                  }
                }}
              >
                <MenuItem value=''>
                  <Typography color='text.secondary'>All Types</Typography>
                </MenuItem>
                <MenuItem value='reviews'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className='tabler-star' /> Reviews
                  </Box>
                </MenuItem>
                <MenuItem value='social_posts'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className='tabler-brand-twitter' /> Social Posts
                  </Box>
                </MenuItem>
                <MenuItem value='seo_crawls'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className='tabler-seo' /> SEO Crawls
                  </Box>
                </MenuItem>
                <MenuItem value='ai_tasks'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className='tabler-brain' /> AI Tasks
                  </Box>
                </MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <LoadingButton
                variant='contained'
                startIcon={<i className='tabler-download' />}
                loading={loadingExport}
                loadingPosition='start'
                onClick={handleExport}
              >
                Export CSV
              </LoadingButton>
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
          headers: columns
        }}
        hasListHeader={false}
        createActionConfig={{
          show: false,
          onlyIcon: false,
          onClick: () => { },
          permission: { action: 'read', subject: 'job' }
        }}
      />

      <JobDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        job={selectedJob}
        onRetry={handleRetry}
        onResolve={handleResolve}
        onIgnore={handleIgnore}
      />
    </>
  )
}

export default JobList
