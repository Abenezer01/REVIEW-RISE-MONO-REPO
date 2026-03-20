/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, useTheme, Skeleton } from '@mui/material'

export interface GbpPerformanceCardProps {
    impressions: number
    searches: number
    calls: number
    directionRequests: number
    impressionsDelta: number
    callsDelta: number
    isLoading?: boolean
}

interface StatRowProps {
    icon: string
    label: string
    value: number
    delta?: number
    color: string
}

function StatRow({ icon, label, value, delta, color }: StatRowProps) {
    const isPositive = (delta ?? 0) >= 0

    
return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={icon} style={{ color, fontSize: '1rem' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {value.toLocaleString()}
                </Typography>
                {delta !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <i
                            className={isPositive ? 'tabler-trending-up' : 'tabler-trending-down'}
                            style={{ fontSize: 12, color: isPositive ? '#4CAF50' : '#F44336' }}
                        />
                        <Typography variant="caption" sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}>
                            {isPositive ? '+' : ''}{delta}%
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default function GbpPerformanceCard({
    impressions, searches, calls, directionRequests, impressionsDelta, callsDelta, isLoading = false
}: GbpPerformanceCardProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
                {[0, 1, 2, 3].map(i => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25 }}>
                        <Skeleton variant="rectangular" width={140} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={60} height={24} />
                    </Box>
                ))}
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <i className="tabler-brand-google" style={{ color: theme.palette.warning.main, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>GBP Performance</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <StatRow icon="tabler-eye" label="Impressions" value={impressions} delta={impressionsDelta} color={theme.palette.info.main} />
                <StatRow icon="tabler-search" label="Direct Searches" value={searches} color={theme.palette.primary.main} />
                <StatRow icon="tabler-phone" label="Calls" value={calls} delta={callsDelta} color={theme.palette.success.main} />
                <StatRow icon="tabler-map-2" label="Direction Requests" value={directionRequests} color={theme.palette.secondary.main} />
            </Box>
        </Card>
    )
}
