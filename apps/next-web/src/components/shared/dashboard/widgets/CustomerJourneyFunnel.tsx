/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, useTheme, Skeleton } from '@mui/material'

export interface CustomerJourneyFunnelProps {
    impressions: number
    profileViews: number
    websiteClicks: number
    calls: number
    directions: number
    isLoading?: boolean
}

interface FunnelStepProps {
    icon: string
    label: string
    value: number
    prevValue?: number
    color: string
    isLast?: boolean
}

function FunnelStep({ icon, label, value, prevValue, color, isLast = false }: FunnelStepProps) {
    const dropOff = prevValue && prevValue > 0 ? Math.round((value / prevValue) * 100) : null

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{
                    width: '100%',
                    bgcolor: `${color}18`,
                    border: `1.5px solid ${color}40`,
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                }}>
                    <i className={icon} style={{ color, fontSize: '1.25rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color }}>
                        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
            {!isLast && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, px: 0.25 }}>
                    <i className="tabler-chevron-right" style={{ fontSize: 12, color: '#aaa' }} />
                    {dropOff !== null && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem' }}>
                            {dropOff}%
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    )
}

export default function CustomerJourneyFunnel({
    impressions, profileViews, websiteClicks, calls, directions, isLoading = false
}: CustomerJourneyFunnelProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="50%" height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <React.Fragment key={i}>
                            <Skeleton variant="rectangular" width="100%" height={90} sx={{ borderRadius: 2, flex: 1 }} />
                            {i < 4 && <Skeleton variant="circular" width={20} height={20} />}
                        </React.Fragment>
                    ))}
                </Box>
            </Card>
        )
    }

    const steps = [
        { icon: 'tabler-eye', label: 'Impressions', value: impressions, color: theme.palette.info.main },
        { icon: 'tabler-user', label: 'Profile Views', value: profileViews, color: theme.palette.primary.main },
        { icon: 'tabler-click', label: 'Website Clicks', value: websiteClicks, color: theme.palette.secondary.main },
        { icon: 'tabler-phone', label: 'Calls', value: calls, color: theme.palette.success.main },
        { icon: 'tabler-map-2', label: 'Directions', value: directions, color: theme.palette.warning.main },
    ]

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
                <i className="tabler-filter" style={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Customer Journey</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Impressions to conversions</Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0, flexGrow: 1 }}>
                {steps.map((step, idx) => (
                    <FunnelStep
                        key={step.label}
                        icon={step.icon}
                        label={step.label}
                        value={step.value}
                        prevValue={idx > 0 ? steps[idx - 1].value : undefined}
                        color={step.color}
                        isLast={idx === steps.length - 1}
                    />
                ))}
            </Box>
        </Card>
    )
}
