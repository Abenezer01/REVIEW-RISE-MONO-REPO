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

export const useRatingTrend = (params: RatingTrendParams) => {
  return useApiGet(
    ['analytics', 'rating-trend', params.businessId, params.locationId || 'all', String(params.period)],
    '/api/reviews/analytics/rating-trend',
    params,
    { enabled: !!params.businessId }
  )
}

export const useReviewVolume = (params: VolumeParams) => {
  return useApiGet(
    ['analytics', 'volume', params.businessId, params.locationId || 'all', String(params.period)],
    '/api/reviews/analytics/volume',
    params,
    { enabled: !!params.businessId }
  )
}

export const useSentimentHeatmap = (params: SentimentParams) => {
  return useApiGet(
    ['analytics', 'sentiment', params.businessId, params.locationId || 'all', String(params.period), params.groupBy || 'day'],
    '/api/reviews/analytics/sentiment',
    params,
    { enabled: !!params.businessId }
  )
}

export const useTopKeywords = (params: KeywordsParams) => {
  return useApiGet(
    ['analytics', 'keywords', params.businessId, params.locationId || 'all', String(params.limit)],
    '/api/reviews/analytics/keywords',
    params,
    { enabled: !!params.businessId }
  )
}

export const useRecentSummary = (params: SummaryParams) => {
  return useApiGet(
    ['analytics', 'summary', params.businessId, params.locationId || 'all', String(params.limit)],
    '/api/reviews/analytics/summary',
    params,
    { enabled: !!params.businessId }
  )
}

export const useCompetitorComparison = (params: ComparisonParams) => {
  return useApiGet(
    ['analytics', 'competitor-comparison', params.businessId, params.locationId || 'all'],
    '/api/reviews/analytics/competitor-comparison',
    params,
    { enabled: !!params.businessId }
  )
}

export const useAddCompetitor = () => {
  const queryClient = useQueryClient()
  return useApiPost(
    '/api/reviews/analytics/competitors',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['analytics', 'competitor-comparison'] })
      }
    }
  )
}

export const useReviewAnalytics = (businessId: string, locationId?: string, period = 30) => {
  const trend = useRatingTrend({ businessId, locationId: locationId === 'all' ? undefined : locationId, period })
  const volume = useReviewVolume({ businessId, locationId: locationId === 'all' ? undefined : locationId, period })
  const sentiment = useSentimentHeatmap({ businessId, locationId: locationId === 'all' ? undefined : locationId, period })
  const keywords = useTopKeywords({ businessId, locationId: locationId === 'all' ? undefined : locationId })
  const summary = useRecentSummary({ businessId, locationId: locationId === 'all' ? undefined : locationId })
  const comparison = useCompetitorComparison({ businessId, locationId: locationId === 'all' ? undefined : locationId })
  const addCompetitor = useAddCompetitor()

  return {
    ratingTrend: trend,
    volumeData: volume,
    sentimentData: sentiment,
    keywordsData: keywords,
    summaryData: summary,
    competitorData: comparison,
    addCompetitor,
    isLoading: trend.isLoading || volume.isLoading || sentiment.isLoading || keywords.isLoading || summary.isLoading || comparison.isLoading,
    isError: trend.isError || volume.isError || sentiment.isError || keywords.isError || summary.isError || comparison.isError
  }
}
