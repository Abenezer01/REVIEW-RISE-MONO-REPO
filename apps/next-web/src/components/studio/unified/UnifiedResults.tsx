'use client'

import React, { useState, useEffect } from 'react'

import { Box, Card, CardContent, Typography, Chip, Stack, Button, Divider, Grid, IconButton, Avatar, Tooltip } from '@mui/material'
import { toast } from 'react-toastify'

import SchedulePostDialog from './SchedulePostDialog'

interface UnifiedResultsProps {
    data: {
        platform?: string
        caption: string
        hashtags: {
            highVolume?: string[]
            niche?: string[]
            branded?: string[]
            [key: string]: string[] | undefined
        }
        contentIdeas?: Array<{
            title: string
            description: string
            type?: string
        }>
        imagePrompt?: string
    }
}

export default function UnifiedResults({ data }: UnifiedResultsProps) {
    const [previewCaption, setPreviewCaption] = useState(data.caption)
    
    // Reset preview when data changes
    useEffect(() => {
        setPreviewCaption(data.caption)
    }, [data])

    // Helper to format date relative
    const getRelativeTime = () => {
        return 'Generated 2 min ago' // Mock for now
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    const getAllHashtags = () => {
        const { highVolume = [], niche = [], branded = [] } = data.hashtags || {}

        
return [...highVolume, ...niche, ...branded].join(' ')
    }

    const handleUseCaption = () => {
        setPreviewCaption(data.caption)
        toast.info('Reset preview to original caption')
    }

    const handleUseHashtags = (tags: string[]) => {
        const tagsString = tags.join(' ')

        setPreviewCaption(prev => `${prev}\n\n${tagsString}`)
        toast.success('Added hashtags to preview')
    }

    const handleUseIdea = (title: string, description: string) => {
        setPreviewCaption(`${title}\n\n${description}`)
        toast.success('Updated preview with content idea')
    }

    const [scheduleOpen, setScheduleOpen] = useState(false)

    const handleScheduleConfirm = (date: Date) => {
         toast.success(`Post scheduled for ${date.toLocaleString()}`)

         // Logic to save to backend would go here
    }

    return (
        <Box>
            <SchedulePostDialog 
                open={scheduleOpen} 
                onClose={() => setScheduleOpen(false)} 
                onSchedule={handleScheduleConfirm} 
            />

            {/* Header Area */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, gap: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>Your Complete Post Package</Typography>
                    <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
                        <Chip 
                            icon={<i className={`tabler-brand-${(data.platform || 'instagram').toLowerCase()}`} />} 
                            label={data.platform || 'Instagram'} 
                            size="small" 
                            variant="outlined" 
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', fontSize: '0.875rem' }}>
                            <i className="tabler-clock" style={{ fontSize: 16 }} />
                            <span>{getRelativeTime()}</span>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', fontSize: '0.875rem' }}>
                            <i className="tabler-target" style={{ fontSize: 16 }} />
                            <span>Goal: Engagement</span>
                        </Box>
                    </Stack>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        startIcon={<i className="tabler-share" />}
                        variant="outlined"
                        color="inherit"
                    >
                        Share
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<i className="tabler-calendar-plus" />}
                        onClick={() => setScheduleOpen(true)}
                    >
                        Schedule Post
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column: Content Assets */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        
                        {/* 1. Caption Card */}
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 3.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.main' }}>
                                            <i className="tabler-text-caption" style={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">Caption</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Use Caption">
                                            <IconButton size="small" onClick={handleUseCaption} color="primary">
                                                <i className="tabler-arrow-right" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Copy Caption">
                                            <IconButton size="small" onClick={() => copyToClipboard(data.caption)}>
                                                <i className="tabler-copy" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3.5, lineHeight: 1.75, color: 'text.primary', fontSize: '0.95rem' }}>
                                    {data.caption}
                                </Typography>
                                
                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Words:</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary">{data.caption.split(' ').length}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Characters:</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary">{data.caption.length}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Emojis:</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary">{(data.caption.match(/[\p{Emoji}]/gu) || []).length}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Engagement Score:</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">94/100</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 2. Hashtags Card */}
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 3.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#E3F2FD', color: '#2196F3' }}>
                                            <i className="tabler-hash" style={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">Hashtags (30)</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Use All Hashtags">
                                            <IconButton 
                                                size="small" 
                                                color="primary"
                                                onClick={() => handleUseHashtags([...(data.hashtags.highVolume || []), ...(data.hashtags.niche || []), ...(data.hashtags.branded || [])])}
                                            >
                                                <i className="tabler-plus" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Copy All">
                                            <IconButton size="small" onClick={() => copyToClipboard(getAllHashtags())}>
                                                <i className="tabler-copy" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {/* Tabs/Chips */}
                                <Stack direction="row" spacing={1.5} mb={3.5} flexWrap="wrap">
                                    <Chip label="#HighVolume" color="primary" sx={{ borderRadius: 1.5 }} />
                                    <Chip label="#Niche" color="default" variant="outlined" sx={{ borderRadius: 1.5 }} />
                                    <Chip label="#Branded" color="default" variant="outlined" sx={{ borderRadius: 1.5 }} />
                                </Stack>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary">High-Volume Hashtags</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                 <Tooltip title="Add to Preview">
                                                    <IconButton size="small" onClick={() => handleUseHashtags(data.hashtags.highVolume || [])} color="primary">
                                                        <i className="tabler-circle-plus" style={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Chip label="HIGH REACH" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: '0.875rem' }}>
                                            {(data.hashtags.highVolume || []).join(' ')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Niche Hashtags</Typography>
                                             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                 <Tooltip title="Add to Preview">
                                                    <IconButton size="small" onClick={() => handleUseHashtags(data.hashtags.niche || [])} color="primary">
                                                        <i className="tabler-circle-plus" style={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Chip label="TARGETED" size="small" color="info" sx={{ height: 20, fontSize: '0.65rem' }} />
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: '0.875rem' }}>
                                            {(data.hashtags.niche || []).join(' ')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Branded Hashtags</Typography>
                                             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                 <Tooltip title="Add to Preview">
                                                    <IconButton size="small" onClick={() => handleUseHashtags(data.hashtags.branded || [])} color="primary">
                                                        <i className="tabler-circle-plus" style={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Chip label="BRAND" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: '0.875rem' }}>
                                            {(data.hashtags.branded || []).join(' ')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 3. Content Ideas Card */}
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 3.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#FFF8E1', color: '#FFC107' }}>
                                            <i className="tabler-bulb" style={{ fontSize: 20 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">Content Ideas</Typography>
                                    </Box>
                                    <IconButton size="small">
                                         <i className="tabler-plus" />
                                    </IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    {(data.contentIdeas || []).map((idea, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.2s' }}>
                                            <Box sx={{ 
                                                minWidth: 32, height: 32, 
                                                borderRadius: 1.5, bgcolor: 'action.hover', color: 'text.secondary',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', fontSize: '0.875rem', mt: 0.25,
                                                flexShrink: 0
                                            }}>
                                                {idx + 1}
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75, fontSize: '0.95rem' }}>{idea.title}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                                                    {idea.description}
                                                </Typography>
                                            </Box>
                                            <Tooltip title="Use this Idea">
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleUseIdea(idea.title, idea.description)}
                                                >
                                                    <i className="tabler-arrow-right" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                    </Box>
                </Grid>

                {/* Right Column: Preview & Actions */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* Preview Card */}
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Instagram Preview</Typography>
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#E1306C' }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">your_brand</Typography>
                                        <Typography variant="caption" color="text.secondary">Original Audio</Typography>
                                    </Box>
                                    <Box sx={{ ml: 'auto' }}>
                                        <i className="tabler-dots" />
                                    </Box>
                                </Box>

                                {/* Image Placeholder */}
                                <Box sx={{ 
                                    aspectRatio: '1/1', 
                                    bgcolor: 'action.hover', 
                                    borderRadius: 2, 
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: 2,
                                    color: 'text.secondary',
                                    p: 3,
                                    textAlign: 'center'
                                }}>
                                    {data.imagePrompt ? (
                                        <>
                                            <i className="tabler-photo" style={{ fontSize: 48, opacity: 0.3 }} />
                                            <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                                                &ldquo;{data.imagePrompt.slice(0, 100)}...&rdquo;
                                            </Typography>
                                        </>
                                    ) : (
                                        <i className="tabler-photo" style={{ fontSize: 48, opacity: 0.3 }} />
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <i className="tabler-heart" style={{ fontSize: 22 }} />
                                        <i className="tabler-message-circle" style={{ fontSize: 22 }} />
                                        <i className="tabler-send" style={{ fontSize: 22 }} />
                                    </Box>
                                    <i className="tabler-bookmark" style={{ fontSize: 22 }} />
                                </Box>

                                <Typography variant="body2" fontWeight="bold" gutterBottom>1,234 likes</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: 8 }}>your_brand</span>
                                    {previewCaption && previewCaption.slice(0, 100)}... <span style={{ color: 'text.secondary' }}>more</span>
                                </Typography>
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Full Caption Preview:</Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                        {previewCaption}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>Quick Actions</Typography>
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[
                                    { label: 'Schedule to Instagram', icon: 'tabler-calendar' },
                                    { label: 'Download as PDF', icon: 'tabler-download' },
                                    { label: 'Share with Team', icon: 'tabler-share' }
                                ].map((action, i) => (
                                    <Button 
                                        key={i}
                                        fullWidth 
                                        sx={{ 
                                            justifyContent: 'flex-start', py: 1.5, px: 2, 
                                            color: 'text.primary',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                        startIcon={<Box sx={{ p: 0.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex' }}><i className={action.icon} /></Box>}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Regenerate Cta */}
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mt: 2 }}>
                             <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Need Different Options?</Typography>
                                <Typography variant="caption" color="text.secondary" paragraph>
                                    Generate new variations while keeping the same topic.
                                </Typography>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    color="secondary"
                                    startIcon={<i className="tabler-refresh" />} 
                                    sx={{ background: 'linear-gradient(45deg, #9C27B0, #E040FB)' }}
                                    onClick={() => toast.info('Regenerate triggered')}
                                >
                                    Regenerate Package
                                </Button>
                             </CardContent>
                        </Card>

                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
