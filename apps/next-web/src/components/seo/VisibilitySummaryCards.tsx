'use client';

import React from 'react';

import Grid from '@mui/material/Grid';
import type { VisibilityMetricDTO } from '@platform/contracts';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import MetricCard from '@/components/shared/analytics/MetricCard';

interface VisibilitySummaryCardsProps {
  metrics: VisibilityMetricDTO | null;
  loading?: boolean;
}

// Simple Inline SVG Icons
const MapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <map name="map" />
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const ChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10"></path>
        <path d="M12 20V4"></path>
        <path d="M6 20v-6"></path>
    </svg>
);

const TrophyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 21h8m-4-9l9-6-9-6-9 6 9 6zm-9 0v6h18v-6"></path>
    </svg>
);

const StarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const VisibilitySummaryCards: React.FC<VisibilitySummaryCardsProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid size={{ xs: 12, md: 3 }} key={item}>
            <MetricCard title="Loading..." value="-" loading={true} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Map Pack Visibility */}
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
           title="Map Pack Visibility"
           value={`${metrics.mapPackVisibility.toFixed(1)}%`}
           icon={<MapIcon />}
           color="primary"
           footer={
             <Box>
                 <LinearProgress variant="determinate" value={metrics.mapPackVisibility} color="primary" sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }} />
                 <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                    {metrics.mapPackAppearances} appearances
                 </p>
             </Box>
           }
        />
      </Grid>

      {/* Share of Voice */}
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
           title="Share of Voice"
           value={`${metrics.shareOfVoice.toFixed(1)}%`}
           icon={<ChartIcon />}
           color="secondary"
           footer={
             <Box>
                 <LinearProgress variant="determinate" value={metrics.shareOfVoice} color="secondary" sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'action.hover' }} />
                 <p style={{ margin: 0, fontSize: '0.75rem', color: 'gray' }}>
                    Weighted by volume
                 </p>
             </Box>
           }
        />
      </Grid>

      {/* Organic Rankings */}
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
           title="Organic Rankings"
           value={metrics.top3Count}
           icon={<TrophyIcon />}
           color="success"
           footer={
             <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                <span>Top 10: <strong>{metrics.top10Count}</strong></span>
                <span>Top 20: <strong>{metrics.top20Count}</strong></span>
             </Box>
           }
        />
      </Grid>

      {/* SERP Features */}
      <Grid size={{ xs: 12, md: 3 }}>
        <MetricCard
           title="SERP Features"
           value={metrics.featuredSnippetCount + metrics.localPackCount}
           icon={<StarIcon />}
           color="warning"
           footer={
             <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                <span>Local: <strong>{metrics.localPackCount}</strong></span>
                <span>Snippets: <strong>{metrics.featuredSnippetCount}</strong></span>
             </Box>
           }
        />
      </Grid>
    </Grid>
  );
};

export default VisibilitySummaryCards;
