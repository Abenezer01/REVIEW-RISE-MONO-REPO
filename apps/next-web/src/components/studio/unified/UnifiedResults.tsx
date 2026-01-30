'use client'

import { useEffect, useState } from 'react'

import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { toast } from 'react-toastify'

import { useBusinessId } from '@/hooks/useBusinessId'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import apiClient from '@/lib/apiClient'
import SchedulePostDialog from './SchedulePostDialog'

import CaptionCard from './cards/CaptionCard'
import ContentIdeasCard from './cards/ContentIdeasCard'
import HashtagsCard from './cards/HashtagsCard'
import PreviewCard from './cards/PreviewCard'
import QuickActionsCard from './cards/QuickActionsCard'

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
    initialDate?: string | null
}

export default function UnifiedResults({ data, initialDate }: UnifiedResultsProps) {
    const { businessId } = useBusinessId()
    const { locationId } = useLocationFilter()
    const [isPublishing, setIsPublishing] = useState(false)
    const [previewCaption, setPreviewCaption] = useState(data.caption)

    // Reset preview when data changes
    useEffect(() => {
        setPreviewCaption(data.caption)
    }, [data])

    const [scheduleOpen, setScheduleOpen] = useState(false)

    // Auto-open schedule dialog if initialDate is provided
    useEffect(() => {
        if (initialDate) {
            setScheduleOpen(true)
        }
    }, [initialDate])

    // Helper to format date relative
    const getRelativeTime = () => {
        return 'Generated 2 min ago' // Mock for now
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

    const handleScheduleConfirm = async (date: Date) => {
        if (!businessId) {
            toast.error('We could not identify your business organization. Please try refreshing the page.')

            return
        }

        setIsPublishing(true)

        try {
            // Use Brand Service API to match Social Rise calendar
            await apiClient.post(`/api/brands/${businessId}/scheduling`, {
                platforms: [(data.platform || 'Instagram').toUpperCase()],
                content: {
                    text: previewCaption,
                    hashtags: '',
                    media: []
                },
                scheduledAt: date.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                status: 'scheduled',
                locationId: locationId || null
            })

            setScheduleOpen(false)
            toast.success(`Post successfully scheduled for ${date.toLocaleString()}`)
        } catch (error) {
            console.error('Failed to schedule post:', error)
            toast.error('Failed to schedule post. Please try again later.')
        } finally {
            setIsPublishing(false)
        }
    }

    const handleInstantPost = async () => {
        if (!businessId) {
            toast.error('We could not identify your business organization.')

            return
        }

        setIsPublishing(true)

        try {
            // Use Brand Service API with immediate scheduling
            await apiClient.post(`/api/brands/${businessId}/scheduling`, {
                platforms: [(data.platform || 'Instagram').toUpperCase()],
                content: {
                    text: previewCaption,
                    hashtags: '',
                    media: []
                },
                scheduledAt: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                status: 'scheduled',
                locationId: locationId || null
            })

            toast.success(`Post successfully scheduled to ${(data.platform || 'Instagram')}!`)
        } catch (error) {
            console.error('Failed to publish post:', error)
            toast.error('Failed to publish post. Please check your connection.')
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <Box>
            {/* Scheduling Dialog */}
            <SchedulePostDialog
                open={scheduleOpen}
                onClose={() => setScheduleOpen(false)}
                onSchedule={handleScheduleConfirm}
                initialDate={initialDate ? new Date(initialDate) : undefined}
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
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<i className="tabler-send" />}
                        onClick={handleInstantPost}
                        disabled={isPublishing}
                        sx={{ background: 'linear-gradient(45deg, #FF6F00, #FFCA28)' }}
                    >
                        {isPublishing ? 'Posting...' : 'Post Now'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column: Content Assets */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <CaptionCard caption={data.caption} onUseCaption={handleUseCaption} />
                        <HashtagsCard hashtags={data.hashtags} onUseHashtags={handleUseHashtags} />
                        <ContentIdeasCard contentIdeas={data.contentIdeas || []} onUseIdea={handleUseIdea} />
                    </Box>
                </Grid>

                {/* Right Column: Preview & Actions */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <PreviewCard
                            platform={data.platform || 'Instagram'}
                            previewCaption={previewCaption}
                            imagePrompt={data.imagePrompt}
                        />
                        <QuickActionsCard
                            onInstantPost={handleInstantPost}
                            onOpenSchedule={() => setScheduleOpen(true)}
                        />

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
