'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { useTranslation } from '@/hooks/useTranslation'

interface IdeaCardProps {
    idea: {
        title: string
        description: string
        platform?: string
        tone?: string
        category?: string
        engagement?: 'high' | 'medium' | 'low'
        readingTime?: number
    }
    onUse: () => void
    onBookmark?: () => void
    onCopy?: () => void
}

export default function IdeaCard({ idea, onUse, onBookmark, onCopy }: IdeaCardProps) {
    const t = useTranslation('studio')

    const getEngagementColor = (level?: string) => {
        switch (level) {
            case 'high': return 'success'
            case 'medium': return 'warning'
            case 'low': return 'error'
            default: return 'default'
        }
    }

    const getEngagementLabel = (level?: string) => {
        switch (level) {
            case 'high': return t('ideas.highEngagement')
            case 'medium': return t('ideas.mediumEngagement')
            case 'low': return t('ideas.lowEngagement')
            default: return ''
        }
    }

    return (
        <Card 
            variant="outlined" 
            sx={{ 
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {idea.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {idea.description}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        {onBookmark && (
                            <Tooltip title="Bookmark">
                                <IconButton size="small" onClick={onBookmark}>
                                    <i className="tabler-bookmark" style={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onCopy && (
                            <Tooltip title="Copy">
                                <IconButton size="small" onClick={onCopy}>
                                    <i className="tabler-copy" style={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {idea.platform && (
                        <Chip 
                            label={idea.platform} 
                            size="small" 
                            sx={{ 
                                bgcolor: 'primary.lightOpacity',
                                color: 'primary.main',
                                fontWeight: 'medium'
                            }} 
                        />
                    )}
                    {idea.category && (
                        <Chip 
                            label={idea.category} 
                            size="small" 
                            variant="outlined"
                        />
                    )}
                    {idea.tone && (
                        <Chip 
                            label={idea.tone} 
                            size="small" 
                            variant="outlined"
                        />
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {idea.engagement && (
                            <Chip
                                icon={<i className="tabler-trending-up" style={{ fontSize: 14 }} />}
                                label={getEngagementLabel(idea.engagement)}
                                size="small"
                                color={getEngagementColor(idea.engagement) as any}
                                variant="outlined"
                            />
                        )}
                        {idea.readingTime && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <i className="tabler-clock" style={{ fontSize: 16, opacity: 0.6 }} />
                                <Typography variant="caption" color="text.secondary">
                                    {idea.readingTime} {t('ideas.minRead')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onUse}
                        sx={{ 
                            borderRadius: 2, 
                            px: 3,
                            bgcolor: 'secondary.main',
                            '&:hover': { bgcolor: 'secondary.dark' }
                        }}
                    >
                        {t('ideas.useThisIdea')}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}
