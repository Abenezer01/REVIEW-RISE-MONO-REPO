/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import {
    Box, Card, Typography, useTheme, Skeleton, LinearProgress, Tooltip
} from '@mui/material'

export interface PagePerformanceCardProps {
    mobileSpeed: number
    desktopSpeed: number
    coreWebVitals: number
    avgLoadMs: number
    isLoading?: boolean
}

interface PerfBarProps {
    label: string
    value: number
    suffix?: string
}

function PerfBar({ label, value, suffix = '/100' }: PerfBarProps) {
    const color = value >= 80 ? '#4CAF50' : value >= 60 ? '#FF9800' : '#F44336'

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
                <Typography variant="body2" sx={{ color, fontWeight: 700 }}>{value}{suffix}</Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={Math.min(value, 100)}
                sx={{
                    height: 7, borderRadius: 4,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
                }}
            />
        </Box>
    )
}

export default function PagePerformanceCard({
    mobileSpeed, desktopSpeed, coreWebVitals, avgLoadMs, isLoading = false
}: PagePerformanceCardProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="55%" height={28} sx={{ mb: 2 }} />
                {[0, 1, 2].map(i => (
                    <Box key={i} sx={{ mb: 2 }}>
                        <Skeleton variant="text" width="80%" height={18} sx={{ mb: 0.5 }} />
                        <Skeleton variant="rectangular" width="100%" height={7} sx={{ borderRadius: 4 }} />
                    </Box>
                ))}
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="tabler-dashboard" style={{ color: theme.palette.info.main, fontSize: '1.4rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Page Performance</Typography>
                </Box>
                <Tooltip title="Average page load time">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <i className="tabler-clock" style={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Avg Load: {(avgLoadMs / 1000).toFixed(1)}s
                        </Typography>
                    </Box>
                </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <PerfBar label="Mobile Speed" value={mobileSpeed} />
                <PerfBar label="Desktop Speed" value={desktopSpeed} />
                <PerfBar label="Core Web Vitals" value={coreWebVitals} />
            </Box>
        </Card>
    )
}
