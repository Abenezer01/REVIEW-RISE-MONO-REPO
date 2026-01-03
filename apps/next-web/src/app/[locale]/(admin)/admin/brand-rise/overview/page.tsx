'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

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

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

const OverviewPage = () => {
  const { businessId } = useBusinessId();
  const { locationId } = useLocationFilter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [visibilityMetrics, setVisibilityMetrics] = useState<VisibilityMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) return;
      setLoading(true);
  
      try {
        const [overviewData, metricsData] = await Promise.all([
          BrandService.getOverview(businessId, locationId),
          BrandService.getVisibilityMetrics(businessId, '30d', locationId)
        ]);
  
        setOverview(overviewData);
        setVisibilityMetrics(metricsData);
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
  const channelLabels = ['Organic Search', 'Local Maps', 'Social Media', 'Reviews'];

  return (
    <Grid container spacing={6}>
      {/* Metric Cards Row */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard 
            title="Visibility Score" 
            value={overview?.visibilityScore?.toString() || "87"} 
            trend={{ value: 12, label: 'vs last period', direction: 'up' }}
            icon={<Icon icon="tabler-eye" fontSize={24} />}
            iconColor="#7367F0"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard 
            title="Review Sentiment" 
            value="4.6" 
            trend={{ value: 0.3, label: 'vs last period', direction: 'up' }}
            icon={<Icon icon="tabler-mood-smile" fontSize={24} />}
            iconColor="#28C76F"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <MetricCard 
            title="Content Activity" 
            value="142" 
            trend={{ value: 8, label: 'vs last period', direction: 'down' }}
            icon={<Icon icon="tabler-notes" fontSize={24} />}
            iconColor="#FF9F43"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <MetricCard 
            title="Competitive Position" 
            value={`#${overview?.competitorCount ? (overview.competitorCount > 0 ? 3 : '-') : 3}`} // Mock rank, real count usage implies presence
            trend={{ value: `of ${overview?.competitorCount || 12} competitors`, label: '', direction: 'neutral', suffix: '' }}
            icon={<Icon icon="tabler-trophy" fontSize={24} />}
            iconColor="#7367F0"
        />
      </Grid>

      {/* Charts Row */}
      <Grid size={{ xs: 12, md: 8 }}>
        <DashboardLineChart 
            title="Visibility Trend" 
            subtitle="Last 30 days performance"
            series={visibilitySeries}
            categories={visibilityCategories}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <DashboardDonutChart 
            title="Visibility Breakdown" 
            subtitle="By channel"
            series={channelDistribution}
            labels={channelLabels}
        />
      </Grid>

      {/* Insights & Activity Row */}
      <Grid size={{ xs: 12, md: 7 }}>
        <InsightsCard 
            insights={[
                { id: '1', title: 'Your local visibility has increased by 18% this month', description: 'Consider investing more in local SEO strategies.', severity: 'success', icon: <Icon icon="tabler-bulb" fontSize={20} /> },
                { id: '2', title: 'Content activity is below average for your industry', description: 'Recommended: Publish 2-3 more pieces per week.', severity: 'warning', icon: <Icon icon="tabler-alert-triangle" fontSize={20} /> },
                { id: '3', title: 'Review sentiment is trending positively', description: 'Great job! Keep up the customer engagement.', severity: 'success', icon: <Icon icon="tabler-star" fontSize={20} /> },
            ]}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
         <ActivityFeed 
            activities={[
                { id: '1', title: 'New review received', timeAgo: '2 hours ago', type: 'review', tag: '+5 stars', tagColor: 'primary' },
                { id: '2', title: 'Content published', timeAgo: '5 hours ago', type: 'content', tag: 'Blog', tagColor: 'info' },
                { id: '3', title: 'Competitor added', timeAgo: '1 day ago', type: 'competitor', tag: 'New', tagColor: 'default' },
                { id: '4', title: 'Visibility score updated', timeAgo: '1 day ago', type: 'system', tag: '+12%', tagColor: 'primary' },
            ]}
         />
      </Grid>
    </Grid>
  );
};

export default OverviewPage;
