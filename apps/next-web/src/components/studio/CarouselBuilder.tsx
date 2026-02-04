'use client'

import React, { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { useBusinessId } from '@/hooks/useBusinessId'
import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import LayoutTemplateSelector from './carousel/LayoutTemplateSelector'
import ColorSchemePicker from './carousel/ColorSchemePicker'
import StudioGenerateButton from './shared/StudioGenerateButton'
import ToneSelector from './selectors/ToneSelector'
import PlatformSelector from './selectors/PlatformSelector'

export default function CarouselBuilder() {
    const t = useTranslations('studio.carousels')
    const tc = useTranslations('common')
    const { notify } = useSystemMessages()
    const { businessId } = useBusinessId()
    const [loading, setLoading] = useState(false)
    const [topic, setTopic] = useState('')
    const [additionalContext, setAdditionalContext] = useState('')
    const [slideCount, setSlideCount] = useState(7)
    const [layoutTemplate, setLayoutTemplate] = useState('modern')
    const [colorScheme, setColorScheme] = useState('orange')
    const [tone, setTone] = useState('professional')
    const [platform, setPlatform] = useState('Instagram')
    const [autoGenerateImages, setAutoGenerateImages] = useState(true)
    const [includeStatistics, setIncludeStatistics] = useState(true)
    const [addCallToAction, setAddCallToAction] = useState(false)
    const [slides, setSlides] = useState<any[]>([])
    const [currentSlide, setCurrentSlide] = useState(0)

    // History State
    const [viewMode, setViewMode] = useState<'generator' | 'history'>('generator')
    const [history, setHistory] = useState<any[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const fetchHistory = useCallback(async () => {
        if (!businessId) return
        setHistoryLoading(true)

        try {
            const response = await apiClient.get(`${SERVICES.brand.url}/${businessId}/carousel-drafts`)

            setHistory(response.data.drafts || [])
        } catch (error) {
            console.error('Failed to fetch carousel history:', error)
        } finally {
            setHistoryLoading(false)
        }
    }, [businessId])

    useEffect(() => {
        if (viewMode === 'history') {
            fetchHistory()
        }
    }, [viewMode, fetchHistory])

    const loadDraft = (draft: any) => {
        setTopic(draft.topic || '')
        setSlides(draft.slides || [])
        setViewMode('generator')
        notify({
            messageCode: 'studio.draftLoaded',
            severity: 'INFO'
        })
    }

    const handleGenerate = async () => {
        if (!topic) {
            notify({
                messageCode: 'studio.topicError' as any,
                severity: 'ERROR'
            })

            return
        }

        setLoading(true)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/carousels`, {
                topic,
                additionalContext,
                slideCount,
                tone,
                layoutTemplate,
                colorScheme,
                autoGenerateImages,
                includeStatistics,
                addCallToAction
            })

            const data = response.data

            setSlides(data.slides || [])
            setCurrentSlide(0)
            notify({
                messageCode: 'studio.slidesGenerated',
                severity: 'SUCCESS'
            })
        } catch (error) {
            console.error(error)
            notify({
                messageCode: 'studio.generateError',
                severity: 'ERROR'
            })
        } finally {
            setLoading(false)
        }
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const handleSaveDraft = async () => {
        if (!businessId || !topic || slides.length === 0) {
            notify({
                messageCode: 'studio.noCarouselToSave' as any,
                severity: 'ERROR'
            })

            return
        }

        try {
            await apiClient.post(`${SERVICES.brand.url}/${businessId}/carousel-drafts`, {
                businessId,
                topic,
                slides: slides.map(slide => ({
                    title: slide.title,
                    content: slide.text || slide.content,
                    imagePrompt: slide.visualDescription
                }))
            })
            notify({
                messageCode: 'studio.saveDraftSuccess' as any,
                severity: 'SUCCESS'
            })
        } catch (error) {
            console.error('Error saving carousel draft:', error)
            notify({
                messageCode: 'studio.saveDraftError' as any,
                severity: 'ERROR'
            })
        }
    }

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Button
                    onClick={() => setViewMode('generator')}
                    sx={{
                        borderBottom: viewMode === 'generator' ? 2 : 0,
                        borderColor: 'primary.main',
                        borderRadius: 0,
                        mr: 2,
                        pb: 1,
                        color: viewMode === 'generator' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none', px: 2
                    }}
                >
                    {t('tabGenerator')}
                </Button>
                <Button
                    onClick={() => setViewMode('history')}
                    sx={{
                        borderBottom: viewMode === 'history' ? 2 : 0,
                        borderColor: 'primary.main',
                        borderRadius: 0,
                        pb: 1,
                        color: viewMode === 'history' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none', px: 2
                    }}
                >
                    {t('tabHistory', { count: history.length })}
                </Button>
            </Box>

            {viewMode === 'generator' ? (
                <Grid container spacing={4}>
                    {/* Left Panel - Input & Settings */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Carousel Content */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        {t('contentTitle')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextField
                                            label={t('topicLabel')}
                                            placeholder={t('topicPlaceholder')}
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            fullWidth
                                            size="small"
                                            helperText={t('topicHelper')}
                                        />

                                        <TextField
                                            label={t('detailsLabel')}
                                            placeholder={t('detailsPlaceholder')}
                                            multiline
                                            rows={2}
                                            value={additionalContext}
                                            onChange={(e) => setAdditionalContext(e.target.value)}
                                            fullWidth
                                            size="small"
                                        />

                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {t('slideCountLabel')}
                                                </Typography>
                                                <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                    {slideCount}
                                                </Typography>
                                            </Box>
                                            <Slider
                                                value={slideCount}
                                                onChange={(_, val) => setSlideCount(val as number)}
                                                min={3}
                                                max={10}
                                                marks
                                                sx={{ color: 'primary.main' }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {t('recommendedSlides')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Style & Tone */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        {t('styleToneTitle')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                        <PlatformSelector
                                            value={platform}
                                            onChange={setPlatform}
                                        />
                                        <ToneSelector
                                            value={tone}
                                            onChange={setTone}
                                        />
                                        <LayoutTemplateSelector
                                            selected={layoutTemplate}
                                            onChange={setLayoutTemplate}
                                        />
                                        <ColorSchemePicker
                                            selected={colorScheme}
                                            onChange={setColorScheme}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* AI Settings */}
                            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <i className="tabler-sparkles" style={{ fontSize: 20, color: '#9C27B0' }} />
                                        <Typography variant="h6" fontWeight="bold">
                                            {t('aiSettingsTitle')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={autoGenerateImages}
                                                    onChange={(e) => setAutoGenerateImages(e.target.checked)}
                                                    color="secondary"
                                                />
                                            }
                                            label={t('autoImages')}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={includeStatistics}
                                                    onChange={(e) => setIncludeStatistics(e.target.checked)}
                                                    color="secondary"
                                                />
                                            }
                                            label={t('includeStats')}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={addCallToAction}
                                                    onChange={(e) => setAddCallToAction(e.target.checked)}
                                                    color="secondary"
                                                />
                                            }
                                            label={t('addCTA')}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Generation Cost & Button */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('generationCost')}
                                    </Typography>
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        {t('creditsCount', { count: 15 })}
                                    </Typography>
                                </Box>
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
                        </Box>
                    </Grid>

                    {/* Right Panel - Preview & Customization */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Live Preview */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        {t('livePreview')}
                                    </Typography>
                                    {slides.length === 0 ? (
                                        <Box sx={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: colorScheme === 'orange' ? '#FF8C42' :
                                                colorScheme === 'blue' ? '#4A90E2' :
                                                    colorScheme === 'purple' ? '#9C27B0' :
                                                        colorScheme === 'green' ? '#4CAF50' : '#E91E63',
                                            borderRadius: 2,
                                            flexDirection: 'column',
                                            gap: 2,
                                            color: 'white'
                                        }}>
                                            <Box
                                                sx={{
                                                    animation: 'float 3s ease-in-out infinite',
                                                    '@keyframes float': {
                                                        '0%, 100%': { transform: 'translateY(0px)' },
                                                        '50%': { transform: 'translateY(-10px)' }
                                                    }
                                                }}
                                            >
                                                <i
                                                    className="tabler-photo"
                                                    style={{
                                                        fontSize: 64,
                                                        opacity: 0.8
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body1" fontWeight="medium">
                                                {t('previewEmpty')}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Box sx={{
                                                aspectRatio: '1',
                                                bgcolor: colorScheme === 'orange' ? '#FF8C42' :
                                                    colorScheme === 'blue' ? '#4A90E2' :
                                                        colorScheme === 'purple' ? '#9C27B0' :
                                                            colorScheme === 'green' ? '#4CAF50' : '#E91E63',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                p: 4,
                                                position: 'relative'
                                            }}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="h5" fontWeight="bold" mb={2}>
                                                        {slides[currentSlide]?.title || `Slide ${currentSlide + 1}`}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {slides[currentSlide]?.content || slides[currentSlide]?.text}
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    onClick={prevSlide}
                                                    sx={{
                                                        position: 'absolute',
                                                        left: 8,
                                                        bgcolor: 'rgba(0,0,0,0.3)',
                                                        color: 'white',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            transform: 'translateX(-4px) scale(1.1)',
                                                            boxShadow: 3
                                                        },
                                                        '&:active': {
                                                            transform: 'translateX(-2px) scale(1.05)'
                                                        }
                                                    }}
                                                >
                                                    <i className="tabler-chevron-left" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={nextSlide}
                                                    sx={{
                                                        position: 'absolute',
                                                        right: 8,
                                                        bgcolor: 'rgba(0,0,0,0.3)',
                                                        color: 'white',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            transform: 'translateX(4px) scale(1.1)',
                                                            boxShadow: 3
                                                        },
                                                        '&:active': {
                                                            transform: 'translateX(2px) scale(1.05)'
                                                        }
                                                    }}
                                                >
                                                    <i className="tabler-chevron-right" />
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                                                {slides.map((_, idx) => (
                                                    <Box
                                                        key={idx}
                                                        onClick={() => setCurrentSlide(idx)}
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: idx === currentSlide ? 'primary.main' : 'action.disabled',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                transform: 'scale(1.3)',
                                                                bgcolor: idx === currentSlide ? 'primary.dark' : 'action.active'
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {slides.length > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveDraft}
                                                startIcon={<i className="tabler-device-floppy" />}
                                                sx={{
                                                    borderRadius: 2,
                                                    px: 3,
                                                    bgcolor: 'secondary.main',
                                                    '&:hover': { bgcolor: 'secondary.dark' }
                                                }}
                                            >
                                                {tc('common.save')}
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Customization */}
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        {t('customizationTitle')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">{t('editContent')}</Typography>
                                            <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                                {tc('common.edit')}
                                            </Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">{t('changeImages')}</Typography>
                                            <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                                {t('replace')}
                                            </Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">{t('adjustColors')}</Typography>
                                            <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                                {t('customize')}
                                            </Button>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">{t('reorderSlides')}</Typography>
                                            <Button size="small" variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#FF8C42' }}>
                                                {t('arrange')}
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            ) : (
                <Box>
                    {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : history.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                            <i className="tabler-history" style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }} />
                            <Typography color="text.secondary">{t('historyEmpty')}</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {history.map((draft: any) => (
                                <Grid key={draft.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Card variant="outlined" sx={{
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', borderColor: 'primary.main' }
                                    }} onClick={() => loadDraft(draft)}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(draft.createdAt).toLocaleDateString()}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <i className="tabler-slideshow" style={{ fontSize: 14, opacity: 0.6 }} />
                                                    <Typography variant="caption" fontWeight="bold">
                                                        {draft.slides?.length || 0}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                height: 48
                                            }}>
                                                {draft.topic}
                                            </Typography>
                                            <Button size="small" variant="outlined" fullWidth sx={{ mt: 2 }}>
                                                {t('loadDraft')}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}
        </Box>
    )
}
