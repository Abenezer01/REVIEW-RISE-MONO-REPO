/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'

const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function SentimentHeatmapWidget() {
    const theme = useTheme()

    // Generate mock data for the last 30 days (4 weeks x 7 days representing a calendar view roughly)
    const generateData = () => {
        const series = []
        const sentiments = ['Positive', 'Neutral', 'Negative']

        for (let i = 0; i < 3; i++) {
            const data = []

            for (let j = 1; j <= 30; j++) {
                // More positive towards the end, negative spikes occasionally
                let val = Math.floor(Math.random() * 20)

                if (i === 0) val = val + 15 + Math.floor(j / 2) // Positive increasing
                if (i === 2 && j % 8 === 0) val = val + 25 // Negative spikes

                data.push({ x: `Day ${j}`, y: val })
            }

            series.push({
                name: sentiments[i],
                data: data
            })
        }


        return series
    }

    const options: ApexOptions = {
        chart: {
            type: 'heatmap',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, speed: 800 }
        },
        colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
        dataLabels: { enabled: false },
        stroke: { width: 1, colors: [theme.palette.background.paper] },
        xaxis: {
            labels: { show: false }, // Hide x labels for clean look
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: theme.palette.text.secondary, fontWeight: 600 } }
        },
        plotOptions: {
            heatmap: {
                radius: 4,
                enableShades: true,
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [
                        { from: 0, to: 10, name: 'Low', color: alpha(theme.palette.text.secondary, 0.1) },
                        { from: 11, to: 20, name: 'Medium', color: alpha(theme.palette.text.secondary, 0.3) },
                        { from: 21, to: 100, name: 'High', color: alpha(theme.palette.text.secondary, 0.6) } // Colors overridden by series colors below if set
                    ]
                }
            }
        },
        legend: { show: false },
        tooltip: { theme: theme.palette.mode }
    }

    // Force actual colors based on series index
    options.plotOptions!.heatmap!.colorScale = undefined

    const keywords = [
        { text: 'friendly staff', color: theme.palette.success.main, size: '1.2rem' },
        { text: 'wait time', color: theme.palette.error.main, size: '1.4rem' },
        { text: 'clean', color: theme.palette.success.main, size: '1.1rem' },
        { text: 'expensive', color: theme.palette.warning.main, size: '1.3rem' },
        { text: 'amazing coffee', color: theme.palette.primary.main, size: '1.6rem' },
        { text: 'parking', color: theme.palette.text.secondary, size: '1rem' }
    ]

    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
        >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, display: 'flex' }}>
                    <i className="tabler-mood-smile" style={{ fontSize: '1.2rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{'Sentiment Diagnostic'}</Typography>
            </Box>

            <CardContent sx={{ position: 'relative' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>{'30-Day Sentiment Volume Heatmap'}</Typography>
                <Box sx={{ height: 200 }}>
                    <ReactApexcharts options={options} series={generateData()} type="heatmap" height={200} />
                </Box>

                {/* Floating Keyword Cloud */}
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                    }}
                >
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {'Trending Keywords Now'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                        {keywords.map((kw, idx) => (
                            <Typography key={idx} sx={{ color: kw.color, fontSize: kw.size, fontWeight: 700, opacity: 0.9 }}>
                                {kw.text}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
