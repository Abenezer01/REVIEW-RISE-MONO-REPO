
'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'

import HashtagInput from './hashtags/HashtagInput'
import HashtagResults from './hashtags/HashtagResults'
import HashtagSidebar from './hashtags/HashtagSidebar'

export default function HashtagGenerator() {
    const [loading, setLoading] = useState(false)
    
    // Input State
    const [niche, setNiche] = useState('')
    const [audience, setAudience] = useState('')
    const [description, setDescription] = useState('')
    const [platform, setPlatform] = useState('Instagram')
    
    const [results, setResults] = useState<{ niche: string[], local: string[], core: string[] } | null>(null)

    const handleGenerate = async () => {
        if (!niche && !description) {
            toast.error('Please enter at least a niche or description')
            
return
        }

        setLoading(true)

        try {
            const response = await apiClient.post(`${SERVICES.ai.url}/studio/hashtags`, {
                niche,
                audience,
                description,
                platform 
            })

            const data = response.data

            setResults(data)
            toast.success('Hashtags generated!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate hashtags')
        } finally {
            setLoading(false)
        }
    }

    const copyAll = () => {
        if (!results) return
        const allTags = [...results.core, ...results.niche, ...results.local].join(' ')

        navigator.clipboard.writeText(allTags)
        toast.success('All hashtags copied')
    }

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Hashtag Generator
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Generate targeted hashtags for maximum reach
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Main Content Area */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <HashtagInput
                            niche={niche}
                            audience={audience}
                            description={description}
                            platform={platform}
                            onNicheChange={setNiche}
                            onAudienceChange={setAudience}
                            onDescriptionChange={setDescription}
                            onPlatformChange={setPlatform}
                            onGenerate={handleGenerate}
                            loading={loading}
                        />

                        <HashtagResults
                            results={results}
                            onCopyAll={copyAll}
                        />
                    </Box>
                </Grid>

                {/* Sidebar */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <HashtagSidebar />
                </Grid>
            </Grid>
        </Box>
    )
}
