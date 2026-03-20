/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Box, Card, Typography, useTheme, Skeleton } from '@mui/material'

export interface SeoScoreGaugeProps {
    score: number
    lastScannedAt?: string
    isLoading?: boolean
}

export default function SeoScoreGauge({ score, lastScannedAt, isLoading = false }: SeoScoreGaugeProps) {
    const theme = useTheme()

    const color = score >= 70 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main
    const label = score >= 70 ? 'Good Performance' : score >= 50 ? 'Needs Improvement' : 'Poor Performance'

    const size = 180
    const r = 72
    const circ = 2 * Math.PI * r
    const strokeDash = (score / 100) * circ

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                <Skeleton variant="circular" width={160} height={160} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} />
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                    SEO Health Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 4, bgcolor: `${color}20` }}>
                    <i className="tabler-trending-up" style={{ fontSize: 10, color }} />
                    <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.7rem' }}>+5 pts</Typography>
                </Box>
            </Box>

            <Box sx={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={theme.palette.action.hover} strokeWidth={12} />
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke={color} strokeWidth={12}
                        strokeDasharray={`${strokeDash} ${circ}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, color, lineHeight: 1 }}>{score}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>/100</Typography>
                </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ color, fontWeight: 700, mt: 1 }}>{label}</Typography>
            {lastScannedAt && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Last scanned {lastScannedAt}
                </Typography>
            )}
        </Card>
    )
}
