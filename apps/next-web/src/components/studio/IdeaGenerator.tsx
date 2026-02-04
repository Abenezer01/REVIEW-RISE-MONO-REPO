
'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { useTranslations } from 'next-intl'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

import { SystemMessageCode } from '@platform/contracts'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { useBusinessId } from '@/hooks/useBusinessId'
import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import StudioGenerateButton from './shared/StudioGenerateButton'
import ToneSelector from './selectors/ToneSelector'
import PlatformSelector from './selectors/PlatformSelector'
import IdeaCard from './ideas/IdeaCard'

const BUSINESS_TYPES = [
    'ecommerce',
    'local',
    'consultant',
    'saas',
    'creator',
    'restaurant',
    'realestate'
]

const GOALS = [
    'awareness',
    'traffic',
    'leads',
    'engagement',
    'promote',
    'educate'
]

const CONTENT_TYPES = ['blog', 'social', 'video', 'infographic']

type FilterTab = 'all' | 'blog' | 'social' | 'video'

export default function IdeaGenerator() {
    const { notify } = useSystemMessages()
    const t = useTranslations('studio.ideas')
    const tc = useTranslations('common')
    const { businessId } = useBusinessId()
    const [loading, setLoading] = useState(false)
    const [businessType, setBusinessType] = useState('local')
    const [goal, setGoal] = useState('awareness')
    const [topic, setTopic] = useState('')
    const [platform, setPlatform] = useState('instagram')
    const [contentType, setContentType] = useState('blog')
    const [tone, setTone] = useState('professional')
    const [numberOfIdeas, setNumberOfIdeas] = useState(10)
    const [ideas, setIdeas] = useState<any[]>([])
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
    const [history, setHistory] = useState<any[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [historyOffset, setHistoryOffset] = useState(0)
    const [hasMoreHistory, setHasMoreHistory] = useState(true)
    const [loadingHistory, setLoadingHistory] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/ideas`, { 
                businessType, 
                goal,
                topic,
                contentType,
                tone,
                platform,
                numberOfIdeas
            })

            const data = response.data


            // Enhance ideas with mock engagement and reading time
            const enhancedIdeas = (data.ideas || []).map((idea: any, idx: number) => ({
                ...idea,
                engagement: ['high', 'medium', 'low'][idx % 3] as 'high' | 'medium' | 'low',
                readingTime: Math.floor(Math.random() * 10) + 3,
                category: CONTENT_TYPES[idx % CONTENT_TYPES.length],
                platform: idea.platform || platform,
                tone: tone
            }))

            setIdeas(enhancedIdeas)
            setActiveFilter('all')
            
            // Auto-save all ideas to ContentIdea table
            if (businessId && enhancedIdeas.length > 0) {
                try {
                    await apiClient.post(`${SERVICES.brand.url}/${businessId}/content-ideas`, {
                        businessId,
                        ideas: enhancedIdeas
                    })

                    // Silent success - background logging
                    fetchHistory(true) // Refresh history
                } catch (error) {
                    console.error('Failed to save idea history:', error)
                }
            }
            
            notify(SystemMessageCode.AI_IDEAS_GENERATED)
        } catch (error) {
            console.error(error)
            notify(SystemMessageCode.GENERIC_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDraft = async (idea: any) => {
        if (!businessId) {
            notify(SystemMessageCode.GENERIC_ERROR)
            
return
        }

        try {
            await apiClient.post(`${SERVICES.social.url}/posts`, {
                businessId,
                content: `${idea.title}\n\n${idea.description}`,
                platform: idea.platform || 'instagram',
                status: 'draft'
            })

            notify(SystemMessageCode.SAVE_SUCCESS)
        } catch (error) {
            console.error(error)
            notify(SystemMessageCode.SAVE_FAILED)
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        notify(SystemMessageCode.COPIED_TO_CLIPBOARD)
    }

    // Filter ideas
    const filteredIdeas = activeFilter === 'all' 
        ? ideas
        : ideas.filter((idea: any) => {
            if (activeFilter === 'blog') return idea.category?.toLowerCase().includes('blog')
            if (activeFilter === 'social') return idea.category?.toLowerCase().includes('social')
            if (activeFilter === 'video') return idea.category?.toLowerCase().includes('video')
            
return true
        })

    // Fetches history with optional reset
    const fetchHistory = useCallback(async (reset = false) => {
        if (!businessId) return
        
        setLoadingHistory(true)

        try {
            const offset = reset ? 0 : historyOffset
            const response = await apiClient.get(`${SERVICES.brand.url}/${businessId}/content-ideas?limit=10&offset=${offset}`)
            const fetchedIdeas = response.data.ideas || []
            
            if (reset) {
                setHistory(fetchedIdeas)
                setHistoryOffset(10)
                setHasMoreHistory(fetchedIdeas.length === 10)
            } else {
                setHistory(prev => [...prev, ...fetchedIdeas])
                setHistoryOffset(prev => prev + 10)
                setHasMoreHistory(fetchedIdeas.length === 10)
            }
        } catch (error) {
            console.error('Failed to fetch idea history:', error)
        } finally {
            setLoadingHistory(false)
        }
    }, [businessId, historyOffset])

    // Initial load
    useEffect(() => {
        if (businessId) {
            fetchHistory(true)
        }
    }, [businessId, fetchHistory])

    // Load more history
    const loadMoreHistory = () => fetchHistory(false)

    // Helper to categorize dates
    const getCategoryFromDate = (date: Date) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today)

        yesterday.setDate(yesterday.getDate() - 1)
        const lastWeek = new Date(today)

        lastWeek.setDate(lastWeek.getDate() - 7)

        const itemDate = new Date(date)
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())

        if (itemDay.getTime() === today.getTime()) return 'Today'
        if (itemDay.getTime() === yesterday.getTime()) return 'Yesterday'
        if (itemDay >= lastWeek) return 'This Week'
        
return 'Older'
    }

    // Group history by date
    const groupedHistory = history.reduce((acc, idea) => {
        const categoryKey = getCategoryFromDate(new Date(idea.createdAt))

        if (!acc[categoryKey]) acc[categoryKey] = []
        acc[categoryKey].push(idea)
        
return acc
    }, {} as Record<string, any[]>)

    return (
        <Box>

            {/* Input Section */}
            <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <i className="tabler-sparkles" style={{ fontSize: 20, color: '#9C27B0' }} />
                        <Typography variant="h6" fontWeight="bold">{t('generateTitle')}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                select
                                label={t('businessType')}
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                fullWidth
                            >
                                {BUSINESS_TYPES.map((bt) => (
                                    <MenuItem key={bt} value={bt}>{t(`businessTypes.${bt}`)}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label={t('goal')}
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                fullWidth
                            >
                                {GOALS.map((g) => (
                                    <MenuItem key={g} value={g}>{t(`goals.${g}`)}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            label={t('topicLabel')}
                            placeholder={t('topicPlaceholder')}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            fullWidth
                            helperText={t('topicHelper')}
                        />

                        <PlatformSelector value={platform} onChange={setPlatform} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                            <TextField
                                select
                                label={t('contentType')}
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                fullWidth
                            >
                                {CONTENT_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>{t(`contentTypes.${type}`)}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                type="number"
                                label={t('numberOfIdeas')}
                                value={numberOfIdeas}
                                onChange={(e) => setNumberOfIdeas(parseInt(e.target.value) || 10)}
                                inputProps={{ min: 5, max: 20 }}
                                fullWidth
                            />
                        </Box>

                        <ToneSelector value={tone} onChange={setTone} />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <StudioGenerateButton
                                onClick={handleGenerate}
                                loading={loading}
                                label={t('generateAction')}
                                loadingLabel={tc('common.generating')}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Results Section */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            variant={!showHistory ? 'contained' : 'outlined'} 
                            onClick={() => setShowHistory(false)}
                            size="small"
                        >
                            {t('generatedLabel', { count: ideas.length })}
                        </Button>
                        <Button 
                            variant={showHistory ? 'contained' : 'outlined'} 
                            onClick={() => setShowHistory(true)}
                            size="small"
                        >
                            {t('historyLabel', { count: history.length })}
                        </Button>
                    </Box>

                    {!showHistory && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                                label={tc('all')}
                                onClick={() => setActiveFilter('all')}
                                color={activeFilter === 'all' ? 'primary' : 'default'}
                                sx={{ fontWeight: activeFilter === 'all' ? 'bold' : 'normal' }}
                            />
                            <Chip 
                                label={t('contentTypes.blog')}
                                onClick={() => setActiveFilter('blog')}
                                color={activeFilter === 'blog' ? 'primary' : 'default'}
                                sx={{ fontWeight: activeFilter === 'blog' ? 'bold' : 'normal' }}
                            />
                            <Chip 
                                label={t('contentTypes.social')}
                                onClick={() => setActiveFilter('social')}
                                color={activeFilter === 'social' ? 'primary' : 'default'}
                                sx={{ fontWeight: activeFilter === 'social' ? 'bold' : 'normal' }}
                            />
                            <Chip 
                                label={t('contentTypes.video')}
                                onClick={() => setActiveFilter('video')}
                                color={activeFilter === 'video' ? 'primary' : 'default'}
                                sx={{ fontWeight: activeFilter === 'video' ? 'bold' : 'normal' }}
                            />
                        </Box>
                    )}
                </Box>

                {!showHistory ? (
                    <>
                        {filteredIdeas.length === 0 && !loading && (
                            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                                    <i className="tabler-bulb" style={{ fontSize: 48 }} />
                                </Box>
                                <Typography>{t('emptyState')}</Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {filteredIdeas.map((idea: any, idx: number) => (
                                <IdeaCard
                                    key={idx}
                                    idea={idea}
                                    onUse={() => handleSaveDraft(idea)}
                                    onCopy={() => handleCopy(`${idea.title}\n\n${idea.description}`)}
                                />
                            ))}
                        </Box>
                    </>
                ) : (
                    <>
                        {history.length === 0 ? (
                            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                <i className="tabler-clock" style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }} />
                                <Typography>{t('historyEmpty')}</Typography>
                            </Box>
                        ) : (
                            <>
                                {['Today', 'Yesterday', 'This Week', 'Older'].map(categoryKey => (
                                    groupedHistory[categoryKey] && groupedHistory[categoryKey].length > 0 && (
                                        <Box key={categoryKey} sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                                                {tc(`dates.${categoryKey.toLowerCase().replace(' ', '') === 'thisweek' ? 'thisWeek' : categoryKey.toLowerCase()}`)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {groupedHistory[categoryKey].map((idea: any) => (
                                                    <IdeaCard
                                                        key={idea.id}
                                                        idea={idea}
                                                        onUse={() => handleSaveDraft(idea)}
                                                        onCopy={() => handleCopy(`${idea.title}\n\n${idea.description}`)}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )
                                ))}

                                {/* Load More Button */}
                                {history.length > 0 && hasMoreHistory && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <Button 
                                            variant="outlined" 
                                            onClick={loadMoreHistory}
                                            disabled={loadingHistory}
                                            startIcon={loadingHistory ? <CircularProgress size={16} /> : <i className="tabler-chevron-down" />}
                                        >
                                            {loadingHistory ? tc('common.loading') : tc('common.loadMore')}
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                )}
            </Box>
        </Box>
    )
}
