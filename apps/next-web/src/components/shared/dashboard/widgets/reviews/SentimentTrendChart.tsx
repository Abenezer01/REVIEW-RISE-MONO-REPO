'use client';

import React from 'react';
import { Card, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function SentimentTrendChart() {
    const theme = useTheme();

    const chartOptions = {
        chart: {
            type: 'area' as const,
            parentHeightOffset: 0,
            toolbar: { show: false },
            background: 'transparent'
        },
        colors: [theme.palette.success.main, theme.palette.info.main, theme.palette.error.main],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' as const, width: 2 },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: { style: { colors: theme.palette.text.secondary } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            show: false,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.0,
                stops: [0, 90, 100]
            }
        },
        legend: { show: false },
        grid: { show: false, padding: { top: -20, right: 0, left: -10, bottom: -10 } },
    };

    const chartSeries = [
        { name: 'Positive', data: [80, 85, 82, 90, 95, 92, 98] },
        { name: 'Neutral', data: [15, 10, 12, 8, 5, 6, 2] },
        { name: 'Negative', data: [5, 5, 6, 2, 0, 2, 0] },
    ];

    return (
        <Card sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Sentiment Trends</Typography>

            <Box sx={{ height: 200 }}>
                <ReactApexcharts type="area" height="100%" options={chartOptions} series={chartSeries} />
            </Box>

            {/* Custom Legend underneath */}
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Positive</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '70%' }}>
                        <Box sx={{ height: 4, bgcolor: 'success.main', flex: 1, borderRadius: 2 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>92%</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Neutral</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '70%' }}>
                        <Box sx={{ height: 4, bgcolor: 'info.main', flex: 1, borderRadius: 2 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>6%</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Negative</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '70%' }}>
                        <Box sx={{ height: 4, bgcolor: 'error.main', flex: 1, borderRadius: 2 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>2%</Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
