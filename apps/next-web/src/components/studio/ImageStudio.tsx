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
import Slider from '@mui/material/Slider'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import { useTranslations } from 'next-intl'

import { SystemMessageCode } from '@platform/contracts'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { useBusinessId } from '@/hooks/useBusinessId'
import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import ArtStyleSelector from './images/ArtStyleSelector'
import PromptGenerator from './images/PromptGenerator'
import StudioGenerateButton from './shared/StudioGenerateButton'

const QUICK_PROMPTS = [
    'headshot',
    'mockup',
    'post',
    'header'
]

const ASPECT_RATIOS = [
    { value: '1:1', labelKey: 'square' },
    { value: '16:9', labelKey: 'landscape' },
    { value: '9:16', labelKey: 'portrait' },
    { value: '4:3', labelKey: 'standard' }
]

export default function ImageStudio() {
    const t = useTranslations('studio.images')
    const tc = useTranslations('common')
    const { notify } = useSystemMessages()
    const { businessId } = useBusinessId()
    const [loading, setLoading] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [style, setStyle] = useState('Photorealistic')
    const [quality, setQuality] = useState(100)
    const [creativity, setCreativity] = useState(75)
    const [aspectRatio, setAspectRatio] = useState('16:9')
    const [variations, setVariations] = useState(4)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [recentImages, setRecentImages] = useState<string[]>([])
    const [showPromptGenerator, setShowPromptGenerator] = useState(false)

    const handleQuickPrompt = (quickPrompt: string) => {
        setPrompt(quickPrompt)
    }

    const handleGenerate = async () => {
        if (!prompt) {
            notify(SystemMessageCode.VALIDATION_ERROR)
            
return
        }

        setLoading(true)
        setGeneratedImage(null)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/images`, { 
                prompt, 
                style,
                quality: quality === 100 ? 'high' : quality >= 50 ? 'medium' : 'low',
                aspectRatio,
                variations
            })

            const data = response.data

            if (data.urls && data.urls.length > 0) {
                setGeneratedImage(data.urls[0])
                setRecentImages(prev => [data.urls[0], ...prev].slice(0, 6))
                notify(SystemMessageCode.AI_IMAGE_GENERATED)
            }
        } catch (error) {
            console.error(error)
            notify(SystemMessageCode.GENERIC_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePrompt = async () => {
        if (!businessId || !prompt || !generatedImage) {
            notify(SystemMessageCode.GENERIC_ERROR)
            
return
        }

        try {
            await apiClient.post(`${SERVICES.brand.url}/${businessId}/image-prompts`, {
                businessId,
                prompt,
                style,
                aspectRatio,
                imageUrls: [generatedImage]
            })
            notify(SystemMessageCode.SAVE_SUCCESS)
        } catch (error) {
            console.error('Error saving prompt:', error)
            notify(SystemMessageCode.SAVE_FAILED)
        }
    }

    return (
        <Box>

            <Grid container spacing={4}>
                {/* Left Panel - Input */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Describe Your Image */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {t('inputTitle')}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setShowPromptGenerator(!showPromptGenerator)}
                                        startIcon={<i className="tabler-sparkles" />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {showPromptGenerator ? tc('common.close') : t('aiIdeas')}
                                    </Button>
                                </Box>

                                {/* AI Prompt Generator */}
                                <Collapse in={showPromptGenerator}>
                                    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <PromptGenerator 
                                                onSelectPrompt={(generatedPrompt) => {
                                                    setPrompt(generatedPrompt)
                                                    setShowPromptGenerator(false)
                                                }}
                                                currentStyle={style}
                                            />
                                        </CardContent>
                                    </Card>
                                </Collapse>

                                <TextField
                                    placeholder={t('promptPlaceholder')}
                                    multiline
                                    rows={4}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    fullWidth
                                    helperText={t('promptHelper')}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {QUICK_PROMPTS.map((qp) => (
                                        <Chip
                                            key={qp}
                                            label={`+ ${t(`quickPrompts.${qp}`)}`}
                                            onClick={() => handleQuickPrompt(t(`quickPrompts.${qp}`))}
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'primary.lightOpacity',
                                                color: 'primary.main',
                                                '&:hover': { bgcolor: 'primary.mainOpacity' }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Art Style */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <ArtStyleSelector selected={style} onChange={setStyle} />
                            </CardContent>
                        </Card>

                        {/* Advanced Settings */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    {t('advancedSettings')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">{t('qualityLabel')}</Typography>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                {quality === 100 ? t('qualityHigh') : quality >= 50 ? t('qualityMedium') : t('qualityLow')}
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={quality}
                                            onChange={(_, val) => setQuality(val as number)}
                                            min={0}
                                            max={100}
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">{t('creativityLabel')}</Typography>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">{creativity}%</Typography>
                                        </Box>
                                        <Slider
                                            value={creativity}
                                            onChange={(_, val) => setCreativity(val as number)}
                                            min={0}
                                            max={100}
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">{t('aspectRatioLabel')}</Typography>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                {t(`aspectRatios.${ASPECT_RATIOS.find(ar => ar.value === aspectRatio)?.labelKey}`)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {ASPECT_RATIOS.map((ar) => (
                                                <Chip
                                                    key={ar.value}
                                                    label={ar.value}
                                                    onClick={() => setAspectRatio(ar.value)}
                                                    variant={aspectRatio === ar.value ? 'filled' : 'outlined'}
                                                    color={aspectRatio === ar.value ? 'primary' : 'default'}
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">{t('variationsLabel')}</Typography>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">{t('imagesCount', { count: variations })}</Typography>
                                        </Box>
                                        <Slider
                                            value={variations}
                                            onChange={(_, val) => setVariations(val as number)}
                                            min={1}
                                            max={8}
                                            step={1}
                                            marks
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Generate Button */}
                        <StudioGenerateButton
                            onClick={handleGenerate}
                            loading={loading}
                            label={t('submitButton')}
                            loadingLabel={tc('common.generating')}
                            fullWidth
                            sx={{ 
                                fontSize: '1rem',
                            }}
                        />
                    </Box>
                </Grid>

                {/* Right Panel - Preview & Recent */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Preview */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    {t('previewTitle')}
                                </Typography>
                                {!generatedImage && !loading && (
                                    <Box sx={{ 
                                        aspectRatio: '16/9', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'action.hover',
                                        borderRadius: 2,
                                        flexDirection: 'column',
                                        gap: 2
                                    }}>
                                        <i className="tabler-photo" style={{ fontSize: 48, opacity: 0.3 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {t('emptyState')}
                                        </Typography>
                                    </Box>
                                )}
                                {loading && (
                                    <Box sx={{ 
                                        aspectRatio: '16/9', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'action.hover',
                                        borderRadius: 2
                                    }}>
                                        <CircularProgress />
                                    </Box>
                                )}
                                {generatedImage && (
                                    <Box>
                                        <Box
                                            component="img"
                                            src={generatedImage}
                                            alt="Generated"
                                            sx={{ width: '100%', borderRadius: 2, display: 'block' }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <IconButton sx={{ bgcolor: 'action.hover' }}>
                                                <i className="tabler-download" />
                                            </IconButton>
                                            <IconButton sx={{ bgcolor: 'action.hover' }}>
                                                <i className="tabler-edit" />
                                            </IconButton>
                                            <Button
                                                variant="outlined"
                                                onClick={handleSavePrompt}
                                                sx={{ borderRadius: 2, mr: 1 }}
                                                startIcon={<i className="tabler-device-floppy" />}
                                            >
                                                {t('savePrompt')}
                                            </Button>
                                            <Button variant="contained" fullWidth sx={{ borderRadius: 2 }}>
                                                <i className="tabler-check" style={{ marginRight: 8 }} />
                                                {t('approve')}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Generations */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    {t('recentTitle')}
                                </Typography>
                                {recentImages.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        {t('recentEmpty')}
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                        {recentImages.map((img, idx) => (
                                            <Box
                                                key={idx}
                                                component="img"
                                                src={img}
                                                alt={`Recent ${idx + 1}`}
                                                sx={{ 
                                                    width: '100%', 
                                                    aspectRatio: '1', 
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.8 }
                                                }}
                                                onClick={() => setGeneratedImage(img)}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
