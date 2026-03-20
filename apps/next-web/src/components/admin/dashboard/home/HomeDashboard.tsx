/* eslint-disable react/jsx-no-literals */
'use client'

import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

// Existing widgets
import BusinessHealthCard from '@/components/shared/dashboard/widgets/BusinessHealthCard'
import SEOCard from '@/components/shared/dashboard/widgets/SEOCard'
import ReputationCard from '@/components/shared/dashboard/widgets/ReputationCard'
import ListingsCard from '@/components/shared/dashboard/widgets/ListingsCard'
import InsightStrip from '@/components/shared/dashboard/widgets/InsightStrip'
import TrendsLineChart from '@/components/shared/dashboard/widgets/charts/TrendsLineChart'
import DualAxisReviewChart from '@/components/shared/dashboard/widgets/charts/DualAxisReviewChart'

// New P1/P2/P3 widgets
import WeeklyDigestCard from '@/components/shared/dashboard/widgets/WeeklyDigestCard'
import GbpPerformanceCard from '@/components/shared/dashboard/widgets/GbpPerformanceCard'
import ReviewVelocityCard from '@/components/shared/dashboard/widgets/ReviewVelocityCard'
import CustomerJourneyFunnel from '@/components/shared/dashboard/widgets/CustomerJourneyFunnel'
import CompetitorBenchmarkStrip from '@/components/shared/dashboard/widgets/CompetitorBenchmarkStrip'
import LocationHealthMap from '@/components/shared/dashboard/widgets/LocationHealthMap'

// Hook & filter
import { useHomeDashboard } from '@/hooks/dashboard/useHomeDashboard'
import type { DateFilterValue } from '@/components/shared/dashboard/widgets/HomeDateFilter'
import HomeDateFilter from '@/components/shared/dashboard/widgets/HomeDateFilter'
import { useLocationFilter } from '@/hooks/useLocationFilter'

export default function HomeDashboard() {
    const [dateFilter, setDateFilter] = useState<DateFilterValue>('30D')
    const { locationId } = useLocationFilter()
    const { data, isLoading, score } = useHomeDashboard(locationId ?? 'all', dateFilter)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, md: 4 }, gap: 4, bgcolor: 'background.default', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>Executive Overview</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Your business health at a glance</Typography>
                </Box>
                <HomeDateFilter value={dateFilter} onChange={setDateFilter} />
            </Box>

            {/* ── Weekly Digest (full width) ── */}
            <WeeklyDigestCard
                seoChange={data.weeklyDigest.seoChange}
                ratingChange={data.weeklyDigest.ratingChange}
                reviewsChange={data.weeklyDigest.reviewsChange}
                listingsChange={data.weeklyDigest.listingsChange}
                isLoading={isLoading}
            />

            {/* ── Hero Row ── */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <BusinessHealthCard
                        score={score}
                        seoScore={data.seoScore}
                        reviewRating={data.reviewRating}
                        listingsAccuracy={data.listingsAccuracy}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <SEOCard
                        score={data.seoScore}
                        delta={data.weeklyDigest.seoChange}
                        fixes={data.seoFixes}
                        onRunScan={() => console.log('Scan')}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <ReputationCard
                        rating={data.reviewRating}
                        newReviewsCount={data.newReviewsCount}
                        responseRate={data.responseRate}
                        sentimentPositive={data.sentimentPositive}
                        onReply={() => console.log('Reply')}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <ListingsCard
                        accuracyPercentage={data.listingsAccuracy}
                        napStatus={data.napStatus}
                        missingCount={data.missingCount}
                        onFix={() => console.log('Fix')}
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* ── Insight Strip ── */}
            <InsightStrip alerts={data.alerts} />

            {/* ── P1 + P2 Row: GBP, Review Velocity, Customer Journey ── */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <GbpPerformanceCard
                        impressions={data.gbpImpressions}
                        searches={data.gbpSearches}
                        calls={data.gbpCalls}
                        directionRequests={data.gbpDirections}
                        impressionsDelta={data.gbpImpressionsDelta}
                        callsDelta={data.gbpCallsDelta}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <ReviewVelocityCard
                        reviewsPerWeek={data.reviewsPerWeek}
                        avgResponseTimeHours={data.avgResponseTimeHours}
                        velocityDelta={data.reviewVelocityDelta}
                        isLoading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 12, lg: 6 }}>
                    <CustomerJourneyFunnel
                        impressions={data.gbpImpressions}
                        profileViews={Math.round(data.gbpImpressions * 0.36)}
                        websiteClicks={data.gbpSearches}
                        calls={data.gbpCalls}
                        directions={data.gbpDirections}
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* ── P3: Competitor Benchmark (full width) ── */}
            <CompetitorBenchmarkStrip
                myRating={data.reviewRating}
                avgRating={data.competitor.avgRating}
                myReviewCount={data.totalReviewCount}
                avgReviewCount={data.competitor.avgReviewCount}
                mySeoScore={data.seoScore}
                avgSeoScore={data.competitor.avgSeoScore}
                isLoading={isLoading}
            />

            {/* ── Performance Trends + Location Map ── */}
            <Box>
                <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>Performance Trends</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Historical data over selected period</Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TrendsLineChart
                            title="SEO Score Trend"
                            yLabel="Score"
                            data={data.trends}
                            xAxisKey="date"
                            lineKey="seo"
                            lineColorThemeKey="info"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <DualAxisReviewChart
                            title="Reviews Trend"
                            data={data.trends}
                            xAxisKey="date"
                            barKey="reviews"
                            lineKey="rating"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TrendsLineChart
                            title="Listings Accuracy Trend"
                            yLabel="Accuracy %"
                            data={data.trends}
                            xAxisKey="date"
                            lineKey="listings"
                            lineColorThemeKey="secondary"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <LocationHealthMap
                            locations={data.locations}
                            isLoading={isLoading}
                        />
                    </Grid>
                </Grid>
            </Box>

        </Box>
    )
}
