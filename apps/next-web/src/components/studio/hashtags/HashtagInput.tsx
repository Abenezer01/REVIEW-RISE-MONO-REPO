'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

import PlatformSelector from '../selectors/PlatformSelector'
import StudioGenerateButton from '../shared/StudioGenerateButton'

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
    const t = useTranslations('studio.hashtags')

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                    {t('inputTitle')}
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: 'text.secondary' }}>
                            {t('industryLabel')}
                        </Typography>
                        <TextField
                            placeholder={t('industryPlaceholder')}
                            value={niche}
                            onChange={(e) => onNicheChange(e.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: 'text.secondary' }}>
                            {t('audienceLabel')}
                        </Typography>
                        <TextField
                            placeholder={t('audiencePlaceholder')}
                            value={audience}
                            onChange={(e) => onAudienceChange(e.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid size={12}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: 'text.secondary' }}>
                            {t('descriptionLabel')}
                        </Typography>
                        <TextField
                            placeholder={t('topicPlaceholder')}
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
                    <StudioGenerateButton
                        onClick={onGenerate}
                        loading={loading}
                        label={t('submitButton')}
                        loadingLabel={t('loading')}
                    />
                </Box>
            </CardContent>
        </Card>
    )
}
