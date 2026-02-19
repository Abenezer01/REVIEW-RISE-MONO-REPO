'use client'

import React, { useState } from 'react'

import { Box, Typography, Card, CardContent, Chip, Stack } from '@mui/material'

import { useTranslation } from '@/hooks/useTranslation'

interface PlanDay {
    day: number
    topic: string
    platform: string
    contentType: string
}

interface ScheduledPostListProps {
    day: number
    posts: PlanDay[]
    dateLabel?: string
}

const PLATFORMS = ['All', 'Instagram', 'Facebook', 'Twitter', 'LinkedIn']

export default function ScheduledPostList({ posts, dateLabel }: ScheduledPostListProps) {
    const t = useTranslation('studio')
    const [filter, setFilter] = useState('All')

    const filteredPosts = filter === 'All' 
        ? posts 
        : posts.filter(p => p.platform.toLowerCase() === filter.toLowerCase())

    const getPlatformColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'instagram': return '#E1306C'
            case 'facebook': return '#1877F2'
            case 'linkedin': return '#0A66C2'
            case 'twitter': return '#1DA1F2'
            default: return '#757575'
        }
    }

    return (
        <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {t('planner.resultsTitle')}
                        {dateLabel && <Typography component="span" variant="h6" fontWeight="normal" color="text.secondary"> • {dateLabel}</Typography>}
                    </Typography>
                </Box>

                {/* Filters */}
                <Stack direction="row" spacing={1} mb={4} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {PLATFORMS.map(p => (
                         <Chip 
                            key={p} 
                            label={p} 
                            size="small"
                            onClick={() => setFilter(p)}
                            variant={filter === p ? 'filled' : 'outlined'}
                            color={filter === p ? 'primary' : 'default'}
                            sx={{ borderRadius: 1.5, fontWeight: 'bold' }}
                         />
                    ))}
                </Stack>

                {/* Posts List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredPosts.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="body2">{t('planner.scheduled.noPosts')}</Typography>
                        </Box>
                    ) : (
                        filteredPosts.map((post, idx) => (
                            <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Chip 
                                        label={post.platform} 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: `${getPlatformColor(post.platform)}20`, 
                                            color: getPlatformColor(post.platform), 
                                            fontWeight: 'bold', 
                                            borderRadius: 1, 
                                            height: 24, 
                                            fontSize: '0.7rem' 
                                        }} 
                                    />
                                    {/* Removed repeated date string */}
                                </Box>
                                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>
                                    {post.topic} 
                                    {post.contentType && <Typography component="span" variant="body2" color="text.secondary"> • {post.contentType}</Typography>}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip label="#growth" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                    <Chip label={`#${post.platform.toLowerCase()}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                </Stack>
                            </Box>
                        ))
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}
