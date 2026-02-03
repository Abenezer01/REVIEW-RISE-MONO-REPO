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
import { getJobs } from '@/app/actions/job'

import SocialPostDetailModal from './SocialPostDetailModal'

const SocialPostList = () => {
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
      notify(SystemMessageCode.GENERIC_ERROR)
    }

    setLoading(false)
  }, [page, rowsPerPage, filters, notify])

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
      headerName: t('jobs.social.columns.id'),
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
      headerName: t('jobs.social.columns.account'),
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
              {params.row.location?.name || t('jobs.social.locations.all')}
            </Typography>
          </Stack>
        </Stack>
      )
    },
    {
      field: 'channel',
      headerName: t('jobs.social.columns.channel'),
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
              {t(`common.channel.${platform.toLowerCase()}`)}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'postType',
      headerName: t('jobs.social.columns.type'),
      minWidth: 120,
      valueGetter: (value, row) => row.payload?.type || 'organic',
      renderCell: (params) => (
        <CustomChip
          size='small'
          variant='tonal'
          color={params.value === 'paid' ? 'primary' : 'secondary'}
          label={t(`jobs.social.types.${params.value || 'organic'}`)}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'status',
      headerName: t('jobs.social.columns.status'),
      minWidth: 140,
      renderCell: (params) => (
        <CustomChip
          size='small'
          variant='tonal'
          color={getStatusColor(params.value)}
          label={t(`common.status.${params.value}`)}
          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
        />
      )
    },
    {
      field: 'scheduledTime',
      headerName: t('jobs.social.columns.scheduledFor'),
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
      headerName: t('jobs.social.columns.publishedAt'),
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
      headerName: t('jobs.social.columns.actions'),
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
                  {t('jobs.social.title')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {t('jobs.social.subtitle')}
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1 }}>
              <CustomChip
                label={t('jobs.social.postsCount', { count: total })}
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
                label={t('jobs.social.searchLabel')}
                placeholder={t('jobs.social.searchPlaceholder')}
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
                label={t('jobs.social.columns.status')}
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>{t('jobs.social.allStatuses')}</MenuItem>
                <MenuItem value='completed'>{t('common.status.completed')}</MenuItem>
                <MenuItem value='failed'>{t('common.status.failed')}</MenuItem>
                <MenuItem value='pending'>{t('common.status.pending')}</MenuItem>
                <MenuItem value='processing'>{t('common.status.processing')}</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CustomTextField
                select
                fullWidth
                label={t('jobs.social.columns.channel')}
                value={filters.platform}
                onChange={e => handleFilterChange('platform', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>{t('jobs.social.allChannels')}</MenuItem>
                <MenuItem value='google'>{t('common.channel.google')}</MenuItem>
                <MenuItem value='facebook'>{t('common.channel.facebook')}</MenuItem>
                <MenuItem value='instagram'>{t('common.channel.instagram')}</MenuItem>
                <MenuItem value='twitter'>{t('common.channel.twitter')}</MenuItem>
                <MenuItem value='linkedin'>{t('common.channel.linkedin')}</MenuItem>
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
