/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, useTheme, Skeleton, LinearProgress } from '@mui/material'

export interface CompetitorBenchmarkStripProps {
    myRating: number
    avgRating: number
    myReviewCount: number
    avgReviewCount: number
    mySeoScore: number
    avgSeoScore: number
    isLoading?: boolean
}

interface BenchmarkRowProps {
    label: string
    myValue: number
    avgValue: number
    max: number
    format?: (v: number) => string
    myColor: string
    avgColor: string
}

function BenchmarkRow({ label, myValue, avgValue, max, format = (v) => String(v), myColor, avgColor }: BenchmarkRowProps) {
    const myPct = (myValue / max) * 100
    const avgPct = (avgValue / max) * 100
    const delta = myValue - avgValue
    const isAhead = delta >= 0

    return (
        <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Avg: {format(avgValue)}
                    </Typography>
                    <Box sx={{
                        px: 1, py: 0.25, borderRadius: 2,
                        bgcolor: isAhead ? 'success.main' : 'error.main',
                        display: 'inline-flex', alignItems: 'center', gap: 0.25
                    }}>
                        <i
                            className={isAhead ? 'tabler-trending-up' : 'tabler-trending-down'}
                            style={{ fontSize: 10, color: '#fff' }}
                        />
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>
                            {isAhead ? '+' : ''}{format(delta)}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ position: 'relative', mb: 0.5 }}>
                <Box sx={{ mb: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography variant="caption" sx={{ color: myColor, fontWeight: 600 }}>You: {format(myValue)}</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(myPct, 100)}
                        sx={{
                            height: 8, borderRadius: 4,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: myColor, borderRadius: 4 }
                        }}
                    />
                </Box>
                <Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(avgPct, 100)}
                        sx={{
                            height: 5, borderRadius: 4,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: avgColor, borderRadius: 4, opacity: 0.6 }
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default function CompetitorBenchmarkStrip({
    myRating, avgRating, myReviewCount, avgReviewCount, mySeoScore, avgSeoScore, isLoading = false
}: CompetitorBenchmarkStripProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
                {[0, 1, 2].map(i => (
                    <Box key={i} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Skeleton variant="text" width="30%" height={20} />
                            <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 2 }} />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4, mb: 0.5 }} />
                        <Skeleton variant="rectangular" width="85%" height={5} sx={{ borderRadius: 4 }} />
                    </Box>
                ))}
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="tabler-podium" style={{ color: theme.palette.warning.main, fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Competitor Benchmark</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>You</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.divider }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Category Avg</Typography>
                    </Box>
                </Box>
            </Box>

            <BenchmarkRow
                label="Review Rating"
                myValue={myRating}
                avgValue={avgRating}
                max={5}
                format={(v) => `${v.toFixed(1)}★`}
                myColor={theme.palette.warning.main}
                avgColor={theme.palette.divider}
            />
            <BenchmarkRow
                label="Total Reviews"
                myValue={myReviewCount}
                avgValue={avgReviewCount}
                max={Math.max(myReviewCount, avgReviewCount) * 1.2}
                format={(v) => String(Math.round(v))}
                myColor={theme.palette.success.main}
                avgColor={theme.palette.divider}
            />
            <BenchmarkRow
                label="SEO Score"
                myValue={mySeoScore}
                avgValue={avgSeoScore}
                max={100}
                format={(v) => `${Math.round(v)}`}
                myColor={theme.palette.info.main}
                avgColor={theme.palette.divider}
            />
        </Card>
    )
}
