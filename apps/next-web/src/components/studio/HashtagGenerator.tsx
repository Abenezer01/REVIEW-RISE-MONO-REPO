
'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { SERVICES } from '@/configs/services'
import apiClient from '@/lib/apiClient'

import HashtagInput from './hashtags/HashtagInput'
import HashtagResults from './hashtags/HashtagResults'
import HashtagSidebar from './hashtags/HashtagSidebar'

export default function HashtagGenerator() {
    const { notify } = useSystemMessages()
    const [loading, setLoading] = useState(false)
    
    // Input State
    const [niche, setNiche] = useState('')
    const [audience, setAudience] = useState('')
    const [description, setDescription] = useState('')
    const [platform, setPlatform] = useState('Instagram')
    
    const [results, setResults] = useState<{ niche: string[], local: string[], core: string[] } | null>(null)

    const handleGenerate = async () => {
        if (!niche && !description) {
            notify({
                messageCode: 'studio.hashtagInputError' as any,
                severity: 'ERROR'
            })
            
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
            notify({
                messageCode: 'studio.hashtagsGenerated' as any,
                severity: 'SUCCESS'
            })
        } catch (error) {
            console.error(error)
            notify({
                messageCode: 'studio.generateError' as any,
                severity: 'ERROR'
            })
        } finally {
            setLoading(false)
        }
    }

    const copyAll = () => {
        if (!results) return
        const allTags = [...results.core, ...results.niche, ...results.local].join(' ')

        navigator.clipboard.writeText(allTags)
        notify({
            messageCode: 'COPIED_TO_CLIPBOARD' as any,
            severity: 'SUCCESS'
        })
    }

    return (
        <Box>

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
