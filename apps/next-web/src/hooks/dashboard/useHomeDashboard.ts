import { useQuery } from '@tanstack/react-query'
import { SERVICES_CONFIG } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import type { LocationEntry } from '@/components/shared/dashboard/widgets/LocationHealthMap'
import type { AlertType } from '@/components/shared/dashboard/widgets/InsightStrip'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HomeDashboardData {

    // Core KPIs
    seoScore: number
    reviewRating: number
    listingsAccuracy: number
    seoFixes: string[]
    newReviewsCount: number
    totalReviewCount: number
    responseRate: number
    sentimentPositive: number
    napStatus: 'Healthy' | 'Warning' | 'Critical'
    missingCount: number
    trends: Array<{ date: string; seo: number; rating: number; reviews: number; listings: number }>
    alerts: Array<{ id: string; type: AlertType; message: string; actionLabel: string; onAction?: () => void }>

    // P1: GBP Performance
    gbpImpressions: number
    gbpSearches: number
    gbpCalls: number
    gbpDirections: number
    gbpImpressionsDelta: number
    gbpCallsDelta: number

    // P1: Weekly Digest
    weeklyDigest: {
        seoChange: number
        ratingChange: number
        reviewsChange: number
        listingsChange: number
    }

    // P2: Review Velocity
    reviewsPerWeek: number
    avgResponseTimeHours: number
    reviewVelocityDelta: number

    // P3: Competitor Benchmark
    competitor: {
        avgRating: number
        avgReviewCount: number
        avgSeoScore: number
    }

    // P3: Locations
    locations: LocationEntry[]
}

// ─── Fallback empty data ──────────────────────────────────────────────────────

const EMPTY_DATA: HomeDashboardData = {
    seoScore: 0,
    reviewRating: 0,
    listingsAccuracy: 0,
    seoFixes: [],
    newReviewsCount: 0,
    totalReviewCount: 0,
    responseRate: 0,
    sentimentPositive: 0,
    napStatus: 'Healthy',
    missingCount: 0,
    trends: [],
    alerts: [],
    gbpImpressions: 0,
    gbpSearches: 0,
    gbpCalls: 0,
    gbpDirections: 0,
    gbpImpressionsDelta: 0,
    gbpCallsDelta: 0,
    weeklyDigest: { seoChange: 0, ratingChange: 0, reviewsChange: 0, listingsChange: 0 },
    reviewsPerWeek: 0,
    avgResponseTimeHours: 0,
    reviewVelocityDelta: 0,
    competitor: { avgRating: 0, avgReviewCount: 0, avgSeoScore: 0 },
    locations: [],
}

// ─── API fetchers ─────────────────────────────────────────────────────────────

const fetchSeoSummary = async (locationId: string, dateFilter: string) => {
    const res = await apiClient.get(
        `${SERVICES_CONFIG.seo.url}/dashboard/summary`,
        { params: { locationId, dateFilter } }
    )

    
return res.data?.data ?? {}
}

const fetchReviewsSummary = async (locationId: string, dateFilter: string) => {
    const res = await apiClient.get(
        `${SERVICES_CONFIG.review.url}/dashboard/summary`,
        { params: { locationId, dateFilter } }
    )

    
return res.data?.data ?? {}
}

const fetchListingsSummary = async (locationId: string, dateFilter: string) => {
    const res = await apiClient.get(
        `${SERVICES_CONFIG.gbp.url}/dashboard/summary`,
        { params: { locationId, dateFilter } }
    )

    
return res.data?.data ?? {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useHomeDashboard = (locationId: string, dateFilter: string) => {
    const seoQuery = useQuery({
        queryKey: ['dashboard', 'seo', locationId, dateFilter],
        queryFn: () => fetchSeoSummary(locationId, dateFilter),
        staleTime: 1000 * 60 * 5,
    })

    const reviewsQuery = useQuery({
        queryKey: ['dashboard', 'reviews', locationId, dateFilter],
        queryFn: () => fetchReviewsSummary(locationId, dateFilter),
        staleTime: 1000 * 60 * 5,
    })

    const listingsQuery = useQuery({
        queryKey: ['dashboard', 'listings', locationId, dateFilter],
        queryFn: () => fetchListingsSummary(locationId, dateFilter),
        staleTime: 1000 * 60 * 5,
    })

    const isLoading = seoQuery.isLoading || reviewsQuery.isLoading || listingsQuery.isLoading
    const isError = seoQuery.isError || reviewsQuery.isError || listingsQuery.isError

    const seoData = seoQuery.data ?? {}
    const reviewsData = reviewsQuery.data ?? {}
    const listingsData = listingsQuery.data ?? {}

    // Merge trend arrays by date
    const trendDates: string[] = (seoData.trends ?? []).map((t: any) => t.date)

    const trends = trendDates.map((date: string) => ({
        date,
        seo: (seoData.trends ?? []).find((t: any) => t.date === date)?.seo ?? 0,
        rating: (reviewsData.trends ?? []).find((t: any) => t.date === date)?.rating ?? 0,
        reviews: (reviewsData.trends ?? []).find((t: any) => t.date === date)?.reviews ?? 0,
        listings: (listingsData.trends ?? []).find((t: any) => t.date === date)?.listings ?? 0,
    }))

    const alerts = [
        ...(listingsData.alerts ?? []),
        ...(reviewsData.alerts ?? []),
    ]

    const data: HomeDashboardData = isLoading ? EMPTY_DATA : {
        // Core KPIs
        seoScore: seoData.seoScore ?? 0,
        seoFixes: seoData.seoFixes ?? [],
        reviewRating: reviewsData.reviewRating ?? 0,
        newReviewsCount: reviewsData.newReviewsCount ?? 0,
        totalReviewCount: reviewsData.totalReviewCount ?? 0,
        responseRate: reviewsData.responseRate ?? 0,
        sentimentPositive: reviewsData.sentimentPositive ?? 0,
        listingsAccuracy: listingsData.listingsAccuracy ?? 0,
        napStatus: listingsData.napStatus ?? 'Healthy',
        missingCount: listingsData.missingCount ?? 0,
        trends,
        alerts,

        // P1: GBP Performance (from listings/GBP service)
        gbpImpressions: listingsData.gbpImpressions ?? 0,
        gbpSearches: listingsData.gbpSearches ?? 0,
        gbpCalls: listingsData.gbpCalls ?? 0,
        gbpDirections: listingsData.gbpDirections ?? 0,
        gbpImpressionsDelta: listingsData.gbpImpressionsDelta ?? 0,
        gbpCallsDelta: listingsData.gbpCallsDelta ?? 0,

        // P1: Weekly Digest (aggregated from all 3 services)
        weeklyDigest: {
            seoChange: seoData.weeklyDigest?.seoChange ?? 0,
            ratingChange: reviewsData.weeklyDigest?.ratingChange ?? 0,
            reviewsChange: reviewsData.weeklyDigest?.reviewsChange ?? 0,
            listingsChange: listingsData.weeklyDigest?.listingsChange ?? 0,
        },

        // P2: Review Velocity (from reviews service)
        reviewsPerWeek: reviewsData.reviewsPerWeek ?? 0,
        avgResponseTimeHours: reviewsData.avgResponseTimeHours ?? 0,
        reviewVelocityDelta: reviewsData.reviewVelocityDelta ?? 0,

        // P3: Competitor Benchmark (from GBP service)
        competitor: {
            avgRating: listingsData.competitor?.avgRating ?? 0,
            avgReviewCount: listingsData.competitor?.avgReviewCount ?? 0,
            avgSeoScore: listingsData.competitor?.avgSeoScore ?? 0,
        },

        // P3: Locations (from GBP service)
        locations: listingsData.locations ?? [],
    }

    const score = Math.round(
        (data.seoScore * 0.4) +
        ((data.reviewRating / 5) * 100 * 0.4) +
        (data.listingsAccuracy * 0.2)
    )

    return { data, isLoading, isError, score }
}
