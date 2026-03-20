/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, Skeleton } from '@mui/material'
import HealthScoreRing from './HealthScoreRing'

export interface BusinessHealthCardProps {
    score: number
    seoScore: number
    reviewRating: number
    listingsAccuracy: number
    adsPerformance?: string
    isLoading?: boolean
}

export default function BusinessHealthCard({ score, seoScore, reviewRating, listingsAccuracy, adsPerformance = 'N/A', isLoading = false }: BusinessHealthCardProps) {
    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="circular" width={24} height={24} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, flexGrow: 1, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={150} height={150} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="100%" height={24} />
                </Box>
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{'Business Health Score'}</Typography>
                <i className="tabler-info-circle text-textSecondary" style={{ color: 'var(--mui-palette-text-secondary)', fontSize: '1.25rem' }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, flexGrow: 1, alignItems: 'center' }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'inline-flex',
                }}>
                    <HealthScoreRing score={score} size={150} strokeWidth={8} />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'SEO Score'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{seoScore}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'Review Rating'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        {reviewRating.toFixed(1)} <i className="tabler-star-filled" style={{ fontSize: 14, color: 'var(--mui-palette-text-primary)', marginLeft: 4 }} />
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'Listings'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{listingsAccuracy}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'Ads Performance'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{adsPerformance}</Typography>
                </Box>
            </Box>
        </Card>
    )
}
