'use client'

import React from 'react'

import { Box, Typography, Card, CardActionArea, Grid } from '@mui/material'
import { useTranslations } from 'next-intl'

interface ToneSelectorProps {
    value: string
    onChange: (value: string) => void
}

const TONES = [
    { value: 'friendly', label: 'Friendly', icon: 'tabler-mood-smile', color: '#9C27B0' },
    { value: 'professional', label: 'Professional', icon: 'tabler-briefcase', color: '#2196F3' },
    { value: 'luxury', label: 'Luxury', icon: 'tabler-diamond', color: '#E91E63' },
    { value: 'casual', label: 'Casual', icon: 'tabler-coffee', color: '#FF9800' },
    { value: 'inspiring', label: 'Inspiring', icon: 'tabler-flame', color: '#F44336' },
    { value: 'humorous', label: 'Humorous', icon: 'tabler-mood-happy', color: '#4CAF50' },
    { value: 'energetic', label: 'Energetic', icon: 'tabler-bolt', color: '#FFC107' },
    { value: 'educational', label: 'Educational', icon: 'tabler-school', color: '#3F51B5' }
]

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
    const t = useTranslations('studio.captions')

    return (
        <Box>
            <Typography variant="body2" fontWeight="bold" mb={1}>{t('selectTone')}</Typography>
            <Grid container spacing={2}>
                {TONES.map((tone) => (
                    <Grid size={{ xs: 4, sm: 2 }} key={tone.value}>
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: 2,
                                borderColor: value === tone.value ? tone.color : 'divider',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: tone.color },
                                position: 'relative'
                            }}
                        >
                            <CardActionArea 
                                onClick={() => onChange(tone.value)} 
                                sx={{ 
                                    height: '100%', 
                                    p: 2, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: 1,
                                    bgcolor: value === tone.value ? `${tone.color}10` : 'transparent'
                                }}
                            >
                                <i className={tone.icon} style={{ fontSize: 24, color: value === tone.value ? tone.color : 'inherit' }} />
                                <Typography 
                                    variant="caption" 
                                    fontWeight="bold" 
                                    color={value === tone.value ? tone.color : 'text.secondary'}
                                    sx={{ fontSize: '0.7rem' }}
                                >
                                    {tone.label}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
