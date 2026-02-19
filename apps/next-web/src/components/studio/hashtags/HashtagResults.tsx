'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { useTranslations } from 'next-intl'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

interface HashtagResultsProps {
    results: {
        core: string[]
        niche: string[]
        local: string[]
    } | null
    onCopyAll: () => void
    onExport?: () => void
    onRegenerate?: () => void
}

export default function HashtagResults({ results, onCopyAll, onExport, onRegenerate }: HashtagResultsProps) {
    const t = useTranslations('studio')
    const tc = useTranslations('common')
    const { notify } = useSystemMessages()
    const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'niche' | 'trending'>('all')

    const copyHashtag = (tag: string) => {
        navigator.clipboard.writeText(tag)
        notify({
            messageCode: 'COPIED_TO_CLIPBOARD' as any,
            severity: 'SUCCESS'
        })
    }

    const totalCount = results ? results.core.length + results.niche.length + results.local.length : 0

    if (!results) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                    <i className="tabler-hash" style={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>{t('hashtags.emptyState')}</Typography>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    {t('hashtags.generatedTitle')}
                    <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                        {t('hashtags.hashtagsCount', { count: totalCount })}
                    </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        startIcon={<i className='tabler-copy' />} 
                        onClick={onCopyAll} 
                        size="small" 
                        variant="outlined"
                    >
                            {t('hashtags.copyAll')}
                    </Button>
                    {onExport && (
                        <Button 
                            startIcon={<i className='tabler-download' />} 
                            onClick={onExport} 
                            size="small" 
                            variant="outlined"
                        >
                                {tc('common.export')}
                        </Button>
                    )}
                    {onRegenerate && (
                        <Button 
                            startIcon={<i className='tabler-refresh' />} 
                            onClick={onRegenerate} 
                            size="small" 
                            variant="outlined"
                        >
                                {t('captions.regenerate')}
                        </Button>
                    )}
                </Box>
            </Box>

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <Chip 
                            label={t('hashtags.all')}
                            color={activeTab === 'all' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('all')}
                            sx={{ fontWeight: activeTab === 'all' ? 'bold' : 'normal' }} 
                        />
                        <Chip 
                            label={t('hashtags.popular')}
                            variant={activeTab === 'popular' ? 'filled' : 'outlined'}
                            color={activeTab === 'popular' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('popular')}
                        />
                        <Chip 
                            label={t('hashtags.niche')}
                            variant={activeTab === 'niche' ? 'filled' : 'outlined'}
                            color={activeTab === 'niche' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('niche')}
                        />
                        <Chip 
                            label={t('hashtags.trending')}
                            variant={activeTab === 'trending' ? 'filled' : 'outlined'}
                            color={activeTab === 'trending' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('trending')}
                        />
                    </Box>

                    <Grid container spacing={4}>
                        {(activeTab === 'all' || activeTab === 'popular') && results.core.length > 0 && (
                            <Grid size={12}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    {t('hashtags.coreHashtags')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {results.core.map((tag, i) => (
                                        <Chip
                                            key={i}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {tag}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                                        {Math.floor(Math.random() * 500)}{t('hashtags.millionShort')}
                                                    </Typography>
                                                </Box>
                                            }
                                            onClick={() => copyHashtag(tag)}
                                            icon={<i className="tabler-hash" style={{ fontSize: 14 }} />}
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor: 'primary.lightOpacity',
                                                color: 'primary.main',
                                                borderRadius: 2,
                                                px: 1,
                                                py: 2.5,
                                                '&:hover': {
                                                    bgcolor: 'primary.mainOpacity',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 1
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {(activeTab === 'all' || activeTab === 'niche') && results.niche.length > 0 && (
                            <Grid size={12}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    {t('hashtags.nicheTargeted')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {results.niche.map((tag, i) => (
                                        <Chip
                                            key={i}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {tag}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                                        {Math.floor(Math.random() * 900)}{t('hashtags.thousandShort')}
                                                    </Typography>
                                                </Box>
                                            }
                                            onClick={() => copyHashtag(tag)}
                                            icon={<i className="tabler-hash" style={{ fontSize: 14 }} />}
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor: 'action.hover',
                                                color: 'text.primary',
                                                borderRadius: 2,
                                                px: 1,
                                                py: 2.5,
                                                '&:hover': {
                                                    bgcolor: 'action.selected',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 1
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {(activeTab === 'all' || activeTab === 'trending') && results.local.length > 0 && (
                            <Grid size={12}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    {t('hashtags.communityTrending')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {results.local.map((tag, i) => (
                                        <Chip
                                            key={i}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {tag}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                                        {Math.floor(Math.random() * 50)}{t('hashtags.thousandShort')}
                                                    </Typography>
                                                </Box>
                                            }
                                            onClick={() => copyHashtag(tag)}
                                            icon={<i className="tabler-hash" style={{ fontSize: 14 }} />}
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor: 'success.lightOpacity',
                                                color: 'success.main',
                                                borderRadius: 2,
                                                px: 1,
                                                py: 2.5,
                                                '&:hover': {
                                                    bgcolor: 'success.mainOpacity',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 1
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    )
}
