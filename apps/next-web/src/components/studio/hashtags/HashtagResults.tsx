'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { toast } from 'react-toastify'

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
    const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'niche' | 'trending'>('all')

    const copyHashtag = (tag: string) => {
        navigator.clipboard.writeText(tag)
        toast.success('Copied!')
    }

    const totalCount = results ? results.core.length + results.niche.length + results.local.length : 0

    if (!results) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                    <i className="tabler-hash" style={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>No hashtags generated yet</Typography>
                <Typography variant="body2">Fill in the details above to get targeted hashtags.</Typography>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Generated Hashtags
                    <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                        {totalCount} hashtags
                    </Typography>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        startIcon={<i className='tabler-copy' />} 
                        onClick={onCopyAll} 
                        size="small" 
                        variant="outlined"
                    >
                        Copy All
                    </Button>
                    {onExport && (
                        <Button 
                            startIcon={<i className='tabler-download' />} 
                            onClick={onExport} 
                            size="small" 
                            variant="outlined"
                        >
                            Export
                        </Button>
                    )}
                    {onRegenerate && (
                        <Button 
                            startIcon={<i className='tabler-refresh' />} 
                            onClick={onRegenerate} 
                            size="small" 
                            variant="outlined"
                        >
                            Regenerate
                        </Button>
                    )}
                </Box>
            </Box>

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        <Chip 
                            label="All" 
                            color={activeTab === 'all' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('all')}
                            sx={{ fontWeight: activeTab === 'all' ? 'bold' : 'normal' }} 
                        />
                        <Chip 
                            label="Popular" 
                            variant={activeTab === 'popular' ? 'filled' : 'outlined'}
                            color={activeTab === 'popular' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('popular')}
                        />
                        <Chip 
                            label="Niche" 
                            variant={activeTab === 'niche' ? 'filled' : 'outlined'}
                            color={activeTab === 'niche' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('niche')}
                        />
                        <Chip 
                            label="Trending" 
                            variant={activeTab === 'trending' ? 'filled' : 'outlined'}
                            color={activeTab === 'trending' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('trending')}
                        />
                    </Box>

                    <Grid container spacing={4}>
                        {(activeTab === 'all' || activeTab === 'popular') && results.core.length > 0 && (
                            <Grid size={12}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                    Core Hashtags
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
                                                        {Math.floor(Math.random() * 500)}M
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
                                    Niche & Targeted
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
                                                        {Math.floor(Math.random() * 900)}K
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
                                    Community / Trending
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
                                                        {Math.floor(Math.random() * 50)}K
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
