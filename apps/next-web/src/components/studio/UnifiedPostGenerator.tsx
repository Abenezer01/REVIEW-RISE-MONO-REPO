'use client'

import React, { useState } from 'react'

import { Box, Card, CardContent, Grid, TextField, MenuItem, Typography, Button, Chip, Avatar, Tooltip } from '@mui/material'
import { useTranslations } from 'next-intl'
import { toast } from 'react-toastify'
import { keyframes } from '@mui/material/styles'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'

import PlatformSelector from './selectors/PlatformSelector'
import ToneSelector from './selectors/ToneSelector'
import StudioGenerateButton from './shared/StudioGenerateButton'
import UnifiedResults from './unified/UnifiedResults'

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 0.5; }
`

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const GOALS = [
    { value: 'engagement', label: 'Engagement' },
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'sales', label: 'Sales / Conversion' },
    { value: 'education', label: 'Education' },
]

const LANGUAGES = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Arabic', label: 'Arabic' }
]

const LENGTHS = [
    { value: 'short', label: 'Short' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' }
]

const TEMPLATES = [
    { label: 'Product Launch', sub: 'Announce new products with excitement', icon: 'tabler-rocket' },
    { label: 'Behind the Scenes', sub: 'Show your brand\'s human side', icon: 'tabler-camera' },
    { label: 'Educational Tips', sub: 'Share valuable insights', icon: 'tabler-school' },
]

export default function UnifiedPostGenerator() {
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
            toast.error('Please enter a topic or focus')
            
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
            toast.success('Generated complete post package!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate post package')
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
                    Back to Studio
                </Button>
                <UnifiedResults data={result} />
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Create Complete Posts Instantly
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    One AI brain. One prompt. Caption + Hashtags + Content Ideas in seconds.
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
                                <Typography variant="h6" fontWeight="bold">What do you want to create?</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                
                                <PlatformSelector value={platform} onChange={setPlatform} />

                                <Box>
                                    <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">Topic or Main Idea</Typography>
                                    <TextField
                                        placeholder="e.g., A post announcing our new summer collection... include keywords like summer, sale, fashion"
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
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">Target Audience</Typography>
                                        <TextField
                                            placeholder="e.g. Young professionals..."
                                            value={audience}
                                            onChange={(e) => setAudience(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">Goal</Typography>
                                        <TextField
                                            select
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            {GOALS.map(g => (
                                                <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                </Box>

                                <ToneSelector value={tone} onChange={setTone} />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">Language</Typography>
                                        <TextField
                                            select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            {LANGUAGES.map(l => (
                                                <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" mb={1} color="text.secondary">Caption Length</Typography>
                                        <TextField
                                            select
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                            fullWidth
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        >
                                            {LENGTHS.map(l => (
                                                <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
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
                                    {loading ? 'Generating Magic...' : 'Generate Complete Post'}
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

                            <Typography variant="h5" fontWeight="bold" gutterBottom>Your AI Content Brain</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 300, mx: 'auto' }}>
                                Powered by advanced AI that understands your brand voice, audience, and platform best practices.
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">3-in-1</Typography>
                                    <Typography variant="caption" color="text.secondary">OUTPUTS</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">10s</Typography>
                                    <Typography variant="caption" color="text.secondary">GENERATION</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">98%</Typography>
                                    <Typography variant="caption" color="text.secondary">ACCURACY</Typography>
                                </Box>
                            </Box>
                        </Card>

                        {/* 2. Ready to Create Magic Card */}
                        <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                            <Box sx={{ mb: 2 }}>
                                <i className="tabler-rocket" style={{ fontSize: 48, color: '#90A4AE', opacity: 0.5 }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Ready to Create Magic?</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Fill in the form and hit generate to get your complete post package.
                            </Typography>
                        </Card>

                        {/* 3. Quick Start Templates */}
                        <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={2}>Quick Start Templates</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {TEMPLATES.map((tpl, i) => (
                                        <Box 
                                            key={i} 
                                            onClick={() => handleUseTemplate(tpl.label)}
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
                                                <Typography variant="body2" fontWeight="bold">{tpl.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">{tpl.sub}</Typography>
                                            </Box>
                                            <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 2 }}>Use</Button>
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
