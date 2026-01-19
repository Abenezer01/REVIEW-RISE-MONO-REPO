import { useQueryClient } from '@tanstack/react-query'

import { useApiGet, useApiPost } from '@/hooks/useApi'

interface RatingTrendParams {
  businessId: string
  locationId?: string
  period?: number
}

interface VolumeParams {
  businessId: string
  locationId?: string
  period?: number
}

interface SentimentParams {
  businessId: string
  locationId?: string
  period?: number
  groupBy?: 'day' | 'week'
}

interface KeywordsParams {
  businessId: string
  locationId?: string
  limit?: number
}

interface SummaryParams {
  businessId: string
  locationId?: string
  limit?: number
}

interface ComparisonParams {
  businessId: string
  locationId?: string
}

const REVIEWS_API = process.env.NEXT_PUBLIC_REVIEWS_API_URL || 'http://localhost:3006/api/v1'

export const useRatingTrend = (params: RatingTrendParams) => {
  return useApiGet(
    ['analytics', 'rating-trend', params.businessId, params.locationId || 'all', String(params.period)],
    `${REVIEWS_API}/reviews/analytics/rating-trend`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useReviewVolume = (params: VolumeParams) => {
  return useApiGet(
    ['analytics', 'volume', params.businessId, params.locationId || 'all', String(params.period)],
    `${REVIEWS_API}/reviews/analytics/volume`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useSentimentHeatmap = (params: SentimentParams) => {
  return useApiGet(
    ['analytics', 'sentiment', params.businessId, params.locationId || 'all', String(params.period), params.groupBy || 'day'],
    `${REVIEWS_API}/reviews/analytics/sentiment`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useTopKeywords = (params: KeywordsParams) => {
  return useApiGet(
    ['analytics', 'keywords', params.businessId, params.locationId || 'all', String(params.limit)],
    `${REVIEWS_API}/reviews/analytics/keywords`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useRecentSummary = (params: SummaryParams) => {
  return useApiGet(
    ['analytics', 'summary', params.businessId, params.locationId || 'all', String(params.limit)],
    `${REVIEWS_API}/reviews/analytics/summary`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useCompetitorComparison = (params: ComparisonParams) => {
  return useApiGet(
    ['analytics', 'competitor-comparison', params.businessId, params.locationId || 'all'],
    `${REVIEWS_API}/reviews/analytics/competitor-comparison`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useAddCompetitor = () => {
  const queryClient = useQueryClient()

  
return useApiPost(
    `${REVIEWS_API}/reviews/analytics/competitors`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['analytics', 'competitor-comparison'] })
      }
    }
  )
}

export const useDashboardMetrics = (params: SummaryParams) => {
  return useApiGet(
    ['analytics', 'metrics', params.businessId, params.locationId || 'all', String(params.limit)],
    `${REVIEWS_API}/reviews/analytics/metrics`,
    params,
    { enabled: !!params.businessId }
  )
}

export const useReviewAnalytics = (businessId: string, locationId?: string, period = 30) => {
  const trend = useRatingTrend({ businessId, locationId: locationId === 'all' ? undefined : locationId, period })
  const volume = useReviewVolume({ businessId, locationId: locationId === 'all' ? undefined : locationId, period })
  const sentiment = useSentimentHeatmap({ businessId, locationId: locationId === 'all' ? undefined : locationId, period })
  const keywords = useTopKeywords({ businessId, locationId: locationId === 'all' ? undefined : locationId })
  const summary = useRecentSummary({ businessId, locationId: locationId === 'all' ? undefined : locationId })
  const comparison = useCompetitorComparison({ businessId, locationId: locationId === 'all' ? undefined : locationId })
  const metrics = useDashboardMetrics({ businessId, locationId: locationId === 'all' ? undefined : locationId, limit: period })
  const addCompetitor = useAddCompetitor()

  return {
    ratingTrend: trend,
    volumeData: volume,
    sentimentData: sentiment,
    keywordsData: keywords,
    summaryData: summary,
    competitorData: comparison,
    dashboardMetrics: metrics,
    addCompetitor,
    isLoading: trend.isLoading || volume.isLoading || sentiment.isLoading || keywords.isLoading || summary.isLoading || comparison.isLoading || metrics.isLoading,
    isError: trend.isError || volume.isError || sentiment.isError || keywords.isError || summary.isError || comparison.isError || metrics.isError
  }
}
