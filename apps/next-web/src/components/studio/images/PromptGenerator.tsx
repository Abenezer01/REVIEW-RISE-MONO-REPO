'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import StudioGenerateButton from '../shared/StudioGenerateButton'

const CATEGORIES = [
    { value: 'portrait', key: 'portrait', icon: '👤' },
    { value: 'landscape', key: 'landscape', icon: '🏞️' },
    { value: 'product', key: 'product', icon: '📦' },
    { value: 'abstract', key: 'abstract', icon: '🎨' },
    { value: 'architecture', key: 'architecture', icon: '🏛️' },
    { value: 'food', key: 'food', icon: '🍕' }
]

const MOODS = [
    { value: 'vibrant', key: 'vibrant' },
    { value: 'moody', key: 'moody' },
    { value: 'minimalist', key: 'minimalist' },
    { value: 'dramatic', key: 'dramatic' },
    { value: 'calm', key: 'calm' },
    { value: 'energetic', key: 'energetic' }
]

interface PromptIdea {
    title: string
    prompt: string
    tags: string[]
}

interface PromptGeneratorProps {
    onSelectPrompt: (prompt: string) => void
    currentStyle?: string
}

export default function PromptGenerator({ onSelectPrompt, currentStyle }: PromptGeneratorProps) {
    const t = useTranslations('studio')
    const { notify } = useSystemMessages()
    const [topic, setTopic] = useState('')
    const [category, setCategory] = useState<string>('')
    const [mood, setMood] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [promptIdeas, setPromptIdeas] = useState<PromptIdea[]>([])

    const handleGenerate = async () => {
        if (!topic.trim()) {
            notify({
                messageCode: 'studio.promptTopicPlaceholder' as any,
                severity: 'ERROR'
            })
            
return
        }

        setLoading(true)
        setPromptIdeas([])

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/prompts/generate`, {
                topic,
                category: category || undefined,
                mood: mood || undefined,
                style: currentStyle || undefined
            })

            const data = response.data

            if (data.prompts && Array.isArray(data.prompts)) {
                setPromptIdeas(data.prompts)
                notify({
                    messageCode: 'studio.promptGenerationSuccess' as any,
                    severity: 'SUCCESS'
                })
            } else {
                notify({
                    messageCode: 'studio.promptGenerationEmpty' as any,
                    severity: 'ERROR'
                })
            }
        } catch (error) {
            console.error(error)
            notify({
                messageCode: 'studio.promptGenerationError' as any,
                severity: 'ERROR'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUsePrompt = (prompt: string) => {
        onSelectPrompt(prompt)
        notify({
            messageCode: 'studio.promptApplied' as any,
            severity: 'SUCCESS'
        })
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Topic Input */}
            <Box>
                <Typography variant="body2" fontWeight="medium" mb={1}>
                    {t('images.promptPlaceholder')}
                </Typography>
                <TextField
                    placeholder="e.g., A coffee shop in the morning, A futuristic car, A serene beach..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    fullWidth
                    size="small"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                            handleGenerate()
                        }
                    }}
                />
            </Box>

            {/* Category Selection */}
            <Box>
                <Typography variant="body2" fontWeight="medium" mb={1}>
                    {t('images.categoryOptional')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {CATEGORIES.map((cat) => (
                        <Chip
                            key={cat.value}
                            label={`${cat.icon} ${t(`images.categories.${cat.key}`)}`}
                            onClick={() => setCategory(category === cat.value ? '' : cat.value)}
                            variant={category === cat.value ? 'filled' : 'outlined'}
                            color={category === cat.value ? 'primary' : 'default'}
                            size="small"
                        />
                    ))}
                </Box>
            </Box>

            {/* Mood Selection */}
            <Box>
                <Typography variant="body2" fontWeight="medium" mb={1}>
                    {t('images.moodOptional')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {MOODS.map((m) => (
                        <Chip
                            key={m.value}
                            label={t(`images.moods.${m.key}`)}
                            onClick={() => setMood(mood === m.value ? '' : m.value)}
                            variant={mood === m.value ? 'filled' : 'outlined'}
                            color={mood === m.value ? 'secondary' : 'default'}
                            size="small"
                        />
                    ))}
                </Box>
            </Box>

            {/* Generate Button */}
            <StudioGenerateButton
                onClick={handleGenerate}
                loading={loading}
                disabled={!topic.trim()}
                label={t('images.generatePromptIdeas')}
                loadingLabel={t('images.generatingIdeas')}
                fullWidth
            />

            {/* Generated Prompts */}
            {promptIdeas.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold" mb={2} color="text.secondary">
                        💡 {promptIdeas.length} {t('images.promptIdeas')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {promptIdeas.map((idea, index) => (
                            <Card 
                                key={index} 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: 1
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                            {idea.title}
                                        </Typography>
                                        <Tooltip title="Use this prompt">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleUsePrompt(idea.prompt)}
                                                sx={{ 
                                                    bgcolor: 'primary.lightOpacity',
                                                    '&:hover': { bgcolor: 'primary.mainOpacity' }
                                                }}
                                            >
                                                <i className="tabler-check" style={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                        {idea.prompt}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {idea.tags?.map((tag, tagIndex) => (
                                            <Chip 
                                                key={tagIndex} 
                                                label={tag} 
                                                size="small" 
                                                sx={{ 
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: 'action.hover'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    )
}
