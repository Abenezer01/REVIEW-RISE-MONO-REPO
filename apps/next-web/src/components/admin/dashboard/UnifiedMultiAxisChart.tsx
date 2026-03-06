/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardHeader, CardContent, useTheme, Typography, Box, alpha } from '@mui/material'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function UnifiedMultiAxisChart() {
    const theme = useTheme()

    const options: ApexOptions = {
        chart: {
            type: 'area',
            stacked: false,
            toolbar: { show: false },
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                dynamicAnimation: { speed: 350 }
            }
        },
        colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
        stroke: { width: [3, 3, 3], curve: 'smooth' },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: theme.palette.text.secondary, fontFamily: theme.typography.fontFamily } }
        },
        yaxis: [
            {
                seriesName: 'Search Impressions',
                axisTicks: { show: false },
                axisBorder: { show: false },
                labels: {
                    style: { colors: theme.palette.primary.main },
                    formatter: (val) => `${(val / 1000).toFixed(0)}k`
                },
                title: { text: 'Search Impressions', style: { color: theme.palette.primary.main, fontWeight: 600 } },
            },
            {
                seriesName: 'Review Volume',
                opposite: true,
                axisTicks: { show: false },
                axisBorder: { show: false },
                labels: { style: { colors: theme.palette.success.main } },
                title: { text: "Review Volume", style: { color: theme.palette.success.main, fontWeight: 600 } },
            },
            {
                seriesName: 'Social Engagement',
                opposite: true,
                axisTicks: { show: false },
                axisBorder: { show: false },
                labels: { show: false }, // Hide to prevent clutter
            }
        ],
        grid: {
            borderColor: theme.palette.divider,
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: { colors: theme.palette.text.primary },
            itemMargin: { horizontal: 10, vertical: 0 }
        },
        tooltip: {
            theme: theme.palette.mode,
            shared: true,
            intersect: false,
            y: { formatter: (val) => val.toString() }
        }
    }

    const series = [
        { name: 'Search Impressions', type: 'area', data: [21000, 25000, 24000, 31000, 39000, 42000, 45000, 41000, 52000, 58000] },
        { name: 'Review Volume', type: 'line', data: [12, 15, 22, 18, 30, 45, 42, 55, 60, 85] },
        { name: 'Social Engagement', type: 'line', data: [400, 520, 610, 590, 820, 950, 1100, 1050, 1400, 1600] }
    ]

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader
                title="Cross-Channel Performance"
                subheader="Correlation between Search Visibility, Reviews, and Social Engagement."
                action={
                    <Box sx={{ p: 1, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1.5, color: theme.palette.primary.main }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{'+24% Overall Lift'}</Typography>
                    </Box>
                }
            />
            <CardContent sx={{ pb: '0 !important' }}>
                <ReactApexcharts options={options} series={series} type="line" height={400} />
            </CardContent>
        </Card>
    )
}
