import { useQuery } from '@tanstack/react-query'
import { SERVICES_CONFIG } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import type { SeoAlert } from '@/components/shared/dashboard/widgets/seo/SeoAlertStrip'

import type { FixTask } from '@/components/shared/dashboard/widgets/seo/FixPlanBoard'

export interface SeoAnalyzerData {
    seoScore: number
    scanId: string
    lastScannedAt: string
    url: string
    issues: { critical: number; high: number; medium: number; low: number }
    alerts: SeoAlert[]
    htmlDetails: {
        metaTitle: { value: string; isOptimal: boolean; statusLabel: string };
        metaDescription: { value: string; isOptimal: boolean; statusLabel: string };
        wordCount: number;
        statusCode: number;
    }
    categoryScores: Array<{
        id: 'onPage' | 'technical' | 'content';
        label: string;
        score: number;
        description: string;
        checks: Array<{
            id: string;
            label: string;
            status: 'Good' | 'Warning' | 'Critical';
            detail: string;
            severity: string;
            recommendation?: string;
            impact?: string;
        }>;
    }>
    strategicRecommendations: Array<{
        id: string;
        title: string;
        description: string;
        impact: string;
        type: string;
    }>
    fixPlan: FixTask[]
    pagePerformance: {
        mobileSpeed: number
        desktopSpeed: number
        coreWebVitals: number
        avgLoadMs: number
    }
    keywords: {
        total: number
        top10: number
        top20: number
        improved: number
        declined: number
    }
}

const EMPTY_DATA: SeoAnalyzerData = {
    seoScore: 0,
    scanId: '',
    lastScannedAt: '',
    url: '',
    issues: { critical: 0, high: 0, medium: 0, low: 0 },
    alerts: [],
    htmlDetails: { metaTitle: { value: '', isOptimal: false, statusLabel: '' }, metaDescription: { value: '', isOptimal: false, statusLabel: '' }, wordCount: 0, statusCode: 0 },
    categoryScores: [],
    strategicRecommendations: [],
    fixPlan: [],
    pagePerformance: { mobileSpeed: 0, desktopSpeed: 0, coreWebVitals: 0, avgLoadMs: 0 },
    keywords: { total: 0, top10: 0, top20: 0, improved: 0, declined: 0 },
}

const fetchAnalyzerData = async (urlId: string, url: string) => {
    const res = await apiClient.get(
        `${SERVICES_CONFIG.seo.url}/dashboard/analyzer`,
        { params: { urlId, url } }
    )


    return res.data ?? null
}

export const useSeoAnalyzer = (urlId: string, url: string) => {
    const query = useQuery({
        queryKey: ['seoAnalyzer', urlId],
        queryFn: () => fetchAnalyzerData(urlId, url),
        staleTime: 1000 * 60 * 5,
        enabled: Boolean(urlId)
    })

    const data: SeoAnalyzerData = query.data ?? EMPTY_DATA

    return {
        data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch
    }
}
