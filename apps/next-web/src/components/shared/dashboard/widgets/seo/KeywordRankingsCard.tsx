/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Box, Card, Typography, useTheme, Skeleton } from '@mui/material'

export interface KeywordRankingsCardProps {
    total: number
    top10: number
    top20: number
    improved: number
    declined: number
    isLoading?: boolean
}

interface StatBoxProps {
    label: string
    value: number
    sub?: string
    subColor?: string
    highlight?: boolean
}

function StatBox({ label, value, sub, subColor, highlight }: StatBoxProps) {
    const theme = useTheme()

    return (
        <Box sx={{
            flex: 1, textAlign: 'center', p: 1.5,
            borderRadius: 2,
            bgcolor: highlight ? `${theme.palette.primary.main}10` : 'transparent',
            border: highlight ? `1px solid ${theme.palette.primary.main}30` : 'none',
        }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: highlight ? 'primary.main' : 'text.primary' }}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
            {sub && (
                <Typography variant="caption" sx={{ color: subColor || 'text.secondary', fontWeight: 700 }}>{sub}</Typography>
            )}
        </Box>
    )
}

export default function KeywordRankingsCard({
    total, top10, top20, improved, declined, isLoading = false
}: KeywordRankingsCardProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {[0, 1, 2].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ flex: 1, borderRadius: 2 }} />)}
                </Box>
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
                <i className="tabler-chart-bar" style={{ color: theme.palette.secondary.main, fontSize: '1.4rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Keyword Rankings</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <StatBox label="Total Keywords" value={total} highlight />
                <StatBox label="Top 10" value={top10} />
                <StatBox label="Top 20" value={top20} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'center' }}>
                    <i className="tabler-trending-up" style={{ color: theme.palette.success.main, fontSize: '1.1rem' }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>+{improved}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Improved</Typography>
                    </Box>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'center' }}>
                    <i className="tabler-trending-down" style={{ color: theme.palette.error.main, fontSize: '1.1rem' }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.main' }}>-{declined}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Declined</Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    )
}
