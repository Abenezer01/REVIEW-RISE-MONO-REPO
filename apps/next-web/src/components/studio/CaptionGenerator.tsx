'use client'

import React, { useState } from 'react'

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
  const [tone, setTone] = useState('Friendly')
  const [cta, setCta] = useState('')
  const [results, setResults] = useState<string[]>([])

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

        setResults(data.captions || [])
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
                        <Button 
                            variant="contained" 
                            size="large" 
                            onClick={handleGenerate}
                            disabled={loading}
                            sx={{ 
                                bgcolor: '#9C27B0', 
                                '&:hover': { bgcolor: '#7B1FA2' },
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold'
                            }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <i className='tabler-sparkles' />}
                        >
                            {loading ? t('loading') : t('submitButton')}
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Grid>
        
        {/* Right Column: Results & Tips */}
        <Grid size={{ xs: 12, md: 5 }}>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
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

             </Box>
        </Grid>
    </Grid>
  )
}
