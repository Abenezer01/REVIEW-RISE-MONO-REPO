'use client'

import { useState } from 'react'

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

import CompetitorComparison from '@/components/shared/dashboard/CompetitorComparison'
import DashboardLineChart from '@/components/shared/dashboard/DashboardLineChart'
import KeywordCloud from '@/components/shared/dashboard/KeywordCloud'
import RecentReviewsWidget from '@/components/shared/dashboard/RecentReviewsWidget'
import ReviewMetricCard from '@/components/shared/dashboard/ReviewMetricCard'
import SentimentHeatmap from '@/components/shared/dashboard/SentimentHeatmap'
import { useReviewAnalytics } from '@/hooks/reviews/useReviewAnalytics'
import { useBusinessId } from '@/hooks/useBusinessId'
import { useSearchParams } from 'next/navigation'

const ReviewsDashboard = () => {
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
  
  // Data for Recent Reviews Widget (keep using summaryData)
  const recentSummary = summaryData.data?.data

  // Data for Metric Cards (use new dashboardMetrics)
  const dashboardStats = dashboardMetrics.data?.data

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
  const trendData = (ratingTrend.data?.data && ratingTrend.data.data.length > 0) 
    ? ratingTrend.data.data 
    : []

  // Volume
  const volumeSeriesData = (volumeData.data?.data && volumeData.data.data.length > 0)
    ? volumeData.data.data
    : []

  // Sentiment
  const sentimentHeatmapData = (sentimentData.data?.data && sentimentData.data.data.length > 0)
    ? sentimentData.data.data
    : []

    // Keywords
  const keywordsCloudData = (keywordsData.data?.data && keywordsData.data.data.length > 0)
    ? keywordsData.data.data
    : []

  // Competitors
  const competitorListData = (competitorData.data?.data?.competitors && competitorData.data.data.competitors.length > 0)
    ? competitorData.data.data.competitors
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


      // Handle potential API variance if it returns something else? 
      // Assuming API returns same structure as mock for now based on controller code.
      // Controller returns: { date, volumes: { [platform]: number } }
      return []
   })()


  return (
    <Box>
      {/* Header with Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Review Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered insights from customer reviews across all platforms
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
              📅 Last {period} Days
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={handlePeriodChange} label="Period">
              <MenuItem value={30}>Last 30 Days</MenuItem>
              <MenuItem value={90}>Last 90 Days</MenuItem>
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
              ⬇️ Export
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
              title="AVG. RATING"
              value={metrics.avgRating?.toFixed(1) || '0.0'}
              icon={<StarIcon />}
              color="warning"
              change={metrics.avgRatingChange}
              subtitle="vs last period"
            />
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title="TOTAL REVIEWS"
              value={metrics.totalReviews?.toLocaleString() || '0'}
              icon={<ReviewsIcon />}
              color="info"
              change={metrics.totalReviewsChange}
              subtitle="vs last period"
            />
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title="TOTAL REPLIES"
              value={metrics.responseCount?.toLocaleString() || '0'}
              icon={<ReplyIcon />}
              color="success"
              change={metrics.responseCountChange}
              subtitle="vs last period"
            />
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <ReviewMetricCard
              title="POSITIVE SENTIMENT"
              value={`${metrics.positiveSentiment || 0}%`} 
              icon={<StarIcon />}
              color="secondary"
              change={metrics.sentimentChange}
              subtitle="improvement"
            />
          </Grid>

          {/* Rating Trend Chart */}
          <Grid size={{xs: 12, lg: 8}}>
            <DashboardLineChart
              title="Rating Trend"
              subtitle={`Average rating over time (Last ${period} days)`}
              series={[{ name: 'Average Rating', data: trendData.map((d: any) => d.averageRating) || [] }]}
              categories={trendData.map((d: any) => d.date) || []}
              yAxisFormatter={(val: number) => val.toFixed(1)}
              xAxisType="datetime"
            />
          </Grid>

          {/* Recent Reviews Widget */}
          <Grid size={{xs: 12, lg: 4}}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title="Recent Reviews Summary"
                action={
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`${metrics.unrepliedCount || 0} Unreplied`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${metrics.recentRepliesCount || 0} Last 7 Days`}
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
                        UNREPLIED
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight={700} color="success.main">
                        {metrics.recentRepliesCount || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        LAST 7 DAYS
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
              title="Review Volume by Source"
              subtitle="Number of reviews per platform over time"
              series={preparedVolumeSeries}
              categories={volumeSeriesData.map((d: any) => d.date) || []}
              yAxisFormatter={(val: number) => Math.floor(val).toString()} // Integers only
              xAxisType="datetime"
            />
          </Grid>

          <Grid size={{xs: 12, md: 4}}>
            <KeywordCloud
              title="Top Keywords"
              subtitle="Most mentioned topics in reviews"
              keywords={keywordsCloudData}
            />
          </Grid>
          
          {/* Row 2: Sentiment (8) + Competitor (4) */}
          <Grid size={{xs: 12, md: 8}}>
            <SentimentHeatmap
              title="Sentiment Analysis"
              subtitle="Sentiment distribution over time"
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
