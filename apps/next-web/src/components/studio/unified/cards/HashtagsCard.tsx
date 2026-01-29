import React from 'react'
import { Box, Card, CardContent, Typography, Chip, Stack, IconButton, Tooltip } from '@mui/material'
import { toast } from 'react-toastify'

interface HashtagsCardProps {
    hashtags: {
        highVolume?: string[]
        niche?: string[]
        branded?: string[]
        [key: string]: string[] | undefined
    }
    onUseHashtags: (tags: string[]) => void
}

export default function HashtagsCard({ hashtags, onUseHashtags }: HashtagsCardProps) {
    const getAllHashtags = () => {
        const { highVolume = [], niche = [], branded = [] } = hashtags
        return [...highVolume, ...niche, ...branded].join(' ')
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#E3F2FD', color: '#2196F3' }}>
                            <i className="tabler-hash" style={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">Hashtags (30)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Use All Hashtags">
                            <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => onUseHashtags([...(hashtags.highVolume || []), ...(hashtags.niche || []), ...(hashtags.branded || [])])}
                            >
                                <i className="tabler-plus" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy All">
                            <IconButton size="small" onClick={() => copyToClipboard(getAllHashtags())}>
                                <i className="tabler-copy" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Tabs/Chips */}
                <Stack direction="row" spacing={1.5} mb={3.5} flexWrap="wrap">
                    <Chip label="#HighVolume" color="primary" sx={{ borderRadius: 1.5 }} />
                    <Chip label="#Niche" color="default" variant="outlined" sx={{ borderRadius: 1.5 }} />
                    <Chip label="#Branded" color="default" variant="outlined" sx={{ borderRadius: 1.5 }} />
                </Stack>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">High-Volume Hashtags</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Tooltip title="Add to Preview">
                                    <IconButton size="small" onClick={() => onUseHashtags(hashtags.highVolume || [])} color="primary">
                                        <i className="tabler-circle-plus" style={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                                <Chip label="HIGH REACH" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: '0.875rem' }}>
                            {(hashtags.highVolume || []).join(' ')}
                        </Typography>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Niche Hashtags</Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Tooltip title="Add to Preview">
                                    <IconButton size="small" onClick={() => onUseHashtags(hashtags.niche || [])} color="primary">
                                        <i className="tabler-circle-plus" style={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                                <Chip label="TARGETED" size="small" color="info" sx={{ height: 20, fontSize: '0.65rem' }} />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: '0.875rem' }}>
                            {(hashtags.niche || []).join(' ')}
                        </Typography>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Branded Hashtags</Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Tooltip title="Add to Preview">
                                    <IconButton size="small" onClick={() => onUseHashtags(hashtags.branded || [])} color="primary">
                                        <i className="tabler-circle-plus" style={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                                <Chip label="BRAND" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: '0.875rem' }}>
                            {(hashtags.branded || []).join(' ')}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
