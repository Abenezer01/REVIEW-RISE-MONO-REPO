/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, Button, Chip, useTheme, Skeleton } from '@mui/material'

export interface ReputationCardProps {
    rating: number
    newReviewsCount: number
    responseRate: number
    sentimentPositive: number
    onReply: () => void
    isLoading?: boolean
}

export default function ReputationCard({ rating, newReviewsCount, responseRate, sentimentPositive, onReply, isLoading = false }: ReputationCardProps) {
    const theme = useTheme()
    const isPositiveGrowth = newReviewsCount >= 0

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Skeleton variant="text" width="50%" height={32} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Skeleton variant="rectangular" width="40%" height={64} sx={{ borderRadius: 2 }} />
                </Box>
                <Box sx={{ flexGrow: 1, mb: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="100%" height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
            </Card>
        )
    }

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <i className="tabler-star-filled" style={{ color: theme.palette.warning.main, marginRight: 8, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{'Reputation'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, mr: 1 }}>{rating.toFixed(1)}</Typography>
                <i className="tabler-star-filled" style={{ color: theme.palette.text.primary, marginRight: 16, fontSize: '1.75rem' }} />
                <Chip
                    label={`${isPositiveGrowth ? '+' : ''}${newReviewsCount} reviews`}
                    size="small"
                    color={isPositiveGrowth ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                />
            </Box>

            <Box sx={{ flexGrow: 1, mb: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'Response Rate'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{responseRate}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'Sentiment'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sentimentPositive}{'% Positive'}</Typography>
                </Box>
            </Box>

            <Button variant="contained" color="warning" fullWidth sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1 }} onClick={onReply}>
                <i className="tabler-message-circle" style={{ marginRight: 8, fontSize: '1.25rem' }} />
                Reply to Reviews
            </Button>
        </Card>
    )
}
