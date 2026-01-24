'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import PlatformSelector from '../selectors/PlatformSelector'

interface HashtagInputProps {
    niche: string
    audience: string
    description: string
    platform: string
    onNicheChange: (value: string) => void
    onAudienceChange: (value: string) => void
    onDescriptionChange: (value: string) => void
    onPlatformChange: (value: string) => void
    onGenerate: () => void
    loading: boolean
}

export default function HashtagInput({
    niche,
    audience,
    description,
    platform,
    onNicheChange,
    onAudienceChange,
    onDescriptionChange,
    onPlatformChange,
    onGenerate,
    loading
}: HashtagInputProps) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                    Tell AI About Your Content
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: 'text.secondary' }}>
                            Industry / Niche
                        </Typography>
                        <TextField
                            placeholder="e.g., Fitness, Fashion, Tech"
                            value={niche}
                            onChange={(e) => onNicheChange(e.target.value)}
                            fullWidth
                            size="small"
                            helperText="Your business category"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: 'text.secondary' }}>
                            Target Audience
                        </Typography>
                        <TextField
                            placeholder="e.g., Young professionals, Millennials"
                            value={audience}
                            onChange={(e) => onAudienceChange(e.target.value)}
                            fullWidth
                            size="small"
                            helperText="Who you're trying to reach"
                        />
                    </Grid>
                    <Grid size={12}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: 'text.secondary' }}>
                            Content Description
                        </Typography>
                        <TextField
                            placeholder="Be specific for better hashtag recommendations"
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid size={12}>
                        <PlatformSelector
                            value={platform}
                            onChange={onPlatformChange}
                        />
                    </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={onGenerate}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <i className='tabler-sparkles' />}
                        sx={{ borderRadius: 2, px: 4, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}
