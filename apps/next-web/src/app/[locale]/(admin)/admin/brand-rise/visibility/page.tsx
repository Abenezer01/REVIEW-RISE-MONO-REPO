'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ApexOptions } from 'apexcharts';

import { useBusinessId } from '@/hooks/useBusinessId';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import type { VisibilityMetric } from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';

// Dynamically import ApexCharts
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false });

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
  return <i className={icon} style={{ fontSize }} {...rest} />
}

interface ChannelCardProps {
  title: string;
  score: string;
  icon: string;
  iconColor: string;
  metrics: { label: string; value: string }[];
  chartType: 'bar' | 'line' | 'donut' | 'map';
}

const ChannelCard = ({ title, score, icon, iconColor, metrics, chartType }: ChannelCardProps) => {
  const theme = useTheme();

  const commonChartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, sparkline: { enabled: true } },
    grid: { show: false },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: [iconColor]
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
           <AppReactApexCharts
             type="bar"
             height={100}
             options={{ ...commonChartOptions, plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } } }}
             series={[{ name: 'Rankings', data: [40, 70, 55, 90, 60, 80] }]}
           />
        );
      case 'line':
        return (
            <AppReactApexCharts
                type="line"
                height={100}
                options={commonChartOptions}
                series={[{ name: 'Engagement', data: [30, 40, 35, 50, 49, 60, 70, 91, 125] }]}
            />
        );
      case 'donut':
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <AppReactApexCharts
                    type="donut"
                    height={120}
                    options={{
                        ...commonChartOptions,
                        colors: ['#28C76F', '#FF9F43', '#EA5455'],
                        legend: { show: false },
                        stroke: { width: 0 }
                    }}
                    series={[82, 12, 6]}
                />
            </Box>
        );
      case 'map':
        return (
            <Box sx={{ height: 100, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">Map Visualization</Typography>
            </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
             <Icon icon={icon} fontSize={24} style={{ color: iconColor }} />
             <Typography variant="h6">{title}</Typography>
          </Box>
          <Typography variant="h4" color="primary.main" fontWeight="bold">{score}</Typography>
        </Box>

        <Box sx={{ mb: 3, minHeight: 100 }}>
            {renderChart()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
           {metrics.map((metric, index) => (
             <Box key={index} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">{metric.label}</Typography>
                <Typography variant="subtitle2" fontWeight="bold">{metric.value}</Typography>
             </Box>
           ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const VisibilityPage = () => {
  const [activeTab, setActiveTab] = useState('Search');
  const { businessId } = useBusinessId();
  const { locationId } = useLocationFilter();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<VisibilityMetric[]>([]);
  const [latestMetric, setLatestMetric] = useState<VisibilityMetric | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!businessId) return;
      setLoading(true);
  
      try {
          const data = await BrandService.getVisibilityMetrics(businessId, '30d', locationId);
  
          setMetrics(data);
  
          if (data.length > 0) {
              setLatestMetric(data[data.length - 1]);
          }
      } catch (error) {
          console.error('Failed to fetch visibility metrics', error);
      } finally {
          setLoading(false);
      }
    };

    if (businessId) {
        fetchMetrics();
    }
  }, [businessId, locationId]);

  const getBreakdownValue = (key: string, subKey: string, defaultValue: string = '0') => {
      if (!latestMetric?.breakdown) return defaultValue;
      
return latestMetric.breakdown[key]?.[subKey] || defaultValue;
  };

  const trendOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      sparkline: { enabled: false }
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    colors: ['#7367F0'],
    xaxis: {
      categories: metrics.map(m => new Date(m.date).toLocaleDateString()),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'var(--mui-palette-text-secondary)' } }
    },
    yaxis: {
        show: false
    },
    grid: { show: false },
    dataLabels: { enabled: false }
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <Box>
       {/* Sub Navigation */}
       <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {['Search', 'Local', 'Social', 'Reputation', 'Paid'].map((tab) => (
             <Button
                key={tab}
                variant={activeTab === tab ? 'contained' : 'text'}
                color={activeTab === tab ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(tab)}
                sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    px: 3,
                    boxShadow: 'none',
                    bgcolor: activeTab === tab ? 'primary.main' : 'transparent',
                    color: activeTab === tab ? 'white' : 'text.secondary',
                    '&:hover': {
                         bgcolor: activeTab === tab ? 'primary.dark' : 'action.hover',
                         boxShadow: 'none'
                    }
                }}
             >
                {tab}
             </Button>
          ))}
       </Box>

       <Grid container spacing={4}>
          {/* Overall Score */}
          <Grid size={{ xs: 12 }}>
             <Card sx={{ textAlign: 'center', py: 6 }}>
                <CardContent>
                   <Typography variant="subtitle1" color="text.secondary" gutterBottom>Overall Visibility Score</Typography>
                   <Typography variant="h1" color="primary.main" fontWeight="bold" sx={{ fontSize: '5rem', mb: 2 }}>
                      {latestMetric?.score || 0}
                   </Typography>
                   <Typography variant="body1" color="text.secondary">
                      Your brand visibility is performing well across all channels
                   </Typography>
                </CardContent>
             </Card>
          </Grid>

          {/* Trend Chart */}
          <Grid size={{ xs: 12 }}>
             <Card>
                <CardContent>
                   <Box sx={{ mb: 3 }}>
                      <Typography variant="h6">Visibility Trend</Typography>
                      <Typography variant="body2" color="text.secondary">Search visibility performance over time</Typography>
                   </Box>
                   <Box sx={{ height: 350, width: '100%' }}>
                      <AppReactApexCharts
                        type="area"
                        height="100%"
                        width="100%"
                        options={trendOptions}
                        series={[{ name: 'Visibility', data: metrics.map(m => m.score) }]}
                      />
                   </Box>
                </CardContent>
             </Card>
          </Grid>

          {/* Channel Cards */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
             <ChannelCard
                title="Organic Search"
                score={getBreakdownValue('organic', 'score', '0')}
                icon="tabler-search"
                iconColor="#7367F0"
                metrics={[
                    { label: 'Keywords', value: getBreakdownValue('organic', 'keywords', '0') },
                    { label: 'Top 10', value: getBreakdownValue('organic', 'top10', '0') },
                    { label: 'Impressions', value: getBreakdownValue('organic', 'impressions', '0') }
                ]}
                chartType="bar"
             />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
             <ChannelCard
                title="Local Search"
                score={getBreakdownValue('local', 'score', '0')}
                icon="tabler-map-pin"
                iconColor="#28C76F"
                metrics={[
                    { label: 'Locations', value: getBreakdownValue('local', 'locations', '0') },
                    { label: 'Reviews', value: getBreakdownValue('local', 'reviews', '0') },
                    { label: 'Avg Rating', value: getBreakdownValue('local', 'avgRating', '0') }
                ]}
                chartType="map"
             />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
             <ChannelCard
                title="Social Media"
                score={getBreakdownValue('social', 'score', '0')}
                icon="tabler-share"
                iconColor="#FF9F43"
                metrics={[
                    { label: 'Followers', value: getBreakdownValue('social', 'followers', '0') },
                    { label: 'Engagement', value: getBreakdownValue('social', 'engagement', '0') },
                    { label: 'Posts', value: getBreakdownValue('social', 'posts', '0') }
                ]}
                chartType="line"
             />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
             <ChannelCard
                title="Reputation"
                score={getBreakdownValue('reputation', 'score', '0')}
                icon="tabler-star"
                iconColor="#7367F0"
                metrics={[
                    { label: 'Reviews', value: getBreakdownValue('reputation', 'reviews', '0') },
                    { label: 'Positive', value: getBreakdownValue('reputation', 'positive', '0') },
                    { label: 'Response Rate', value: getBreakdownValue('reputation', 'responseRate', '0') }
                ]}
                chartType="donut"
             />
          </Grid>
           <Grid size={{ xs: 12, md: 6, lg: 4 }}>
             <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                 <Box sx={{ textAlign: 'center', opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <Icon icon="tabler-speakerphone" fontSize={48} />
                     <Typography variant="body1" sx={{ mt: 2 }}>Paid Advertising</Typography>
                 </Box>
             </Card>
           </Grid>
       </Grid>
    </Box>
  );
};

export default VisibilityPage;
