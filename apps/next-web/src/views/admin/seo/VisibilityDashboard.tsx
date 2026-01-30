'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

import type { VisibilityMetricDTO, KeywordDTO } from '@platform/contracts';

import { useAuth } from '@/contexts/AuthContext';
import VisibilitySummaryCards from '@/components/seo/VisibilitySummaryCards';
import KeywordsTable from '@/components/seo/KeywordsTable';
import VisibilityTrendsChart from './VisibilityTrendsChart';
import HeatmapGrid from '@/components/shared/charts/HeatmapGrid';
import KeywordRankChart from './KeywordRankChart';

import { SERVICES } from '@/configs/services';
import apiClient from '@/lib/apiClient';

const API_URL = SERVICES.seo.url;

const VisibilityDashboard = () => {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<VisibilityMetricDTO | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<VisibilityMetricDTO[]>([]);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [keywords, setKeywords] = useState<KeywordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user businesses on mount
  useEffect(() => {
    const fetchUserBusinesses = async () => {
      if (!user?.id) return;

      try {
        // Use apiClient (auto-unwraps data field)
        const responseData = await apiClient.get<any[]>(`/api/admin/users/${user.id}/businesses`)
          .then(res => res.data);

        if (responseData && responseData.length > 0) {
          setBusinesses(responseData);

          // Auto-select first business
          setBusinessId(responseData[0].id);
        } else {
          setError('No businesses found for this user.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user businesses:', err);
        setError('Failed to load user businesses.');
        setLoading(false);
      }
    };

    fetchUserBusinesses();
  }, [user?.id]);

  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();

      thirtyDaysAgo.setDate(today.getDate() - 30);

      // 1. Fetch Latest Metric for Cards
      const metricsPromise = apiClient.get<VisibilityMetricDTO[]>(`${API_URL}/visibility/metrics`, {
        params: { businessId: id, periodType: 'daily', limit: 1, offset: 0 }
      });

      // 2. Fetch Historical Metrics for Chart
      const historyPromise = apiClient.get<VisibilityMetricDTO[]>(`${API_URL}/visibility/metrics`, {
        params: {
          businessId: id,
          periodType: 'daily',
          startDate: thirtyDaysAgo.toISOString(),
          endDate: today.toISOString(),
          limit: 30
        }
      });

      // 3. Fetch Keywords
      const keywordsPromise = apiClient.get<KeywordDTO[]>(`${API_URL}/keywords`, {
        params: { businessId: id, limit: 50 }
      });

      // 4. Fetch Heatmap Data
      const heatmapPromise = apiClient.get<any>(`${API_URL}/visibility/heatmap`, {
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

      if (metricsRes.data?.[0]) {
        setMetrics(metricsRes.data[0]);
      } else {
        setMetrics(null);
      }

      setHistoricalMetrics(historyRes.data || []);
      setKeywords(keywordsRes.data || []);

      if (heatmapRes.data) {
        const apiData = heatmapRes.data;

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

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(prev => prev || 'Failed to load dashboard data. Please check connection to SEO service.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when businessId changes
  useEffect(() => {
    if (businessId) {
      fetchData(businessId);
    }
  }, [businessId, fetchData]);

  const handleRefresh = () => {
    if (businessId) {
      fetchData(businessId);
    }
  };

  const handleBusinessChange = (event: SelectChangeEvent) => {
    setBusinessId(event.target.value);
  };

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

  const [openChart, setOpenChart] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordDTO | null>(null)

  const handleViewHistory = (kw: KeywordDTO) => {
    setSelectedKeyword(kw)
    setOpenChart(true)
  }

  const handleCloseChart = () => {
    setOpenChart(false)
    setSelectedKeyword(null)
  }

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
        <Stack direction="row" spacing={2} alignItems="center">
          {businesses.length > 1 && (
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                value={businessId || ''}
                onChange={handleBusinessChange}
                displayEmpty
              >
                {businesses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {businessId && (
            <Button variant="outlined" onClick={handleRefresh}>
              Refresh Data
            </Button>
          )}
        </Stack>
      </Stack>

      {!businessId && loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading your business profile...</Typography>
        </Box>
      ) : !businessId ? (
        <Box sx={{ mt: 4, p: 4, border: '1px dashed grey', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Business Found</Typography>
          <Typography variant="body2" color="text.secondary">
            {error || 'Your account does not appear to be linked to any businesses.'}
          </Typography>
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
            <KeywordsTable keywords={keywords} loading={loading} onViewHistory={handleViewHistory} />
          </Box>
          <KeywordRankChart
            keywordId={selectedKeyword?.id || null}
            keywordText={selectedKeyword?.keyword || null}
            open={openChart}
            onClose={handleCloseChart}
          />
        </>
      )}
    </Container>
  );
};

export default VisibilityDashboard;
