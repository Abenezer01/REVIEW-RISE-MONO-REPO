'use client'

import React from 'react'

import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

import Tooltip from '@mui/material/Tooltip'
import InfoOutlined from '@mui/icons-material/InfoOutlined'

import MetricCard from '@/components/shared/analytics/MetricCard'
import { useTranslations } from 'next-intl'

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

const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

export interface BrandVisibilityMetrics {
  visibilityScore: number // 0-100
  sentimentScore: number // 0-100 (0=Negative, 50=Neutral, 100=Positive)
  citationAuthority: number // 0-100
  shareOfVoice: number // 0-100
  technicalReadiness: number // 0-100
}

interface AIVisibilityOverviewProps {
  metrics: BrandVisibilityMetrics | null
}

const AIVisibilityOverview: React.FC<AIVisibilityOverviewProps> = ({ metrics }) => {
  const t = useTranslations('dashboard')

  if (!metrics) return null

  const getSentimentLabel = (score: number) => {
    if (score >= 60) return t('reviews.positive')
    if (score <= 40) return t('reviews.negative')

    return t('reviews.neutral')
  }

  const getSentimentColor = (score: number): 'success' | 'error' | 'warning' | 'primary' | 'secondary' | 'info' => {
    if (score >= 60) return 'success'
    if (score <= 40) return 'error'

    return 'warning'
  }

  const VoiceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  )

  const TechnicalIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <MetricCard
          title={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {t('aiVisibility.overview.visibilityScore')}
              <Tooltip title={t('aiVisibility.overview.visibilityTooltip')} arrow>
                <InfoOutlined sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          }
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
                {t('aiVisibility.overview.visibilityFooter')}
              </p>
            </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <MetricCard
          title={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {t('aiVisibility.overview.sentiment')}
              <Tooltip title={t('aiVisibility.overview.sentimentTooltip')} arrow>
                <InfoOutlined sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          }
          value={getSentimentLabel(metrics.sentimentScore)}
          icon={<HeartIcon />}
          color={getSentimentColor(metrics.sentimentScore)}
          footer={
            <Box>
              <LinearProgress
                variant="determinate"
                value={metrics.sentimentScore}
                color={getSentimentColor(metrics.sentimentScore) as any}
                sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }}
              />
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                {t('aiVisibility.overview.sentimentFooter')}
              </p>
            </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <MetricCard
          title={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {t('aiVisibility.overview.shareOfVoice')}
              <Tooltip title={t('aiVisibility.overview.shareOfVoiceTooltip')} arrow>
                <InfoOutlined sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          }
          value={`${metrics.shareOfVoice}%`}
          icon={<VoiceIcon />}
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
                {t('aiVisibility.overview.shareOfVoiceFooter')}
              </p>
            </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <MetricCard
          title={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {t('aiVisibility.overview.authority')}
              <Tooltip title={t('aiVisibility.overview.authorityTooltip')} arrow>
                <InfoOutlined sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          }
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
                {t('aiVisibility.overview.authorityFooter')}
              </p>
            </Box>
          }
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <MetricCard
          title={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
              {t('aiVisibility.overview.readiness')}
              <Tooltip title={t('aiVisibility.overview.readinessTooltip')} arrow>
                <InfoOutlined sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          }
          value={`${metrics.technicalReadiness}/100`}
          icon={<TechnicalIcon />}
          color="success"
          footer={
            <Box>
              <LinearProgress
                variant="determinate"
                value={metrics.technicalReadiness}
                color="success"
                sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }}
              />
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                {t('aiVisibility.overview.readinessFooter')}
              </p>
            </Box>
          }
        />
      </Grid>
    </Grid>
  )
}

export default AIVisibilityOverview
