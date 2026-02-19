import React from 'react'

import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material'
import { useTranslations } from 'next-intl'

interface ContentIdeasCardProps {
    contentIdeas: Array<{
        title: string
        description: string
        type?: string
    }>
    onUseIdea: (title: string, description: string) => void
}

export default function ContentIdeasCard({ contentIdeas, onUseIdea }: ContentIdeasCardProps) {
    const t = useTranslations('studio')

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#FFF8E1', color: '#FFC107' }}>
                            <i className="tabler-bulb" style={{ fontSize: 20 }} />
                        </Box>
                    <Typography variant="h6" fontWeight="bold">{t('ideas.title')}</Typography>
                    </Box>
                    <IconButton size="small">
                            <i className="tabler-plus" />
                    </IconButton>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {(contentIdeas || []).map((idea, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.2s' }}>
                            <Box sx={{ 
                                minWidth: 32, height: 32, 
                                borderRadius: 1.5, bgcolor: 'action.hover', color: 'text.secondary',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '0.875rem', mt: 0.25,
                                flexShrink: 0
                            }}>
                                {idx + 1}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75, fontSize: '0.95rem' }}>{idea.title}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.65 }}>
                                    {idea.description}
                                </Typography>
                            </Box>
                            <Tooltip title={t('ideas.useThisIdea')}>
                                <IconButton 
                                    size="small"
                                    onClick={() => onUseIdea(idea.title, idea.description)}
                                >
                                    <i className="tabler-arrow-right" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
