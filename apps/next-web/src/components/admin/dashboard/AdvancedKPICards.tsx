'use client'

import React from 'react'
import { Card, CardContent, Grid, Typography, Box, useTheme, alpha } from '@mui/material'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

interface KPICardProps {
    title: string
    value: string
    subtitle: string
    trend: number
    icon: string
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
    sparklineData: number[]
}

const KPICard = ({ title, value, subtitle, trend, icon, color, sparklineData }: KPICardProps) => {
    const theme = useTheme()

    const mainColor = theme.palette[color].main
    const lightColor = alpha(mainColor, 0.1)

    const sparklineOptions: ApexOptions = {
        chart: {
            type: 'area',
            sparkline: { enabled: true },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 100]
            }
        },
        colors: [mainColor],
        tooltip: {
            fixed: { enabled: false },
            x: { show: false },
            y: { title: { formatter: () => '' } },
            marker: { show: false }
        }
    }

    return (
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px 0 ${alpha(theme.palette.text.primary, 0.1)}`
                },
                borderTop: `4px solid ${mainColor}`
            }}
        >
            {/* Decorative background circle */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(mainColor, 0.15)} 0%, ${alpha(mainColor, 0)} 70%)`
                }}
            />

            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 1.2,
                            borderRadius: 2,
                            backgroundColor: lightColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className={icon} style={{ fontSize: '1.5rem', color: mainColor }} />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 600,
                            mr: 1
                        }}
                    >
                        <i className={trend >= 0 ? 'tabler-trending-up' : 'tabler-trending-down'} style={{ marginRight: 4 }} />
                        {Math.abs(trend)}%
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>

                <Box sx={{ height: 60, mt: 2 }}>
                    <ReactApexcharts
                        options={sparklineOptions}
                        series={[{ data: sparklineData }]}
                        type="area"
                        height={60}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}

export default function AdvancedKPICards() {
    return (
        <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                    title="Brand Reputation"
                    value="4.8"
                    subtitle="vs last month"
                    trend={2.5}
                    icon="tabler-star-filled"
                    color="warning"
                    sparklineData={[4.2, 4.3, 4.2, 4.5, 4.6, 4.7, 4.8]}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                    title="Search Dominance"
                    value="84%"
                    subtitle="AI Visibility Score"
                    trend={12.4}
                    icon="tabler-search"
                    color="primary"
                    sparklineData={[65, 68, 70, 74, 72, 80, 84]}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                    title="Social Engagement"
                    value="12.4k"
                    subtitle="Interactions"
                    trend={-4.2}
                    icon="tabler-heart"
                    color="error"
                    sparklineData={[15, 14, 16, 13, 12, 11, 12.4]}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                    title="ROAS Efficiency"
                    value="3.2x"
                    subtitle="Across all campaigns"
                    trend={8.1}
                    icon="tabler-currency-dollar"
                    color="success"
                    sparklineData={[2.1, 2.4, 2.3, 2.8, 2.9, 3.1, 3.2]}
                />
            </Grid>
        </Grid>
    )
}
