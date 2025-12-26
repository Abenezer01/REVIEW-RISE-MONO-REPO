/* eslint-disable import/no-unresolved */
'use client'

import React from 'react'

import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

import MetricCard from '@/components/shared/analytics/MetricCard'

// Icons
const VisibilityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.28 3.6-2.34 4.58-2.74a5.5 5.5 0 0 0-5.42-7 5.5 5.5 0 0 0-4.05 1.77A5.5 5.5 0 0 0 10.05 4.26a5.5 5.5 0 0 0-5.42 7c.98.4 3.09 1.46 4.58 2.74L12 21z" />
  </svg>
)

const MegaphoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
)

const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

export interface BrandVisibilityMetrics {
  visibilityScore: number // 0-100
  sentimentScore: number // -100 to 100
  shareOfVoice: number // %
  citationAuthority: number // 0-100
}

interface AIVisibilityOverviewProps {
  metrics: BrandVisibilityMetrics | null
}

const AIVisibilityOverview: React.FC<AIVisibilityOverviewProps> = ({ metrics }) => {
  if (!metrics) return null

  const getSentimentLabel = (score: number) => {
    if (score >= 30) return 'Positive'
    if (score <= -30) return 'Negative'
    
    return 'Neutral'
  }

  const getSentimentColor = (score: number): 'success' | 'error' | 'warning' | 'primary' | 'secondary' | 'info' => {
    if (score >= 30) return 'success'
    if (score <= -30) return 'error'

    return 'warning'
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="AI Visibility Score"
          value={`${metrics.visibilityScore}/100`}
          icon={<VisibilityIcon />}
          color="primary"
          footer={
            <Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.visibilityScore}
                  color="primary"
                  sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }}
                />
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                  Based on presence in AI answers
                </p>
            </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Brand Sentiment"
          value={getSentimentLabel(metrics.sentimentScore)}
          icon={<HeartIcon />}
          color={getSentimentColor(metrics.sentimentScore)}
          footer={
             <Box>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                  AI perception of your brand
                </p>
             </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Share of Voice"
          value={`${metrics.shareOfVoice}%`}
          icon={<MegaphoneIcon />}
          color="info"
          footer={
             <Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.shareOfVoice}
                  color="info"
                  sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }}
                />
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                  Vs. potential competitors
                </p>
             </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title="Citation Authority"
          value={`${metrics.citationAuthority}/100`}
          icon={<AwardIcon />}
          color="secondary"
          footer={
             <Box>
                <LinearProgress
                  variant="determinate"
                  value={metrics.citationAuthority}
                  color="secondary"
                  sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }}
                />
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                  Quality of sources citing you
                </p>
             </Box>
          }
        />
      </Grid>
    </Grid>
  )
}

export default AIVisibilityOverview
