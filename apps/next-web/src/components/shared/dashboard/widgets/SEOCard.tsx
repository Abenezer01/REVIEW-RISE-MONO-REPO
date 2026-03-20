/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, Button, Chip, useTheme, Skeleton } from '@mui/material'

export interface SEOCardProps {
    score: number
    delta: number
    fixes: string[]
    onRunScan: () => void
    isLoading?: boolean
}

export default function SEOCard({ score, delta, fixes, onRunScan, isLoading = false }: SEOCardProps) {
    const theme = useTheme()
    const isPositive = delta >= 0

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Skeleton variant="text" width="50%" height={32} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Skeleton variant="rectangular" width="40%" height={64} sx={{ borderRadius: 2 }} />
                </Box>
                <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1.5 }} />
                <Box sx={{ flexGrow: 1, mb: 3 }}>
                    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <i className="tabler-search" style={{ color: theme.palette.info.main, marginRight: 8, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{'SEO Score'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, mr: 2 }}>{score}</Typography>
                <Chip
                    label={`${isPositive ? '+' : ''}${delta} pts`}
                    size="small"
                    color={isPositive ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', mb: 1.5, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>{'Top 3 Fixes'}</Typography>
            <Box sx={{ flexGrow: 1, mb: 3 }}>
                {fixes.map((fix, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', mt: 0.75, mr: 1.5, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>{fix}</Typography>
                    </Box>
                ))}
                {fixes.length === 0 && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'No active fixes needed.'}</Typography>}
            </Box>
            <Button variant="contained" color="warning" fullWidth sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1 }} onClick={onRunScan}>
                <i className="tabler-reload" style={{ marginRight: 8, fontSize: '1.25rem' }} />
                Run New Scan
            </Button>
        </Card>
    )
}
