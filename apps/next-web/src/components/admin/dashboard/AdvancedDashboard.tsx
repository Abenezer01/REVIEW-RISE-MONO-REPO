'use client'

import React from 'react'
import { Box, Grid } from '@mui/material'

import DashboardOmnibox from './DashboardOmnibox'
import GlobalDashboardFilters from './GlobalDashboardFilters'
import AIActionBoard from './AIActionBoard'
import AdvancedKPICards from './AdvancedKPICards'

import UnifiedMultiAxisChart from './UnifiedMultiAxisChart'
import AINerveCenterFeed from './AINerveCenterFeed'

import SentimentHeatmapWidget from './SentimentHeatmapWidget'
import CreativeIdeaStream from './CreativeIdeaStream'

import GeographicHealthMap from './GeographicHealthMap'
import CompetitorBattleground from './CompetitorBattleground'

import PlatformActivityTimeline from './PlatformActivityTimeline'
import HealthTicker from './HealthTicker'

export default function AdvancedDashboard() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', pb: 6 }}>
            {/* 1. Global Commands & Filters */}
            <DashboardOmnibox />
            <GlobalDashboardFilters />

            {/* 2. Urgent Actions & High-Level KPIs */}
            <Box sx={{ mb: 4 }}>
                <AIActionBoard />
            </Box>
            <AdvancedKPICards />

            <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* --- ROW 1: Performance & Nerve Center --- */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ height: '100%', minHeight: 450 }}>
                        <UnifiedMultiAxisChart />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ height: '100%' }}>
                        <AINerveCenterFeed />
                    </Box>
                </Grid>

                {/* --- ROW 2: Sentiment Diagnostics & Ideation --- */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ height: '100%', minHeight: 400 }}>
                        <SentimentHeatmapWidget />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ height: '100%' }}>
                        <CreativeIdeaStream />
                    </Box>
                </Grid>

                {/* --- ROW 3: Local Health & Competitors --- */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ height: '100%', minHeight: 400 }}>
                        <GeographicHealthMap />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ height: '100%', minHeight: 400 }}>
                        <CompetitorBattleground />
                    </Box>
                </Grid>

                {/* --- ROW 4: Full-width System Timeline --- */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ height: '100%' }}>
                        <PlatformActivityTimeline />
                    </Box>
                </Grid>
            </Grid>

            {/* 5. Cross-Platform Health Ticker (Footer) */}
            <HealthTicker />
        </Box>
    )
}
