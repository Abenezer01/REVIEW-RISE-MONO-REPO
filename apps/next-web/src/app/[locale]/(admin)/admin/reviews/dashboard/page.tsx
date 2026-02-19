'use client'

import { useState } from 'react'

import { useSearchParams } from 'next/navigation'

import ReviewsIcon from '@mui/icons-material/RateReview'
import ReplyIcon from '@mui/icons-material/Reply'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

import CompetitorComparison from '@/components/shared/dashboard/CompetitorComparison'
import DashboardLineChart from '@/components/shared/dashboard/DashboardLineChart'
import KeywordCloud from '@/components/shared/dashboard/KeywordCloud'
import RecentReviewsWidget from '@/components/shared/dashboard/RecentReviewsWidget'
import ReviewMetricCard from '@/components/shared/dashboard/ReviewMetricCard'
import SentimentHeatmap from '@/components/shared/dashboard/SentimentHeatmap'
import { useReviewAnalytics } from '@/hooks/reviews/useReviewAnalytics'
import { useBusinessId } from '@/hooks/useBusinessId'

const ReviewsDashboard = () => {
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const [period, setPeriod] = useState<number>(30)
  const { businessId, loading: businessLoading } = useBusinessId()

  const searchParams = useSearchParams()
  const locationId = searchParams.get('locationId') || 'all'

  const {
    ratingTrend,
    volumeData,
    sentimentData,
    keywordsData,
    summaryData,
    competitorData,
    dashboardMetrics,
    isLoading: analyticsLoading
  } = useReviewAnalytics(businessId || '', locationId, period)

  const handlePeriodChange = (event: SelectChangeEvent<number>) => {
    setPeriod(event.target.value as number)
  }

  const isLoading = businessLoading || analyticsLoading || !businessId
  
  // Data for Recent Reviews Widget
  const recentSummary = summaryData.data

  // Data for Metric Cards
  const dashboardStats = dashboardMetrics.data

  const metrics = {
    // Top Cards Data
    avgRating: dashboardStats?.averageRating || 0,
    totalReviews: dashboardStats?.totalReviews || 0,
    responseCount: dashboardStats?.responseCount || 0,
    positiveSentiment: dashboardStats?.positiveSentiment || 0,
    
    // Changes
    avgRatingChange: dashboardStats?.changes?.averageRating || 0,
    totalReviewsChange: dashboardStats?.changes?.totalReviews || 0,
    responseCountChange: dashboardStats?.changes?.responseCount || 0,
    sentimentChange: dashboardStats?.changes?.positiveSentiment || 0,

    // Widget Data
    reviews: recentSummary?.reviews || [],
    unrepliedCount: recentSummary?.unrepliedCount || 0,
    recentRepliesCount: recentSummary?.recentRepliesCount || 0,
  }
  
  // Rating Trend
  const trendData = (ratingTrend.data && Array.isArray(ratingTrend.data) && ratingTrend.data.length > 0)
    ? ratingTrend.data
    : []

  // Volume
  const volumeSeriesData = (volumeData.data && Array.isArray(volumeData.data) && volumeData.data.length > 0)
    ? volumeData.data
    : []

  // Sentiment
  const sentimentHeatmapData = (sentimentData.data && Array.isArray(sentimentData.data) && sentimentData.data.length > 0)
    ? sentimentData.data
    : []

    // Keywords
  const keywordsCloudData = (keywordsData.data && Array.isArray(keywordsData.data) && keywordsData.data.length > 0)
    ? keywordsData.data
    : []

  // Competitors
  const competitorListData = (competitorData.data?.competitors && competitorData.data.competitors.length > 0)
    ? competitorData.data.competitors
    : []


  // Prepare Volume Series for Chart
  const preparedVolumeSeries = (() => {
      const data = volumeSeriesData

      if (!data || data.length === 0) return []
      
      const platforms = new Set<string>()


      // Check if data item has 'volumes' property (mock structure)
      if (data[0].volumes) {
          data.forEach((d: any) => Object.keys(d.volumes).forEach(p => platforms.add(p)))
          
return Array.from(platforms).map(platform => ({
            name: platform,
            data: data.map((d: any) => d.volumes[platform] || 0)
          }))
      }

      return []
   })()


  return (
    <Box>
      {/* Header with Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {t('reviews.smart.manageSubtitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('reviews.smart.subtitle')}
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'warning.main',
              color: 'warning.contrastText'
            }}
          >
            <Typography variant="caption" fontWeight={600}>
              { '📅' } {t('brandRise.visibilityPlan.dayTimeline')} {period} {tc('common.days')}
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{tc('common.search')}</InputLabel>
            <Select value={period} onChange={handlePeriodChange} label={tc('common.search')}>
              <MenuItem value={30}>{t('brandRise.visibilityPlan.dayTimeline')} {30}</MenuItem>
              <MenuItem value={90}>{t('brandRise.visibilityPlan.dayTimeline')} {90}</MenuItem>
            </Select>
          </FormControl>

          <Box
            component="button"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              { '⬇️' } {tc('common.export')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Metric Cards */}
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title={t('overview.averageRating').toUpperCase()}
              value={metrics.avgRating?.toFixed(1) || '0.0'}
              icon={<StarIcon />}
              color="warning"
              change={metrics.avgRatingChange}
              subtitle={t('brandRise.overview.vsLastPeriod')}
            />
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title={t('overview.totalReviews').toUpperCase()}
              value={metrics.totalReviews?.toLocaleString() || '0'}
              icon={<ReviewsIcon />}
              color="info"
              change={metrics.totalReviewsChange}
              subtitle={t('brandRise.overview.vsLastPeriod')}
            />
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title={t('overview.responseRate').toUpperCase()}
              value={metrics.responseCount?.toLocaleString() || '0'}
              icon={<ReplyIcon />}
              color="success"
              change={metrics.responseCountChange}
              subtitle={t('brandRise.overview.vsLastPeriod')}
            />
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title={t('brandRise.reviews.positiveSentiment').toUpperCase()}
              value={`${metrics.positiveSentiment || 0}%`} 
              icon={<StarIcon />}
              color="secondary"
              change={metrics.sentimentChange}
              subtitle={tc('common.apply')}
            />
          </Grid>

          {/* Rating Trend Chart */}
          <Grid size={{xs: 12, lg: 8}}>
            <DashboardLineChart
              title={t('seo.visibility.trendsTitle')}
              subtitle={t('brandRise.overview.last30Days')}
              series={[{ name: t('overview.averageRating'), data: trendData.map((d: any) => d.averageRating) || [] }]}
              categories={trendData.map((d: any) => d.date) || []}
              yAxisFormatter={(val: number) => val.toFixed(1)}
              xAxisType="datetime"
            />
          </Grid>

          {/* Recent Reviews Widget */}
          <Grid size={{xs: 12, lg: 4}}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={t('reviews.recent')}
                action={
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`${metrics.unrepliedCount || 0} ${t('overview.pendingReviews')}`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${metrics.recentRepliesCount || 0} ${tc('dates.thisWeek')}`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
              />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                  <Box display="flex" gap={4}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight={700} color="error.main">
                        {metrics.unrepliedCount || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('overview.pendingReviews').toUpperCase()}
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight={700} color="success.main">
                        {metrics.recentRepliesCount || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tc('dates.thisWeek').toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                  <RecentReviewsWidget
                    reviews={metrics.reviews || []}
                    unrepliedCount={metrics.unrepliedCount || 0}
                    recentRepliesCount={metrics.recentRepliesCount || 0}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Row 1: Review Volume (8) + Keywords (4) */}
          <Grid size={{xs: 12, md: 8}}>
            <DashboardLineChart
              title={t('brandRise.reviews.velocity')}
              subtitle={t('brandRise.reviews.volumeOverTime')}
              series={preparedVolumeSeries}
              categories={volumeSeriesData.map((d: any) => d.date) || []}
              yAxisFormatter={(val: number) => Math.floor(val).toString()} // Integers only
              xAxisType="datetime"
            />
          </Grid>

          <Grid size={{xs: 12, md: 4}}>
            <KeywordCloud
              title={t('seo.visibility.trackedKeywords')}
              subtitle={t('brandRise.dna.toneKeywords')}
              keywords={keywordsCloudData}
            />
          </Grid>
          
          {/* Row 2: Sentiment (8) + Competitor (4) */}
          <Grid size={{xs: 12, md: 8}}>
            <SentimentHeatmap
              title={t('brandRise.reviews.sentiment')}
              subtitle={t('brandRise.reviews.sentimentModel')}
              data={sentimentHeatmapData}
            />
          </Grid>
          
          <Grid size={{xs: 12, md: 4}}>
             <CompetitorComparison 
                businessStats={{ averageRating: metrics.avgRating || 0, totalReviews: metrics.totalReviews || 0 }}
                competitors={competitorListData}
             />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ReviewsDashboard
