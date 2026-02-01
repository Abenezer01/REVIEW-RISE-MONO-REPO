'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'

import { SystemMessageCode } from '@platform/contracts'
import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import type { GenerateScriptRequest, GenerateScriptResponse, ScriptData } from '@platform/contracts'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'
import ToneSelector from './selectors/ToneSelector'
import PlatformSelector from './selectors/PlatformSelector'
import VideoDurationSelector from './scripts/VideoDurationSelector'
import StudioGenerateButton from './shared/StudioGenerateButton'

export default function ScriptWriter() {
    const { notify } = useSystemMessages()
    const [loading, setLoading] = useState(false)
    const [videoTopic, setVideoTopic] = useState('')
    const [videoGoal, setVideoGoal] = useState('')
    const [targetAudience, setTargetAudience] = useState('')
    const [tone, setTone] = useState('professional')
    const [platform, setPlatform] = useState('Instagram')
    const [duration, setDuration] = useState(15)
    const [includeSceneDescriptions, setIncludeSceneDescriptions] = useState(true)
    const [includeVisualSuggestions, setIncludeVisualSuggestions] = useState(true)
    const [includeBRollRecommendations, setIncludeBRollRecommendations] = useState(false)
    const [includeCallToAction, setIncludeCallToAction] = useState(true)
    const [script, setScript] = useState<ScriptData | null>(null)

    const handleGenerate = async () => {
        if (!videoTopic) {
            notify(SystemMessageCode.AI_GENERATION_FAILED)
            
return
        }

        setLoading(true)

        try {
            const requestBody: GenerateScriptRequest = { 
                videoTopic,
                videoGoal,
                targetAudience,
                tone,
                platform,
                duration,
                includeSceneDescriptions,
                includeVisualSuggestions,
                includeBRollRecommendations,
                includeCallToAction
            }

            const response = await apiClient.post<GenerateScriptResponse>(`${SERVICES.ai.url}/studio/scripts`, requestBody)

            const data = response.data

            setScript(data.script)
            notify(SystemMessageCode.AI_GENERATION_SUCCESS)
        } catch (error) {
            console.error(error)
            // Error handled by interceptor
        } finally {
            setLoading(false)
        }
    }

    const totalWords = script?.scenes?.reduce((acc: number, scene: any) => {
        return acc + (scene.voiceover?.split(' ').length || 0)
    }, 0) || 0

    return (
        <Box>
            <Grid container spacing={4}>
                {/* Left Panel - Input & Settings */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Script Details */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Script Details
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <TextField
                                            label="Video Topic"
                                            placeholder="Product demo, tutorial, brand story..."
                                            value={videoTopic}
                                            onChange={(e) => setVideoTopic(e.target.value)}
                                            fullWidth
                                            size="small"
                                            helperText="What is your video about?"
                                        />
                                    </Box>

                                    <TextField
                                        label="Video Goal (Optional)"
                                        placeholder="Increase awareness, drive sales, educate..."
                                        value={videoGoal}
                                        onChange={(e) => setVideoGoal(e.target.value)}
                                        fullWidth
                                        size="small"
                                    />

                                    <TextField
                                        label="Target Audience (Optional)"
                                        placeholder="Small business owners, tech enthusiasts..."
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Script Style */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Script Style
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <PlatformSelector value={platform} onChange={setPlatform} />
                                    <ToneSelector value={tone} onChange={setTone} />
                                    <VideoDurationSelector selected={duration} onChange={setDuration} />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Include in Script */}
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <i className="tabler-list-check" style={{ fontSize: 20 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        Include in Script
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={includeSceneDescriptions} 
                                                onChange={(e) => setIncludeSceneDescriptions(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Scene descriptions"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={includeVisualSuggestions} 
                                                onChange={(e) => setIncludeVisualSuggestions(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Visual suggestions"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={includeBRollRecommendations} 
                                                onChange={(e) => setIncludeBRollRecommendations(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="B-roll recommendations"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                checked={includeCallToAction} 
                                                onChange={(e) => setIncludeCallToAction(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Call-to-action"
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Generation Cost & Button */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Generation Cost
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    10 Credits
                                </Typography>
                            </Box>
                            <StudioGenerateButton
                                onClick={handleGenerate}
                                loading={loading}
                                label="✨ Generate Script"
                                loadingLabel="Generating..."
                                fullWidth
                                sx={{ 
                                    fontSize: '1rem',
                                }}
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* Right Panel - Generated Script */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Generated Script */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Generated Script
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton size="small">
                                            <i className="tabler-copy" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <i className="tabler-edit" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {!script ? (
                                    <Box sx={{ 
                                        p: 6, 
                                        textAlign: 'center', 
                                        color: 'text.secondary',
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2
                                    }}>
                                        <i className="tabler-script" style={{ fontSize: 48, opacity: 0.3 }} />
                                        <Typography variant="body2" mt={2}>
                                            Your generated script will appear here
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {script.scenes?.map((scene: any, idx: number) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    p: 2.5,
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2,
                                                    borderLeft: '4px solid',
                                                    borderColor: 'primary.main'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                    <Chip 
                                                        label={`SCENE ${idx + 1}`} 
                                                        size="small" 
                                                        sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {scene.timestamp || `0:${String(idx * 10).padStart(2, '0')} - 0:${String((idx + 1) * 10).padStart(2, '0')}`}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                                    {scene.title || `Hook - Opening Shot`}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" mb={1.5}>
                                                    {scene.description || scene.content}
                                                </Typography>
                                                {scene.voiceover && (
                                                    <Box sx={{ 
                                                        p: 1.5, 
                                                        bgcolor: 'background.paper', 
                                                        borderRadius: 1,
                                                        borderLeft: '2px solid',
                                                        borderColor: 'info.main'
                                                    }}>
                                                        <Typography variant="caption" color="info.main" fontWeight="bold" display="block" mb={0.5}>
                                                            VOICEOVER:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {scene.voiceover}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Script Statistics */}
                        {script && (
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight="bold" mb={3}>
                                        Script Statistics
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                                {duration}s
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                DURATION
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                                {script.scenes?.length || 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                SCENES
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                                {totalWords}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                WORDS
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
