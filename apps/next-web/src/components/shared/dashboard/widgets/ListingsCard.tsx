/* eslint-disable react/jsx-no-literals */
'use client'
import React from 'react'
import { Card, Box, Typography, Button, Chip, useTheme, Skeleton } from '@mui/material'

export interface ListingsCardProps {
    accuracyPercentage: number
    napStatus: 'Healthy' | 'Warning' | 'Critical'
    missingCount: number
    onFix: () => void
    isLoading?: boolean
}

export default function ListingsCard({ accuracyPercentage, napStatus, missingCount, onFix, isLoading = false }: ListingsCardProps) {
    const theme = useTheme()

    if (isLoading) {
        return (
            <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Skeleton variant="text" width="50%" height={32} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Skeleton variant="rectangular" width="40%" height={64} sx={{ borderRadius: 2 }} />
                </Box>
                <Box sx={{ flexGrow: 1, mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="text" width="100%" height={24} />
                    <Skeleton variant="text" width="100%" height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
            </Card>
        )
    }

    const getNapColor = () => {
        if (napStatus === 'Healthy') return 'success'
        if (napStatus === 'Warning') return 'warning'
        
return 'error'
    }

    const tagColor = getNapColor()

    return (
        <Card sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <i className="tabler-map-pin" style={{ color: theme.palette.secondary.main, marginRight: 8, fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{'Listings'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, mr: 1 }}>{accuracyPercentage}%</Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', pb: 0.5 }}>{'Accuracy'}</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{'NAP Consistency'}</Typography>
                    <Chip label={napStatus} size="small" color={tagColor} icon={<i className="tabler-check" style={{ fontSize: 14 }} />} sx={{ fontWeight: 600 }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', mr: 1.5 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{missingCount} {'missing listings detected'}</Typography>
                </Box>
            </Box>

            <Button variant="contained" color="warning" fullWidth sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1 }} onClick={onFix}>
                <i className="tabler-tool" style={{ marginRight: 8, fontSize: '1.25rem' }} />
                Fix Listings
            </Button>
        </Card>
    )
}
