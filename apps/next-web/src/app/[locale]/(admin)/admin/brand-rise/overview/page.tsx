/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';

// Icons
// New Shared Components
import ActivityFeed from '@/components/shared/dashboard/ActivityFeed';
import DashboardDonutChart from '@/components/shared/dashboard/DashboardDonutChart';
import DashboardLineChart from '@/components/shared/dashboard/DashboardLineChart';
import InsightsCard from '@/components/shared/dashboard/InsightsCard';
import MetricCard from '@/components/shared/dashboard/MetricCard';

import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { BrandService, type DashboardOverview, type VisibilityMetric } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const OverviewPage = () => {
  const t = useTranslations('dashboard');
  const { businessId } = useBusinessId();
  const { locationId } = useLocationFilter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [brandScores, setBrandScores] = useState<any>(null);
  const [visibilityMetrics, setVisibilityMetrics] = useState<VisibilityMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;
      setLoading(true);

      try {
        const [overviewData, metricsData, scoresData] = await Promise.all([
          BrandService.getOverview(businessId, locationId),
          BrandService.getVisibilityMetrics(businessId, '30d', locationId),
          BrandService.getBrandScores(businessId)
        ]);

        setOverview(overviewData);
        setVisibilityMetrics(metricsData);
        setBrandScores(scoresData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchData();
    }
  }, [businessId, locationId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare Chart Data
  const visibilitySeries = [
    {
      name: 'Visibility Score',
      data: visibilityMetrics.length > 0
        ? visibilityMetrics.map(m => m.score)
        : [65, 68, 72, 75, 80, 85, 87] // Fallback mock
    }
  ];

  const visibilityCategories = visibilityMetrics.length > 0
    ? visibilityMetrics.map(m => new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const channelDistribution = [40, 30, 20, 10]; // Organic, Maps, Social, Reviews

  const channelLabels = [
    t('brandRise.overview.channels.organic'),
    t('brandRise.overview.channels.maps'),
    t('brandRise.overview.channels.social'),
    t('brandRise.overview.channels.reviews')
  ];

  return (
    <Grid container spacing={6}>
      {/* Metric Cards Row */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('brandRise.overview.visibilityScore')}
          value={brandScores?.visibilityScore?.toString() || overview?.visibilityScore?.toString() || "0"}
          trend={{ value: 12, label: t('brandRise.overview.vsLastPeriod'), direction: 'up' }}
          icon={<Icon icon="tabler-eye" fontSize={24} />}
          iconColor="#7367F0"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('brandRise.overview.trustScore')}
          value={brandScores?.trustScore?.toString() || "0"}
          trend={{ value: 5, label: t('brandRise.overview.vsLastPeriod'), direction: 'up' }}
          icon={<Icon icon="tabler-shield-check" fontSize={24} />}
          iconColor="#28C76F"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('brandRise.overview.consistencyScore')}
          value={brandScores?.consistencyScore?.toString() || "0"}
          trend={{ value: 2, label: t('brandRise.overview.vsLastPeriod'), direction: 'down' }}
          icon={<Icon icon="tabler-adjustments" fontSize={24} />}
          iconColor="#FF9F43"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard
          title={t('brandRise.overview.competitivePosition')}
          value={`#${overview?.competitorCount ? (overview.competitorCount > 0 ? 3 : '-') : 3}`} // Mock rank
          trend={{ value: t('brandRise.overview.ofCompetitors', { count: overview?.competitorCount || 12 }), label: '', direction: 'neutral', suffix: '' }}
          icon={<Icon icon="tabler-trophy" fontSize={24} />}
          iconColor="#EA5455"
        />
      </Grid>

      {/* Charts Row */}
      <Grid size={{ xs: 12, md: 8 }}>
        <DashboardLineChart
          title={t('brandRise.overview.visibilityTrend')}
          subtitle={t('brandRise.overview.last30Days')}
          series={visibilitySeries}
          categories={visibilityCategories}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <DashboardDonutChart
          title={t('brandRise.overview.visibilityBreakdown')}
          subtitle={t('brandRise.overview.byChannel')}
          series={channelDistribution}
          labels={channelLabels}
        />
      </Grid>

      {/* Insights & Activity Row */}
      <Grid size={{ xs: 12, md: 7 }}>
        <InsightsCard
          insights={[
            { id: '1', title: t('brandRise.overview.insights.visibilityIncrease'), description: t('brandRise.overview.insights.visibilityIncreaseDesc'), severity: 'success', icon: <Icon icon="tabler-bulb" fontSize={20} /> },
            { id: '3', title: t('brandRise.overview.insights.sentimentPositive'), description: t('brandRise.overview.insights.sentimentPositiveDesc'), severity: 'success', icon: <Icon icon="tabler-star" fontSize={20} /> },
          ]}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <ActivityFeed
          activities={[
            { id: '1', title: t('brandRise.overview.activity.newReview'), timeAgo: t('brandRise.overview.activity.hoursAgo', { count: 2 }), type: 'review', tag: '+5 stars', tagColor: 'primary' },
            { id: '3', title: t('brandRise.overview.activity.competitorAdded'), timeAgo: t('brandRise.overview.activity.daysAgo', { count: 1 }), type: 'competitor', tag: 'New', tagColor: 'default' },
            { id: '4', title: t('brandRise.overview.activity.scoreUpdated'), timeAgo: t('brandRise.overview.activity.daysAgo', { count: 1 }), type: 'system', tag: '+12%', tagColor: 'primary' },
          ]}
        />
      </Grid>
    </Grid>
  );
};

export default OverviewPage;
