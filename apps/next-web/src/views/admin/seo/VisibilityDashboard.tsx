'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

import VisibilitySummaryCards from '@/components/seo/VisibilitySummaryCards';
import KeywordsTable from '@/components/seo/KeywordsTable';
import VisibilityTrendsChart from './VisibilityTrendsChart';
import HeatmapGrid from '@/components/shared/charts/HeatmapGrid';
import type { VisibilityMetricDTO, KeywordDTO } from '@platform/contracts';

// This would typically come from an environment variable
const API_URL = 'http://localhost:3012/api/v1';

const VisibilityDashboard = () => {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<VisibilityMetricDTO | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<VisibilityMetricDTO[]>([]);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [keywords, setKeywords] = useState<KeywordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();

  // Fetch business ID first (simulation of context)
  useEffect(() => {
    // Context logic would go here
  }, []);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // 1. Fetch Latest Metric for Cards
      const metricsPromise = axios.get(`${API_URL}/visibility/metrics`, {
        params: { businessId: id, periodType: 'daily', limit: 1, offset: 0 }
      });

      // 2. Fetch Historical Metrics for Chart
      const historyPromise = axios.get(`${API_URL}/visibility/metrics`, {
        params: { 
            businessId: id, 
            periodType: 'daily', 
            startDate: thirtyDaysAgo.toISOString(), 
            endDate: today.toISOString(),
            limit: 30 
        }
      });
      
      // 3. Fetch Keywords
      const keywordsPromise = axios.get(`${API_URL}/keywords`, {
        params: { businessId: id, limit: 50 }
      });

      // 4. Fetch Heatmap Data
      const heatmapPromise = axios.get(`${API_URL}/visibility/heatmap`, {
        params: { 
            businessId: id, 
            startDate: thirtyDaysAgo.toISOString(), 
            endDate: today.toISOString() 
        }
      });

      const [metricsRes, historyRes, keywordsRes, heatmapRes] = await Promise.all([
          metricsPromise,
          historyPromise,
          keywordsPromise,
          heatmapPromise
      ]);
      
      if (metricsRes.data?.data?.[0]) {
        setMetrics(metricsRes.data.data[0]);
      } else {
        setMetrics(null);
      }

      if (historyRes.data?.data) {
        setHistoricalMetrics(historyRes.data.data);
      }

      if (keywordsRes.data?.data) {
        setKeywords(keywordsRes.data.data);
      }

      if (heatmapRes.data?.data) {
         const apiData = heatmapRes.data.data;
         const transformedHeatmap = {
            dates: apiData.periods,
            keywords: apiData.keywords.map((kw: string, index: number) => ({
                id: `kw-${index}`, // fallback ID
                keyword: kw,
                // data is [keywordIndex][dateIndex]
                ranks: apiData.data[index]
            }))
         };
         setHeatmapData(transformedHeatmap);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check connection to SEO service.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    if (businessId) {
      fetchData(businessId);
    }
  };

  const handleIdSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('businessId') as string;
    if (id) {
      setBusinessId(id);
      fetchData(id);
    }
  };

  const lineChartSeries = [
      { dataKey: 'mapPackVisibility', color: theme.palette.primary.main, label: 'Map Pack %' },
      { dataKey: 'shareOfVoice', color: theme.palette.secondary.main, label: 'Share of Voice' }
  ];

  const sortedHistory = useMemo(() => {
    if (!historicalMetrics?.length) return [];
    return [...historicalMetrics].sort((a, b) => 
        new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    );
  }, [historicalMetrics]);

  // Adapt heatmap data for Grid
  const heatmapRows = heatmapData?.keywords?.map((k: any) => ({
      id: k.id,
      label: k.keyword,
      values: k.ranks
  })) || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            SERP Visibility
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your map pack presence and organic ranking performance
          </Typography>
        </Box>
        <Box>
          {businessId && (
            <Button variant="outlined" onClick={handleRefresh}>
              Refresh Data
            </Button>
          )}
        </Box>
      </Stack>

      {!businessId ? (
        <Box sx={{ mt: 4, p: 4, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Enter Business ID to View Data</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            (Check your database or seed script output for a valid UUID)
          </Typography>
          <form onSubmit={handleIdSubmit} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <input 
              name="businessId" 
              placeholder="e.g. 5d5bb42e-..." 
              style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }} 
              required
            />
            <Button type="submit" variant="contained">Load Dashboard</Button>
          </form>
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
             Current Performance
            </Typography>
            <VisibilitySummaryCards metrics={metrics} loading={loading} />
          </Box>
          
           <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4} mb={4}>
              <Box sx={{ flex: 1, minWidth: 0 }}> 
                 <VisibilityTrendsChart 
                    data={sortedHistory} 
                    loading={loading}
                 />
              </Box>
           </Stack>

           <Box sx={{ mb: 4, height: 500 }}>
             <HeatmapGrid 
                rows={heatmapRows} 
                columns={heatmapData?.dates || []} 
                title="Keyword Ranking History"
                loading={loading}
                colorMode="ranking"
                height={500}
             />
           </Box>

          <Box>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Tracked Keywords
            </Typography>
            <KeywordsTable keywords={keywords} loading={loading} />
          </Box>
        </>
      )}
    </Container>
  );
};

export default VisibilityDashboard;
