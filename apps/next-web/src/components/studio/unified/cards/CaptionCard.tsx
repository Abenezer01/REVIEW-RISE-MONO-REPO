import React from 'react'

import { Box, Card, CardContent, Typography, Divider, IconButton, Tooltip } from '@mui/material'


import { useSystemMessages } from '@/shared/components/SystemMessageProvider'

import { useTranslation } from '@/hooks/useTranslation'

interface CaptionCardProps {
    caption: string
    onUseCaption: () => void
}

export default function CaptionCard({ caption, onUseCaption }: CaptionCardProps) {
    const t = useTranslation('studio')
    const { notify } = useSystemMessages()

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        notify({
            messageCode: 'common.copied' as any,
            severity: 'SUCCESS'
        })
    }

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.main' }}>
                            <i className="tabler-text-caption" style={{ fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">{t('captions.caption')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('captions.useCaption')}>
                            <IconButton size="small" onClick={onUseCaption} color="primary">
                                <i className="tabler-arrow-right" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('captions.copyCaption')}>
                            <IconButton size="small" onClick={() => copyToClipboard(caption)}>
                                <i className="tabler-copy" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3.5, lineHeight: 1.75, color: 'text.primary', fontSize: '0.95rem' }}>
                    {caption}
                </Typography>
                
                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>{t('captions.words')}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="text.primary">{caption.split(' ').length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>{t('captions.characters')}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="text.primary">{caption.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>{t('captions.emojis')}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="text.primary">{(caption.match(/[\p{Emoji}]/gu) || []).length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>{t('captions.engagementScore')}</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">94/100</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
