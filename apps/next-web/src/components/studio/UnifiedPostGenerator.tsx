'use client'

import React, { useState } from 'react'

import { Box, Card, CardContent, Grid, TextField, MenuItem, Typography, Button } from '@mui/material'
import { keyframes } from '@mui/material/styles'

import { SystemMessageCode } from '@platform/contracts'

import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'

import PlatformSelector from './selectors/PlatformSelector'
import ToneSelector from './selectors/ToneSelector'
import UnifiedResults from './unified/UnifiedResults'

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const GOALS = [
    'engagement',
    'awareness',
    'sales',
    'education',
]

const LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Arabic'
]

const LENGTHS = [
    'short',
    'medium',
    'long'
]

const TEMPLATES = [
    { key: 'launch', icon: 'tabler-rocket' },
    { key: 'behindScenes', icon: 'tabler-camera' },
    { key: 'educationalTips', icon: 'tabler-school' },
]

interface UnifiedPostGeneratorProps {
    initialDate?: string | null
}

export default function UnifiedPostGenerator({ initialDate }: UnifiedPostGeneratorProps) {
    const { notify } = useSystemMessages()
    const t = useTranslations('studio')
    const tl = useTranslations('common')
    const [loading, setLoading] = useState(false)
    
    // Inputs
    const [platform, setPlatform] = useState('Instagram')
    const [topic, setTopic] = useState('')
    const [tone, setTone] = useState('professional')
    const [goal, setGoal] = useState('engagement')
    const [audience, setAudience] = useState('')
    const [language, setLanguage] = useState('English')
    const [length, setLength] = useState('medium')

    // Results
    const [result, setResult] = useState<any>(null)

    const handleGenerate = async () => {
        if (!topic) {
            notify(SystemMessageCode.VALIDATION_ERROR)
            
return
        }

        setLoading(true)
        setResult(null)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/complete-post`, {
                platform,
                topic,
                tone,
                goal,
                audience,
                language,
                length
            })

            setResult(response.data)
            notify(SystemMessageCode.SUCCESS)
        } catch (error) {
            console.error(error)
            notify(SystemMessageCode.GENERIC_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const handleUseTemplate = (templateName: string) => {
        setTopic(`Create a ${templateName} post...`)
    }

    if (result) {
        return (
            <Box>
                <Button 
                    startIcon={<i className="tabler-arrow-left" />} 
                    onClick={() => setResult(null)} 
                    sx={{ mb: 3 }}
                >
                    {t('magic.backToStudio')}
                </Button>
                <UnifiedResults data={result} initialDate={initialDate} />
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    {t('magic.heroTitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('magic.heroSubtitle')}
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column: Inputs */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                                <Box sx={{ 
                                    p: 1.5, 
                                    borderRadius: 2, 
                                    background: 'linear-gradient(45deg, #9C27B0, #E91E63)', 
                                    color: 'white',
                                    display: 'flex',
                                    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
                                }}>
                                    <i className="tabler-sparkles" style={{ fontSize: 24 }} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">{t('magic.question')}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                
                                <PlatformSelector value={platform} onChange={setPlatform} />

                                <Box>
                                    <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">{t('magic.topicLabel')}</Typography>
                                    <TextField
                                        placeholder={t('magic.topicPlaceholder')}
                                        multiline
                                        rows={3}
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': { 
                                                bgcolor: 'background.default',
                                                borderRadius: 2
                                            } 
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">{t('magic.audienceLabel')}</Typography>
                                        <TextField
                                            placeholder={t('magic.audiencePlaceholder')}
                                            value={audience}
                                            onChange={(e) => setAudience(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">{t('magic.goalLabel')}</Typography>
                                        <TextField
                                            select
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            {GOALS.map(g => (
                                                <MenuItem key={g} value={g}>{t(`magic.goals.${g}`)}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>

                                <ToneSelector value={tone} onChange={setTone} />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">{t('magic.languageLabel')}</Typography>
                                        <TextField
                                            select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            {LANGUAGES.map(l => (
                                                <MenuItem key={l} value={l}>{tl(`language.${l.toLowerCase()}`)}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">{t('magic.lengthLabel')}</Typography>
                                        <TextField
                                            select
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            {LENGTHS.map(l => (
                                                <MenuItem key={l} value={l}>{t(`magic.lengths.${l}`)}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 2,
                                        borderRadius: 2,
                                        background: 'linear-gradient(90deg, #9C27B0, #7B1FA2)',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        boxShadow: '0 8px 20px -4px rgba(156, 39, 176, 0.5)',
                                        '&:hover': {
                                            background: 'linear-gradient(90deg, #7B1FA2, #9C27B0)',
                                            boxShadow: '0 12px 24px -6px rgba(156, 39, 176, 0.6)',
                                        }
                                    }}
                                    startIcon={loading ? <i className="tabler-loader-2 tabler-spin" /> : <i className="tabler-wand" />}
                                >
                                    {loading ? t('magic.loading') : t('magic.submitButton')}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column: Visuals & Templates */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                        
                        {/* 1. AI Brain Card */}
                        <Card variant="outlined" sx={{ 
                            borderRadius: 3, 
                            p: 4, 
                            textAlign: 'center', 
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2A2A3C' : 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative', 
                            overflow: 'hidden' 
                        }}>
                            <Box sx={{ 
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                background: (theme) => theme.palette.mode === 'dark' 
                                    ? 'radial-gradient(circle at top right, rgba(156, 39, 176, 0.1), transparent 60%)'
                                    : 'radial-gradient(circle at top right, rgba(156, 39, 176, 0.05), transparent 60%)'
                            }} />

                            <Box sx={{ 
                                width: 100, height: 100, mx: 'auto', mb: 3,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #E040FB, #7C4DFF)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 12px 30px rgba(124, 77, 255, 0.4)',
                                animation: `${float} 3s ease-in-out infinite`
                            }}>
                                <i className="tabler-brain" style={{ fontSize: 56, color: 'white' }} />
                            </Box>

                            <Typography variant="h5" fontWeight="bold" gutterBottom>{t('magic.aiBrain')}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 300, mx: 'auto' }}>
                                {t('magic.aiBrainDesc')}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{t('magic.outputCount')}</Typography>
                                    <Typography variant="caption" color="text.secondary">{t('magic.outputs')}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{t('magic.generationTime')}</Typography>
                                    <Typography variant="caption" color="text.secondary">{t('magic.generation')}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{t('magic.accuracyRate')}</Typography>
                                    <Typography variant="caption" color="text.secondary">{t('magic.accuracy')}</Typography>
                                </Box>
                            </Box>
                        </Card>

                        {/* 2. Ready to Create Magic Card */}
                        <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                            <Box sx={{ mb: 2 }}>
                                <i className="tabler-rocket" style={{ fontSize: 48, color: '#90A4AE', opacity: 0.5 }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>{t('magic.readyTitle')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('magic.readyDesc')}
                            </Typography>
                        </Card>

                        {/* 3. Quick Start Templates */}
                        <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={2}>{t('magic.quickStart')}</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {TEMPLATES.map((tpl, i) => (
                                        <Box 
                                            key={i} 
                                            onClick={() => handleUseTemplate(t(`magic.templates.${tpl.key}.title`))}
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 2, 
                                                p: 1.5, 
                                                borderRadius: 2, 
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <Box sx={{ 
                                                p: 1, borderRadius: 1.5, bgcolor: 'action.hover', 
                                                color: 'text.secondary', display: 'flex' 
                                            }}>
                                                <i className={tpl.icon} style={{ fontSize: 20 }} />
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">{t(`magic.templates.${tpl.key}.title`)}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t(`magic.templates.${tpl.key}.subtitle`)}</Typography>
                                            </Box>
                                            <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 2 }}>{t('magic.use')}</Button>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
