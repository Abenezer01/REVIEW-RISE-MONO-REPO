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
import Rating from '@mui/material/Rating'
import { toast } from 'react-toastify'
import type { GridColDef } from '@mui/x-data-grid'

import CustomChip from '@core/components/mui/Chip'
import CustomTextField from '@core/components/mui/TextField'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { getReviews } from '@/app/actions/review'
import ReviewDetailDrawer from './ReviewDetailDrawer'

const SmartReviewList = () => {
  const theme = useTheme()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [filters, setFilters] = useState({
    rating: '',
    platform: '',
    search: '',
    sentiment: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  })

  const fetchData = useCallback(async () => {
    setLoading(true)

    const res = await getReviews({
      page: page + 1,
      limit: rowsPerPage,
      rating: filters.rating ? Number(filters.rating) : undefined,
      platform: filters.platform || undefined,
      sentiment: filters.sentiment || undefined,
      search: filters.search,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    })

    if (res.success) {
      setData(res.data)
      setTotal(res.meta.total)
    } else {
      toast.error(res.error || 'Failed to fetch reviews')
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

  const handleDateChange = (type: 'start' | 'end', date: string) => {
    const dateObj = date ? new Date(date) : null
    setFilters(prev => ({
      ...prev,
      startDate: type === 'start' ? dateObj : prev.startDate,
      endDate: type === 'end' ? dateObj : prev.endDate
    }))
    setPage(0)
  }

  const columns: GridColDef[] = [
    {
      field: 'publishedAt',
      headerName: 'Date',
      minWidth: 150,
      renderCell: (params) => {
        const date = new Date(params.value)
        return (
          <Stack>
            <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Stack>
        )
      }
    },
    {
      field: 'rating',
      headerName: 'Rating',
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={params.value} readOnly size='small' />
          <Typography variant='body2' sx={{ ml: 1, fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'platform',
      headerName: 'Source',
      minWidth: 130,
      renderCell: (params) => {
        const platform = params.value || 'unknown';
        const iconMap: Record<string, string> = {
          gbp: 'tabler-brand-google',
          google: 'tabler-brand-google',
          facebook: 'tabler-brand-facebook',
          yelp: 'tabler-brand-yelp'
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className={iconMap[platform.toLowerCase()] || 'tabler-world'} style={{ fontSize: '1.2rem' }} />
            <Typography variant='body2' sx={{ textTransform: 'uppercase' }}>
              {platform}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'content',
      headerName: 'Snippet',
      minWidth: 300,
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Typography variant='body2' noWrap sx={{ color: 'text.secondary' }}>
            {params.value || 'No content'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'sentiment',
      headerName: 'Sentiment',
      minWidth: 120,
      renderCell: (params) => {
        // Placeholder logic for sentiment
        const sentiment = params.value || (params.row.rating >= 4 ? 'Positive' : params.row.rating <= 2 ? 'Negative' : 'Neutral');
        const colorMap: Record<string, any> = {
          Positive: 'success',
          Neutral: 'warning',
          Negative: 'error'
        };

        return (
          <CustomChip
            size='small'
            variant='tonal'
            color={colorMap[sentiment] || 'secondary'}
            label={sentiment}
            sx={{ fontWeight: 500 }}
          />
        );
      }
    },
    {
      field: 'response',
      headerName: 'Reply Status',
      minWidth: 130,
      renderCell: (params) => {
        const isResponded = !!params.value;
        return (
          <CustomChip
            size='small'
            variant='tonal'
            color={isResponded ? 'success' : 'error'}
            label={isResponded ? 'Replied' : 'Pending'}
            icon={<i className={isResponded ? 'tabler-check' : 'tabler-x'} />}
            sx={{ fontWeight: 500 }}
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='View Details'>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedReview(params.row)
                setDrawerOpen(true)
              }}
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
                  bgcolor: (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.1)`,
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: (theme) => `rgba(${theme.palette.primary.mainChannel} / 0.2)`,
                  }
                }}
              >
                <i className='tabler-refresh' style={{ fontSize: '1.5rem' }} />
              </IconButton>
              <Box>
                <Typography variant='h5' fontWeight={600} sx={{ mb: 0.5 }}>
                  Smart Reviews™
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  View and manage all your customer reviews in one place
                </Typography>
              </Box>
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1 }}>
              <CustomChip
                label={`${total} Reviews`}
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
                label='Search Reviews or Authors'
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
                label='Rating'
                value={filters.rating}
                onChange={e => handleFilterChange('rating', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>All Ratings</MenuItem>
                {[5, 4, 3, 2, 1].map(num => (
                  <MenuItem key={num} value={num.toString()}>{num} Stars</MenuItem>
                ))}
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
                <MenuItem value='gbp'>Google</MenuItem>
                <MenuItem value='facebook'>Facebook</MenuItem>
                <MenuItem value='yelp'>Yelp</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CustomTextField
                select
                fullWidth
                label='Sentiment'
                value={filters.sentiment}
                onChange={e => handleFilterChange('sentiment', e.target.value)}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value=''>All Sentiments</MenuItem>
                <MenuItem value='Positive'>Positive</MenuItem>
                <MenuItem value='Neutral'>Neutral</MenuItem>
                <MenuItem value='Negative'>Negative</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <CustomTextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <CustomTextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('end', e.target.value)}
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
          headers: columns
        }}
        hasListHeader={false}
        createActionConfig={{
          show: false,
          onlyIcon: false,
          onClick: () => { },
          permission: { action: 'read', subject: 'review' }
        }}
        emptyStateConfig={{
          title: 'No Reviews Found',
          description: 'Try adjusting your filters to find what you are looking for.',
          icon: 'tabler-message-off'
        }}
      />

      <ReviewDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        review={selectedReview}
        onSuccess={() => {
          fetchData()
          setDrawerOpen(false)
        }}
      />
    </>
  )
}

export default SmartReviewList
