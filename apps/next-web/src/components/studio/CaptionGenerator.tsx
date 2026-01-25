'use client'

import React, { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import { toast } from 'react-toastify'
import { useTranslations } from 'next-intl'

import { useBusinessId } from '@/hooks/useBusinessId'
import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import StudioGenerateButton from './shared/StudioGenerateButton'

import PlatformSelector from './selectors/PlatformSelector'
import ToneSelector from './selectors/ToneSelector'
import ResultCard from './captions/ResultCard'
import ProTips from './captions/ProTips'

const CTA_OPTIONS = ['Shop Now', 'Learn More', 'Sign Up', 'Get Started', 'No CTA']

export default function CaptionGenerator() {
  const t = useTranslations('studio.captions')
  const [loading, setLoading] = useState(false)
  
  // State
  const [platform, setPlatform] = useState('Instagram')
  const [productDescription, setProductDescription] = useState('')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('friendly')
  const [cta, setCta] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [history, setHistory] = useState<any[]>([]) // Caption draft history
  const [showHistory, setShowHistory] = useState(false)
  const [historyOffset, setHistoryOffset] = useState(0)
  const [hasMoreHistory, setHasMoreHistory] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const { businessId } = useBusinessId()

  const handleGenerate = async () => {
    if (!productDescription) {
        toast.error('Please enter a product description')
        
return
    }

    setLoading(true)

    try {
        // Construct the prompt context from new inputs
        const fullPromptDescription = `Product: ${productDescription}\nContext: ${context}\nCTA: ${cta}`

        const response = await apiClient.post(`${SERVICES.ai.url}/studio/captions`, {
            platform, 
            description: fullPromptDescription, 
            tone 
        })

        const data = response.data
        const generatedCaptions = data.captions || []

        setResults(generatedCaptions)
        
        // Auto-save ALL generated captions to CaptionDraft table for history
        if (businessId && generatedCaptions.length > 0) {
            try {
                await apiClient.post(`${SERVICES.brand.url}/${businessId}/caption-drafts`, {
                    businessId,
                    platform,
                    tone,
                    captions: generatedCaptions
                })

                // Silent success - this is background logging
            } catch (error) {
                console.error('Failed to save caption history:', error)

                // Don't show error to user - this is just logging
            }
        }
        
        toast.success('Captions generated!')
    } catch (error) {
        console.error(error)
        toast.error('Failed to generate captions')
    } finally {
        setLoading(false)
    }
  }

  const handleSaveCaption = async (text: string) => {
    try {
        await apiClient.post(`${SERVICES.social.url}/posts`, {
            businessId,
            content: text,
            platform,
            status: 'draft',
            mediaUrls: []
        })
        toast.success('Caption saved to drafts!')
    } catch (error) {
        console.error(error)
        toast.error('Failed to save caption')
    }
  }

  // Fetch caption history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!businessId) return
      
      setLoadingHistory(true)

      try {
        const response = await apiClient.get(`${SERVICES.brand.url}/${businessId}/caption-drafts?limit=10&offset=0`)
        const drafts = response.data.drafts || []

        setHistory(drafts)
        setHasMoreHistory(drafts.length === 10)
        setHistoryOffset(10)
      } catch (error) {
        console.error('Failed to fetch caption history:', error)
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [businessId])

  // Load more history
  const loadMoreHistory = async () => {
    if (!businessId || loadingHistory) return
    
    setLoadingHistory(true)

    try {
      const response = await apiClient.get(`${SERVICES.brand.url}/${businessId}/caption-drafts?limit=10&offset=${historyOffset}`)
      const drafts = response.data.drafts || []

      setHistory(prev => [...prev, ...drafts])
      setHasMoreHistory(drafts.length === 10)
      setHistoryOffset(prev => prev + 10)
    } catch (error) {
      console.error('Failed to load more history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

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

  // Group history by date categories
  const groupedHistory = history.reduce((acc, draft) => {
    const category = getCategoryFromDate(new Date(draft.createdAt))

    if (!acc[category]) acc[category] = []
    acc[category].push(draft)
    
return acc
  }, {} as Record<string, any[]>)

  return (
    <Grid container spacing={4}>
        {/* Left Column: Inputs */}
        <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                
                {/* 1. Caption Details */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>Caption Details</Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <PlatformSelector value={platform} onChange={setPlatform} />

                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1}>{t('productLabel')}</Typography>
                                <TextField
                                    placeholder="e.g., Eco-friendly water bottles for active lifestyles"
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1}>{t('contextLabel')}</Typography>
                                <TextField
                                    placeholder={t('contextPlaceholder')}
                                    multiline
                                    rows={3}
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* 2. Caption Style */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>Caption Style</Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <ToneSelector value={tone} onChange={setTone} />

                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1}>{t('ctaLabel')}</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                    {CTA_OPTIONS.map((option) => (
                                        <Chip 
                                            key={option} 
                                            label={option} 
                                            onClick={() => setCta(option)}
                                            variant={cta === option ? 'filled' : 'outlined'}
                                            color={cta === option ? 'primary' : 'default'}
                                            sx={{ borderRadius: 1, fontWeight: 'medium' }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* 3. Generate Action */}
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover', borderStyle: 'dashed' }}>
                    <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{t('readyTitle')}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('readySubtitle')}</Typography>
                        </Box>
                        <StudioGenerateButton
                            onClick={handleGenerate}
                            loading={loading}
                            label={t('submitButton')}
                            loadingLabel={t('loading')}
                        />
                    </CardContent>
                </Card>
            </Box>
        </Grid>
        
        {/* Right Column: Results & Tips */}
        <Grid size={{ xs: 12, md: 5 }}>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Toggle between Results and History */}
                <Box sx={{ display: 'flex', gap: 1, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                    <Button 
                        variant={!showHistory ? 'contained' : 'outlined'} 
                        onClick={() => setShowHistory(false)}
                        size="small"
                    >
                        Generated ({results.length})
                    </Button>
                    <Button 
                        variant={showHistory ? 'contained' : 'outlined'} 
                        onClick={() => setShowHistory(true)}
                        size="small"
                    >
                        History ({history.length})
                    </Button>
                </Box>
                {/* Conditional Content: Results or History */}
                {!showHistory ? (
                    <>
                        {/* Results Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" fontWeight="bold">Generated Captions</Typography>
                                {results.length > 0 && (
                                    <Typography variant="caption" color="text.secondary">{t('variations')}</Typography>
                                )}
                            </Box>
                            {results.length > 0 && (
                                 <Button startIcon={<i className="tabler-refresh" />} size="small" onClick={handleGenerate} disabled={loading}>
                                    {t('regenerate')}
                                 </Button>
                            )}
                        </Box>

                        {/* Results List */}
                        {results.length === 0 && !loading && (
                            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                 <i className="tabler-wand" style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }} />
                                 <Typography>{t('emptyState')}</Typography>
                            </Box>
                        )}

                         {results.map((caption, idx) => (
                            <ResultCard key={idx} index={idx + 1} text={caption} onSave={handleSaveCaption} />
                        ))}

                        {/* Pro Tips */}
                        <ProTips />
                    </>
                ) : (
                    <>
                        {/* History Header */}
                        <Typography variant="h6" fontWeight="bold">Generation History</Typography>

                        {/* History List */}
                        {history.length === 0 ? (
                            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                <i className="tabler-clock" style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }} />
                                <Typography>No generation history yet</Typography>
                            </Box>
                        ) : (
                            <>
                                {['Today', 'Yesterday', 'This Week', 'Older'].map(category => (
                                    groupedHistory[category] && groupedHistory[category].length > 0 && (
                                        <Box key={category}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: 'text.secondary' }}>
                                                {category}
                                            </Typography>
                                            {groupedHistory[category].map((draft: any) => (
                                                <Card key={draft.id} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                                                    <CardContent sx={{ p: 2 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                            <Box>
                                                                <Chip label={draft.platform} size="small" sx={{ mr: 1 }} />
                                                                <Chip label={draft.tone} size="small" variant="outlined" />
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                                                            {draft.content}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    )
                                ))}
                            </>
                        )}
                        
                        {/* Load More Button */}
                        {history.length > 0 && hasMoreHistory && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={loadMoreHistory}
                                    disabled={loadingHistory}
                                    startIcon={loadingHistory ? <CircularProgress size={16} /> : <i className="tabler-chevron-down" />}
                                >
                                    {loadingHistory ? 'Loading...' : 'Load More'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}

             </Box>
        </Grid>
    </Grid>
  )
}
