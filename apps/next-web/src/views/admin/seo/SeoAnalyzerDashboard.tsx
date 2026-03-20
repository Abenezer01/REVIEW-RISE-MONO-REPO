/* eslint-disable react/jsx-no-literals */
'use client'
import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

import { useSeoAnalyzer } from './hooks/useSeoAnalyzer'

// Widgets
import SeoTopBar from '@/components/shared/dashboard/widgets/seo/SeoTopBar'
import AnalyzerHeroPanel from '@/components/shared/dashboard/widgets/seo/AnalyzerHeroPanel'
import HtmlPageDetailsCard from '@/components/shared/dashboard/widgets/seo/HtmlPageDetailsCard'
import CategoryBreakdownAccordion from '@/components/shared/dashboard/widgets/seo/CategoryBreakdownAccordion'
import CriticalIssuesList from '@/components/shared/dashboard/widgets/seo/CriticalIssuesList'
import StrategicInsightsCard from '@/components/shared/dashboard/widgets/seo/StrategicInsightsCard'
import FixPlanBoard from '@/components/shared/dashboard/widgets/seo/FixPlanBoard'
import PagePerformanceCard from '@/components/shared/dashboard/widgets/seo/PagePerformanceCard'
import KeywordRankingsCard from '@/components/shared/dashboard/widgets/seo/KeywordRankingsCard'



export default function SeoAnalyzerDashboard() {
    // Mock URLs for URL Manager
    const urls = [
        { id: 'url-1', url: 'https://www.google.com' },
        { id: 'url-2', url: 'https://example.com/blog' },
        { id: 'url-3', url: 'https://example.com/shop' },
    ]

    const [selectedUrlId, setSelectedUrlId] = useState(urls[0].id)

    const [isScanning, setIsScanning] = useState(false)

    const currentUrl = urls.find(u => u.id === selectedUrlId)?.url || urls[0].url
    const { data, isLoading, isFetching, refetch } = useSeoAnalyzer(selectedUrlId, currentUrl)
    const activeLoading = isLoading || (isFetching && isScanning)

    const handleRunScan = async () => {
        setIsScanning(true)

        // Simulate a real 2-second scan delay before invalidating
        await new Promise(r => setTimeout(r, 2000))
        await refetch()
        setIsScanning(false)
    }

    // Extract critical issues from category checks
    const criticalIssues = data?.categoryScores
        ? data.categoryScores.flatMap(cat => cat.checks)
            .filter(c => c.severity === 'critical' || c.severity === 'high')
            .map(c => ({
                id: c.id,
                issue: c.label,
                recommendation: c.detail,
                impact: c.impact || '+10% CTR',
                difficulty: 'Requires Dev',
                category: c.severity === 'critical' ? 'Technical' : 'Content'
            }))
        : [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>

            <SeoTopBar
                urls={urls}
                selectedUrlId={selectedUrlId}
                onUrlChange={setSelectedUrlId}
                isScanning={isScanning}
                onRunScan={handleRunScan}
            />

            {!activeLoading && data && (
                <Box sx={{ mt: 4 }}>
                    {/* Hero Panel (Score & Top Stats) */}
                    <AnalyzerHeroPanel
                        score={data.seoScore}
                        issuesCount={data.issues.critical + data.issues.high + data.issues.medium + data.issues.low}
                        criticalCount={data.issues.critical}
                        loadTimeMs={data.htmlDetails?.statusCode === 200 ? 1200 : 0}
                        onDownload={() => console.log('Exporting...')}
                        onShare={() => console.log('Sharing...')}
                    />

                    <Grid container spacing={4}>
                        {/* Left Column: Diagnostics & Details */}
                        <Grid size={{ xs: 12, lg: 7 }}>

                            {/* 1. Critical Issues */}
                            <CriticalIssuesList issues={criticalIssues} />

                            {/* 2. HTML Page Details (Expandable) */}
                            {data.htmlDetails && <HtmlPageDetailsCard details={data.htmlDetails} url={data.url || urls.find(u => u.id === selectedUrlId)?.url || ''} />}

                            {/* 3. Category Breakdowns (Accordion style) */}
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, mt: 5 }}>
                                {'Health Breakdown'}
                            </Typography>
                            {data.categoryScores && <CategoryBreakdownAccordion categories={data.categoryScores} />}

                        </Grid>

                        {/* Right Column: Strategy & Operations */}
                        <Grid size={{ xs: 12, lg: 5 }}>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* 1. Strategic Insights */}
                                {data.strategicRecommendations && <StrategicInsightsCard insights={data.strategicRecommendations} />}

                                {/* 2. Fix Plan Task Board */}
                                <FixPlanBoard
                                    scanId={data.scanId}
                                    tasks={data.fixPlan}
                                    onRescan={handleRunScan}
                                    isLoading={activeLoading}
                                />

                                {/* 3. Performance & Layout */}
                                <PagePerformanceCard
                                    mobileSpeed={data.pagePerformance.mobileSpeed}
                                    desktopSpeed={data.pagePerformance.desktopSpeed}
                                    coreWebVitals={data.pagePerformance.coreWebVitals}
                                    avgLoadMs={data.pagePerformance.avgLoadMs}
                                    isLoading={activeLoading}
                                />

                                {/* 4. Keyword Overview */}
                                <KeywordRankingsCard
                                    total={data.keywords.total}
                                    top10={data.keywords.top10}
                                    top20={data.keywords.top20}
                                    improved={data.keywords.improved}
                                    declined={data.keywords.declined}
                                    isLoading={activeLoading}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

        </Box>
    )
}
