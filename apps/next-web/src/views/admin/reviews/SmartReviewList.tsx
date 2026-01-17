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
import { useLocationFilter } from '@/hooks/useLocationFilter'
import ReviewDetailDrawer from './ReviewDetailDrawer'

const SmartReviewList = () => {
  const theme = useTheme()
  const { locationId } = useLocationFilter()
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
    replyStatus: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  })

  const fetchData = useCallback(async () => {
    setLoading(true)

    const res = await getReviews({
      page: page + 1,
      limit: rowsPerPage,
      locationId: locationId || undefined,
      rating: filters.rating ? Number(filters.rating) : undefined,
      platform: filters.platform || undefined,
      sentiment: filters.sentiment || undefined,
      replyStatus: filters.replyStatus || undefined,
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
  }, [page, rowsPerPage, filters, locationId])

  useEffect(() => {
    setPage(0)
  }, [locationId])

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
        const platform = params.value || 'unknown'

        const iconMap: Record<string, string> = {
          gbp: 'tabler-brand-google',
          google: 'tabler-brand-google',
          facebook: 'tabler-brand-facebook',
          yelp: 'tabler-brand-yelp'
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className={iconMap[platform.toLowerCase()] || 'tabler-world'} style={{ fontSize: '1.2rem' }} />
            <Typography variant='body2' sx={{ textTransform: 'uppercase' }}>
              {platform}
            </Typography>
          </Box>
        )
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
        const sentiment = params.value || (params.row.rating >= 4 ? 'Positive' : params.row.rating <= 2 ? 'Negative' : 'Neutral')

        const colorMap: Record<string, any> = {
          Positive: 'success',
          Neutral: 'warning',
          Negative: 'error'
        }

        return (
          <CustomChip
            size='small'
            variant='tonal'
            color={colorMap[sentiment] || 'secondary'}
            label={sentiment}
            sx={{ fontWeight: 500 }}
          />
        )
      }
    },
    {
      field: 'replyStatus',
      headerName: 'Reply Status',
      minWidth: 160,
      renderCell: (params) => {
        const status = params.value || (params.row.response ? 'posted' : 'none')

        const statusConfig: Record<string, { color: any; label: string; icon: string }> = {
          posted: { color: 'success', label: 'Replied', icon: 'tabler-circle-check' },
          approved: { color: 'info', label: 'Approved', icon: 'tabler-thumb-up' },
          pending_approval: { color: 'warning', label: 'Pending', icon: 'tabler-clock' },
          failed: { color: 'error', label: 'Failed', icon: 'tabler-alert-circle' },
          skipped: { color: 'secondary', label: 'Skipped', icon: 'tabler-player-skip-forward' },
          none: { color: 'error', label: 'Not Replied', icon: 'tabler-x' }
        }

        const config = statusConfig[status] || statusConfig.none

        return (
          <Tooltip title={params.row.replyError || ''}>
            <CustomChip
              size='small'
              variant='tonal'
              color={config.color}
              label={config.label}
              icon={<i className={config.icon} style={{ fontSize: '1rem' }} />}
              sx={{ fontWeight: 500, textTransform: 'capitalize' }}
            />
          </Tooltip>
        )
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
                <i className={loading ? 'tabler-loader spin' : 'tabler-refresh'} style={{ fontSize: '1.5rem' }} />
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
          <Grid container spacing={4}>
            {/* Main Filters: Search and Dates */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <CustomTextField
                id="review-search-filter"
                fullWidth
                label='Search'
                placeholder='Search reviews, authors, or keywords...'
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
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <CustomTextField
                  id="review-start-date-filter"
                  fullWidth
                  type="date"
                  label="From"
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <CustomTextField
                  id="review-end-date-filter"
                  fullWidth
                  type="date"
                  label="To"
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid>

            {/* Secondary Filters: Dropdowns */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                id="review-rating-filter"
                select
                fullWidth
                label='Rating'
                value={filters.rating}
                onChange={e => handleFilterChange('rating', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                          <i className='tabler-star' />
                          <Typography variant="body2" color="inherit">All Ratings</Typography>
                        </Box>
                      )
                    }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className='tabler-star' />
                        <Typography variant="body2">{selected as string} Stars</Typography>
                      </Box>
                    )
                  }
                }}
              >
                <MenuItem value=''>All Ratings</MenuItem>
                {[5, 4, 3, 2, 1].map(num => (
                  <MenuItem key={num} value={num.toString()}>{num} Stars</MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                id="review-provider-filter"
                select
                fullWidth
                label='Provider'
                value={filters.platform}
                onChange={e => handleFilterChange('platform', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                          <i className='tabler-world' />
                          <Typography variant="body2" color="inherit">All Providers</Typography>
                        </Box>
                      )
                    }

                    const labels: Record<string, string> = { gbp: 'Google', facebook: 'Facebook', yelp: 'Yelp' }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className='tabler-world' />
                        <Typography variant="body2">{labels[selected as string] || (selected as string)}</Typography>
                      </Box>
                    )
                  }
                }}
              >
                <MenuItem value=''>All Providers</MenuItem>
                <MenuItem value='gbp'>Google</MenuItem>
                <MenuItem value='facebook'>Facebook</MenuItem>
                <MenuItem value='yelp'>Yelp</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                id="review-sentiment-filter"
                select
                fullWidth
                label='Sentiment'
                value={filters.sentiment}
                onChange={e => handleFilterChange('sentiment', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                          <i className='tabler-mood-smile' />
                          <Typography variant="body2" color="inherit">All Sentiments</Typography>
                        </Box>
                      )
                    }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className='tabler-mood-smile' />
                        <Typography variant="body2">{selected as string}</Typography>
                      </Box>
                    )
                  }
                }}
              >
                <MenuItem value=''>All Sentiments</MenuItem>
                <MenuItem value='Positive'>Positive</MenuItem>
                <MenuItem value='Neutral'>Neutral</MenuItem>
                <MenuItem value='Negative'>Negative</MenuItem>
              </CustomTextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                id="review-status-filter"
                select
                fullWidth
                label='Reply Status'
                value={filters.replyStatus}
                onChange={e => handleFilterChange('replyStatus', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                          <i className='tabler-check' />
                          <Typography variant="body2" color="inherit">All Statuses</Typography>
                        </Box>
                      )
                    }

                    const labels: Record<string, string> = {
                      posted: 'Replied',
                      approved: 'Approved',
                      pending_approval: 'Pending',
                      failed: 'Failed',
                      skipped: 'Skipped'
                    }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className='tabler-check' />
                        <Typography variant="body2">{labels[selected as string] || (selected as string)}</Typography>
                      </Box>
                    )
                  }
                }}
              >
                <MenuItem value=''>All Statuses</MenuItem>
                <MenuItem value='posted'>Replied</MenuItem>
                <MenuItem value='approved'>Approved</MenuItem>
                <MenuItem value='pending_approval'>Pending</MenuItem>
                <MenuItem value='failed'>Failed</MenuItem>
                <MenuItem value='skipped'>Skipped</MenuItem>
              </CustomTextField>
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
        onSuccess={(updatedReview, shouldClose = true) => {
          fetchData()
          if (shouldClose) setDrawerOpen(false)
        }}
      />
    </>
  )
}

export default SmartReviewList
