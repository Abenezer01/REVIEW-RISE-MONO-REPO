'use client'

import React from 'react'

import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material'
import { useTranslations } from 'next-intl'

interface ToolCardProps {
    title: string
    description: string
    icon: React.ReactNode
    stats: { label: string, value: string }[]
    color?: string
    isNew?: boolean
    isPopular?: boolean
    onClick: () => void
}

export default function ToolCard({ title, description, icon, stats, color = 'primary.main', isNew, isPopular, onClick }: ToolCardProps) {
    const t = useTranslations('studio')
    const tc = useTranslations('common')

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative', 
                transition: 'all 0.3s ease-in-out',
                borderColor: 'divider',
                '&:hover': { 
                    borderColor: color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 4px 20px 0 ${color}25`
                } 
            }}
        >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ 
                        width: 56, 
                        height: 56, 
                        borderRadius: 3, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: `${color}15`, // alpha 0.15
                        color: color,
                        transition: 'all 0.3s ease'
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {isNew && <Chip label={tc('common.new')} size="small" sx={{ bgcolor: '#FF4081', color: 'white', borderRadius: 1, height: 22, fontSize: '0.7rem', fontWeight: 'bold' }} />}
                        {isPopular && <Chip label={tc('common.popular')} size="small" sx={{ bgcolor: '#7C4DFF', color: 'white', borderRadius: 1, height: 22, fontSize: '0.7rem', fontWeight: 'bold' }} />}
                    </Box>
                </Box>

                <Typography variant="h6" fontWeight="800" gutterBottom>{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, lineHeight: 1.6 }}>{description}</Typography>

                <Box sx={{ display: 'flex', gap: 3, mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    {stats.map((stat, idx) => (
                        <Box key={idx}>
                            <Typography variant="h6" fontWeight="bold" color="text.primary">{stat.value}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>{stat.label}</Typography>
                        </Box>
                    ))}
                </Box>

                <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={onClick} 
                    sx={{ 
                        bgcolor: color, 
                        color: 'white', 
                        fontWeight: 'bold',
                        boxShadow: `0 4px 12px ${color}40`,
                        '&:hover': { bgcolor: color, filter: 'brightness(1.1)' } 
                    }}
                >
                    {t('studio.generateButtonLabel', { type: title.split(' ')[0] })}
                </Button>
            </CardContent>
        </Card>
    )
}
