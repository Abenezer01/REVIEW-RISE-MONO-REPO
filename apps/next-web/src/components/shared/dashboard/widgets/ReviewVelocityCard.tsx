/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, useTheme, Skeleton } from '@mui/material'

export interface ReviewVelocityCardProps {
    reviewsPerWeek: number
    avgResponseTimeHours: number
    velocityDelta: number
    isLoading?: boolean
}

export default function ReviewVelocityCard({
    reviewsPerWeek, avgResponseTimeHours, velocityDelta, isLoading = false
}: ReviewVelocityCardProps) {
    const theme = useTheme()
    const isPositive = velocityDelta >= 0

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="55%" height={28} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="60%" height={60} sx={{ borderRadius: 2, mb: 2, mx: 'auto' }} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="text" width="80%" height={20} />
                </Box>
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <i className="tabler-rocket" style={{ color: theme.palette.success.main, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Review Velocity</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: isPositive ? 'success.main' : 'error.main' }}>
                        {reviewsPerWeek}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>/ week</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <i
                        className={isPositive ? 'tabler-trending-up' : 'tabler-trending-down'}
                        style={{ fontSize: 14, color: isPositive ? theme.palette.success.main : theme.palette.error.main }}
                    />
                    <Typography variant="caption" sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}>
                        {isPositive ? '+' : ''}{velocityDelta}% vs last period
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="tabler-clock-reply" style={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Avg Response Time</Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: avgResponseTimeHours <= 2 ? 'success.main' : avgResponseTimeHours <= 24 ? 'warning.main' : 'error.main' }}>
                        {avgResponseTimeHours < 1 ? `${Math.round(avgResponseTimeHours * 60)}m` : `${avgResponseTimeHours}h`}
                    </Typography>
                </Box>
            </Box>
        </Card>
    )
}
