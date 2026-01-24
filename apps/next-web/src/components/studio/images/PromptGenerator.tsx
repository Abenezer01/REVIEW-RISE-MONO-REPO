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

import { toast } from 'react-toastify'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import StudioGenerateButton from '../shared/StudioGenerateButton'

const CATEGORIES = [
    { value: 'portrait', label: '👤 Portrait', icon: 'tabler-user' },
    { value: 'landscape', label: '🏞️ Landscape', icon: 'tabler-mountain' },
    { value: 'product', label: '📦 Product', icon: 'tabler-box' },
    { value: 'abstract', label: '🎨 Abstract', icon: 'tabler-palette' },
    { value: 'architecture', label: '🏛️ Architecture', icon: 'tabler-building' },
    { value: 'food', label: '🍕 Food', icon: 'tabler-pizza' }
]

const MOODS = [
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'moody', label: 'Moody' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'dramatic', label: 'Dramatic' },
    { value: 'calm', label: 'Calm' },
    { value: 'energetic', label: 'Energetic' }
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
    const [topic, setTopic] = useState('')
    const [category, setCategory] = useState<string>('')
    const [mood, setMood] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [promptIdeas, setPromptIdeas] = useState<PromptIdea[]>([])

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic or idea')
            
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
                toast.success(`Generated ${data.prompts.length} prompt ideas!`)
            } else {
                toast.error('No prompts generated')
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate prompt ideas')
        } finally {
            setLoading(false)
        }
    }

    const handleUsePrompt = (prompt: string) => {
        onSelectPrompt(prompt)
        toast.success('Prompt applied!')
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Topic Input */}
            <Box>
                <Typography variant="body2" fontWeight="medium" mb={1}>
                    What do you want to create?
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
                    Category (Optional)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {CATEGORIES.map((cat) => (
                        <Chip
                            key={cat.value}
                            label={cat.label}
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
                    Mood (Optional)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {MOODS.map((m) => (
                        <Chip
                            key={m.value}
                            label={m.label}
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
                label="✨ Generate Prompt Ideas"
                loadingLabel="Generating Ideas..."
                fullWidth
            />

            {/* Generated Prompts */}
            {promptIdeas.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold" mb={2} color="text.secondary">
                        💡 {promptIdeas.length} Prompt Ideas
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
