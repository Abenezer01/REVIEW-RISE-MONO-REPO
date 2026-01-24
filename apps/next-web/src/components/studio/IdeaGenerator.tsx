
'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import { toast } from 'react-toastify'


import { useBusinessId } from '@/hooks/useBusinessId'
import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import IdeaCard from './ideas/IdeaCard'

const BUSINESS_TYPES = [
    'E-commerce Store',
    'Local Business',
    'Consultant / Coach',
    'SaaS / Tech',
    'Content Creator',
    'Restaurant / Cafe',
    'Real Estate Agent'
]

const GOALS = [
    'Increase Brand Awareness',
    'Drive Website Traffic',
    'Generate Leads',
    'Boost Engagement',
    'Promote New Product',
    'Educate Audience'
]

const CONTENT_TYPES = ['Blog Post', 'Social Media', 'Video', 'Infographic']
const TONES = ['Professional', 'Casual', 'Tutorial', 'Storytelling']

type FilterTab = 'all' | 'blog' | 'social' | 'video'

export default function IdeaGenerator() {
    const { businessId } = useBusinessId()
    const [loading, setLoading] = useState(false)
    const [businessType, setBusinessType] = useState('Local Business')
    const [goal, setGoal] = useState('Boost Engagement')
    const [topic, setTopic] = useState('')
    const [contentType, setContentType] = useState('Blog Post')
    const [tone, setTone] = useState('Professional')
    const [numberOfIdeas, setNumberOfIdeas] = useState(10)
    const [results, setResults] = useState<any[]>([])
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

    const handleGenerate = async () => {
        setLoading(true)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/ideas`, { 
                businessType, 
                goal,
                topic,
                contentType,
                tone,
                numberOfIdeas
            })

            const data = response.data


            // Enhance ideas with mock engagement and reading time
            const enhancedIdeas = (data.ideas || []).map((idea: any, idx: number) => ({
                ...idea,
                engagement: ['high', 'medium', 'low'][idx % 3] as 'high' | 'medium' | 'low',
                readingTime: Math.floor(Math.random() * 10) + 3,
                category: CONTENT_TYPES[idx % CONTENT_TYPES.length],
                tone: TONES[idx % TONES.length]
            }))

            setResults(enhancedIdeas)
            toast.success(`${enhancedIdeas.length} ideas generated!`)
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate ideas')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDraft = async (idea: any) => {
        if (!businessId) {
            toast.error('Business context missing')
            
return
        }

        try {
            await apiClient.post(`${SERVICES.social.url}/posts`, {
                businessId,
                content: `${idea.title}\n\n${idea.description}`,
                platform: idea.platform || 'instagram',
                status: 'draft'
            })

            toast.success('Saved to drafts')
        } catch (error) {
            console.error(error)
            toast.error('Failed to save draft')
        }
    }

    const handleCopyIdea = (idea: any) => {
        navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`)
        toast.success('Copied to clipboard')
    }

    const filteredResults = results.filter(idea => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'blog') return idea.category?.toLowerCase().includes('blog')
        if (activeFilter === 'social') return idea.category?.toLowerCase().includes('social')
        if (activeFilter === 'video') return idea.category?.toLowerCase().includes('video')
        
return true
    })

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    AI Content Ideas Generator
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Generate unlimited content ideas powered by AI
                </Typography>
            </Box>

            {/* Input Section */}
            <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <i className="tabler-sparkles" style={{ fontSize: 20, color: '#9C27B0' }} />
                        <Typography variant="h6" fontWeight="bold">Generate New Ideas</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                select
                                label="Business Type"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                fullWidth
                            >
                                {BUSINESS_TYPES.map((bt) => (
                                    <MenuItem key={bt} value={bt}>{bt}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Goal"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                fullWidth
                            >
                                {GOALS.map((g) => (
                                    <MenuItem key={g} value={g}>{g}</MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <TextField
                            label="What's your topic or niche?"
                            placeholder="E.g., Digital marketing, fitness, sustainable living..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            fullWidth
                            helperText="Be specific for better results. The AI will generate tailored ideas."
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                            <TextField
                                select
                                label="Content Type"
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                fullWidth
                            >
                                {CONTENT_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Tone"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                fullWidth
                            >
                                {TONES.map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                type="number"
                                label="Number of Ideas"
                                value={numberOfIdeas}
                                onChange={(e) => setNumberOfIdeas(parseInt(e.target.value) || 10)}
                                inputProps={{ min: 5, max: 20 }}
                                fullWidth
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={handleGenerate}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <i className='tabler-sparkles' />}
                                sx={{ borderRadius: 2, px: 4, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                            >
                                {loading ? 'Generating...' : 'Generate Ideas'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Results Section */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Generated Ideas ({filteredResults.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                            label="All" 
                            onClick={() => setActiveFilter('all')}
                            color={activeFilter === 'all' ? 'primary' : 'default'}
                            sx={{ fontWeight: activeFilter === 'all' ? 'bold' : 'normal' }}
                        />
                        <Chip 
                            label="Blog" 
                            onClick={() => setActiveFilter('blog')}
                            variant={activeFilter === 'blog' ? 'filled' : 'outlined'}
                            color={activeFilter === 'blog' ? 'primary' : 'default'}
                        />
                        <Chip 
                            label="Social" 
                            onClick={() => setActiveFilter('social')}
                            variant={activeFilter === 'social' ? 'filled' : 'outlined'}
                            color={activeFilter === 'social' ? 'primary' : 'default'}
                        />
                        <Chip 
                            label="Video" 
                            onClick={() => setActiveFilter('video')}
                            variant={activeFilter === 'video' ? 'filled' : 'outlined'}
                            color={activeFilter === 'video' ? 'primary' : 'default'}
                        />
                    </Box>
                </Box>

                {filteredResults.length === 0 && !loading && (
                    <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                            <i className="tabler-bulb" style={{ fontSize: 48 }} />
                        </Box>
                        <Typography variant="h6" gutterBottom>No ideas generated yet</Typography>
                        <Typography variant="body2">Fill in the details above and click generate to get AI-powered content ideas.</Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredResults.map((idea, idx) => (
                        <IdeaCard
                            key={idx}
                            idea={idea}
                            onUse={() => handleSaveDraft(idea)}
                            onCopy={() => handleCopyIdea(idea)}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
