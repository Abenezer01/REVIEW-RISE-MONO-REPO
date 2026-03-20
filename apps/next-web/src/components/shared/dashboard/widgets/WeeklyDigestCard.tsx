/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, Chip, useTheme, Skeleton } from '@mui/material'

export interface WeeklyDigestCardProps {
    seoChange: number
    ratingChange: number
    reviewsChange: number
    listingsChange: number
    isLoading?: boolean
}

interface DigestStatProps {
    icon: string
    label: string
    value: number
    unit: string
    color: string
}

function DigestStat({ icon, label, value, unit, color }: DigestStatProps) {
    const isZero = value === 0
    const isPositive = value > 0
    const display = Number.isInteger(value) ? value : value.toFixed(1)

    
return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1 }}>
            <i className={icon} style={{ fontSize: '1.5rem', color }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
            </Typography>
            <Chip
                size="small"
                icon={isZero ? undefined : <i className={isPositive ? 'tabler-trending-up' : 'tabler-trending-down'} style={{ fontSize: 12 }} />}
                label={isZero ? '—' : `${isPositive ? '+' : ''}${display}${unit}`}
                color={isZero ? 'default' : isPositive ? 'success' : 'error'}
                sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            />
        </Box>
    )
}

export default function WeeklyDigestCard({
    seoChange, ratingChange, reviewsChange, listingsChange, isLoading = false
}: WeeklyDigestCardProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    {[0, 1, 2, 3].map(i => (
                        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Skeleton variant="circular" width={28} height={28} />
                            <Skeleton variant="text" width={60} height={16} />
                            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 4 }} />
                        </Box>
                    ))}
                </Box>
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, background: `linear-gradient(135deg, ${theme.palette.primary.main}14, ${theme.palette.secondary.main}0a)` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <i className="tabler-calendar-week" style={{ color: theme.palette.primary.main, fontSize: '1.25rem' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    This Week vs. Last Week
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <DigestStat icon="tabler-seeding" label="SEO Score" value={seoChange} unit="pts" color={theme.palette.info.main} />
                <DigestStat icon="tabler-star" label="Rating" value={ratingChange} unit="★" color={theme.palette.warning.main} />
                <DigestStat icon="tabler-message" label="Reviews" value={reviewsChange} unit="" color={theme.palette.success.main} />
                <DigestStat icon="tabler-map-pin" label="Listings" value={listingsChange} unit="%" color={theme.palette.secondary.main} />
            </Box>
        </Card>
    )
}
