/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardHeader, CardContent, Typography, Box, Stack, useTheme, Chip } from '@mui/material'

export interface StrategicInsight {
    id: string;
    title: string;
    description: string;
    impact: string;
    type: string;
}

interface StrategicInsightsCardProps {
    insights: StrategicInsight[];
}

export default function StrategicInsightsCard({ insights }: StrategicInsightsCardProps) {
    const theme = useTheme();

    if (!insights || insights.length === 0) {
        return null; // hide if none
    }

    return (
        <Card sx={{ borderRadius: 3, mb: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardHeader
                title={<Typography variant="h5" fontWeight={800}>{'AI Strategic Insights'}</Typography>}
                subheader="High-level maneuvers to improve your topical authority and domain ranking."
                sx={{ pb: 1 }}
            />
            <CardContent>
                <Stack spacing={3}>
                    {insights.map((insight, idx) => (
                        <Box key={insight.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box sx={{
                                minWidth: 28, height: 28,
                                borderRadius: '50%',
                                bgcolor: theme.palette.primary.light + '20',
                                color: theme.palette.primary.main,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '0.875rem'
                            }}>
                                {idx + 1}
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                                    {insight.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                    {insight.description}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={insight.impact || 'Medium'}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            bgcolor: (insight.impact || '').includes('High') ? theme.palette.success.light + '20' : theme.palette.warning.light + '20',
                                            color: (insight.impact || '').includes('High') ? theme.palette.success.main : theme.palette.warning.dark
                                        }}
                                    />
                                    <Chip
                                        label={insight.type}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    )
}
