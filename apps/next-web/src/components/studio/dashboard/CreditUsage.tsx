'use client'

import React from 'react'

import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material'
import { useTranslations } from 'next-intl'

export default function CreditUsage() {
    const t = useTranslations('studio.dashboard')

    const stats = [
        { label: 'Caption Generation', current: 80, max: 100, color: 'primary' },
        { label: 'AI Images', current: 65, max: 100, color: 'secondary' },
        { label: '30-Day Plans', current: 45, max: 100, color: 'info' },
        { label: 'Carousel Builder', current: 90, max: 100, color: 'warning' },
    ]

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>{t('creditsTitle')}</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {stats.map((stat, idx) => (
                        <Box key={idx}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" fontWeight="medium" color="text.primary">{stat.label}</Typography>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                    {stat.current}/{stat.max}
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={(stat.current / stat.max) * 100} 
                                color={stat.color as any} 
                                sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }} 
                            />
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
