/* eslint-disable import/no-unresolved */
'use client'

import { useState, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import Rating from '@mui/material/Rating'
import Button from '@mui/material/Button'
import { CardHeader, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { GridColDef } from '@mui/x-data-grid'

import { toast } from 'react-toastify'

import CustomChip from '@core/components/mui/Chip'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import ItemsListing from '@components/shared/listing'

import { ITEMS_LISTING_TYPE } from '@/configs/listingConfig'
import { getReviews } from '@/app/actions/review'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import SentimentBadge from '@/components/shared/reviews/SentimentBadge'
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
    date: null as Date | null
  })

  const fetchData = useCallback(async () => {
    setLoading(true)

    // Calculate start and end of the selected day
    let startDate = undefined
    let endDate = undefined

    if (filters.date) {
      startDate = new Date(filters.date)
      startDate.setHours(0, 0, 0, 0)
      
      endDate = new Date(filters.date)
      endDate.setHours(23, 59, 59, 999)
    }

    const res = await getReviews({
      page: page + 1,
      limit: rowsPerPage,
      locationId: locationId || undefined,
      rating: filters.rating ? Number(filters.rating) : undefined,
      platform: filters.platform || undefined,
      sentiment: filters.sentiment || undefined,
      replyStatus: filters.replyStatus || undefined,
      search: filters.search,
      startDate: startDate || undefined,
      endDate: endDate || undefined
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

  const handleDateChange = (date: string) => {
    const dateObj = date ? new Date(date) : null

    setFilters(prev => ({
      ...prev,
      date: dateObj
    }))

    setPage(0)
  }

  const columns: GridColDef[] = [
    {
      field: 'author',
      headerName: 'Reviewer',
      minWidth: 220,
      renderCell: (params) => {
        const { author, platform } = params.row

        const platformIconMap: Record<string, string> = {
          gbp: 'tabler-brand-google',
          google: 'tabler-brand-google',
          facebook: 'tabler-brand-facebook',
          yelp: 'tabler-brand-yelp'
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <CustomAvatar
              skin='light'
              color='primary'
              size={34}
              sx={{ fontWeight: 500, fontSize: '0.875rem' }}
            >
              {author?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </CustomAvatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {author || 'Anonymous'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className={platformIconMap[platform?.toLowerCase()] || 'tabler-world'} style={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                <Typography variant='caption' sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                  {platform}
                </Typography>
              </Box>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'content',
      headerName: 'Review',
      minWidth: 350,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', py: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating value={params.row.rating} readOnly size='small' />
            <Typography variant='caption' color='text.disabled'>
              {new Date(params.row.publishedAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Tooltip title={params.value || ''}>
            <Typography 
              variant='body2' 
              sx={{ 
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'normal',
                lineHeight: 1.5
              }}
            >
              {params.value || 'No content provided'}
            </Typography>
          </Tooltip>
        </Box>
      )
    },
    {
      field: 'sentiment',
      headerName: 'Sentiment',
      minWidth: 120,
      renderCell: (params) => {
        return (
          <SentimentBadge 
            sentiment={params.value?.toLowerCase() as any} 
            size='small' 
          />
        )
      }
    },
    {
      field: 'replyStatus',
      headerName: 'Status',
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
              sx={{ fontWeight: 500, textTransform: 'capitalize', borderRadius: '4px' }}
            />
          </Tooltip>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size='small'
          onClick={() => {
            setSelectedReview(params.row)
            setDrawerOpen(true)
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
            <Box sx={{ display: 'flex', gap: 1, mt: 1, mr: 1, alignItems: 'center' }}>
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<i className="tabler-wand" />}
                    onClick={async () => {
                        toast.info('Starting sentiment analysis...');

                        // Dynamic import to avoid server-side issues if any
                        const { triggerSentimentAnalysis } = await import('@/app/actions/job');
                        const res = await triggerSentimentAnalysis();

                        if (res.success) {
                            toast.success('Sentiment analysis started via background job');
                            setTimeout(fetchData, 2000); // Reload after a bit
                        } else {
                            toast.error(res.error || 'Failed to start analysis');
                        }
                    }}
                    size="small"
                >
                    Run Sentiment Analysis
                </Button>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconButton
                  onClick={fetchData}
                  disabled={loading}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: theme => theme.shadows[1],
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      boxShadow: theme => theme.shadows[2],
                    }
                  }}
                >
                  <i className={loading ? 'tabler-loader spin' : 'tabler-refresh'} style={{ fontSize: '1.5rem' }} />
                </IconButton>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                    <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                      Smart Reviews™
                    </Typography>
                    <CustomChip
                      label={`${total} Total`}
                      size='small'
                      variant='tonal'
                      color='primary'
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                  </Box>
                  <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                    Manage and monitor your customer reputation across platforms
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
                <CustomTextField
                  id="review-search-filter"
                  placeholder='Search reviews...'
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  sx={{ width: { xs: '100%', sm: 300 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-search' style={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: 'background.paper' }
                  }}
                />
                <CustomTextField
                  id="review-date-filter"
                  type="date"
                  value={filters.date ? filters.date.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 200 } }}
                  InputProps={{ 
                    sx: { borderRadius: 2, bgcolor: 'background.paper' }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        <CardContent sx={{ p: 5 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                id="review-rating-filter"
                select
                fullWidth
                label='Filter by Rating'
                value={filters.rating}
                onChange={e => handleFilterChange('rating', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: 'text.secondary' }}>
                          <i className='tabler-star' style={{ fontSize: '1.2rem' }} />
                          <Typography variant="body2" color="inherit" sx={{ fontWeight: 500 }}>All Ratings</Typography>
                        </Box>
                      )
                    }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <i className='tabler-star' style={{ fontSize: '1.2rem', color: theme.palette.warning.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selected as string} Stars</Typography>
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
                label='Filter by Provider'
                value={filters.platform}
                onChange={e => handleFilterChange('platform', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: 'text.secondary' }}>
                          <i className='tabler-world' style={{ fontSize: '1.2rem' }} />
                          <Typography variant="body2" color="inherit" sx={{ fontWeight: 500 }}>All Providers</Typography>
                        </Box>
                      )
                    }

                    const labels: Record<string, string> = { gbp: 'Google', facebook: 'Facebook', yelp: 'Yelp' }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <i className='tabler-world' style={{ fontSize: '1.2rem', color: theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{labels[selected as string] || (selected as string)}</Typography>
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
                label='Filter by Sentiment'
                value={filters.sentiment}
                onChange={e => handleFilterChange('sentiment', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: 'text.secondary' }}>
                          <i className='tabler-mood-smile' style={{ fontSize: '1.2rem' }} />
                          <Typography variant="body2" color="inherit" sx={{ fontWeight: 500 }}>All Sentiments</Typography>
                        </Box>
                      )
                    }

                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <i className='tabler-mood-smile' style={{ fontSize: '1.2rem', color: theme.palette.info.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selected as string}</Typography>
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
                label='Filter by Status'
                value={filters.replyStatus}
                onChange={e => handleFilterChange('replyStatus', e.target.value)}
                SelectProps={{ 
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: 'text.secondary' }}>
                          <i className='tabler-circle-check' style={{ fontSize: '1.2rem' }} />
                          <Typography variant="body2" color="inherit" sx={{ fontWeight: 500 }}>All Statuses</Typography>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <i className='tabler-circle-check' style={{ fontSize: '1.2rem', color: theme.palette.success.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{labels[selected as string] || (selected as string)}</Typography>
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
        onSuccess={(_updatedReview, shouldClose = true) => {
          fetchData()
          if (shouldClose) setDrawerOpen(false)
        }}
      />
    </>
  )
}

export default SmartReviewList
