import React from 'react'

import { Box, Card, CardContent, Typography, Avatar } from '@mui/material'
import { useTranslations } from 'next-intl'

interface PreviewCardProps {
    platform: string
    previewCaption: string
    imagePrompt?: string
}

export default function PreviewCard({ platform, previewCaption, imagePrompt }: PreviewCardProps) {
    const t = useTranslations('studio.magic.preview')

    return (
        <React.Fragment>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{platform || 'Instagram'} {t('title')}</Typography>
            <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#E1306C' }} />
                        <Box>
                            <Typography variant="body2" fontWeight="bold">{t('yourBrand')}</Typography>
                            <Typography variant="caption" color="text.secondary">{t('originalAudio')}</Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                            <i className="tabler-dots" />
                        </Box>
                    </Box>

                    {/* Image Placeholder */}
                    <Box sx={{ 
                        aspectRatio: '1/1', 
                        bgcolor: 'action.hover', 
                        borderRadius: 2, 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 2,
                        color: 'text.secondary',
                        p: 3,
                        textAlign: 'center'
                    }}>
                        {imagePrompt ? (
                            <>
                                <i className="tabler-photo" style={{ fontSize: 48, opacity: 0.3 }} />
                                <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                                    {'"'}{imagePrompt.slice(0, 100)}...{'"'}
                                </Typography>
                            </>
                        ) : (
                            <i className="tabler-photo" style={{ fontSize: 48, opacity: 0.3 }} />
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <i className="tabler-heart" style={{ fontSize: 22 }} />
                            <i className="tabler-message-circle" style={{ fontSize: 22 }} />
                            <i className="tabler-send" style={{ fontSize: 22 }} />
                        </Box>
                        <i className="tabler-bookmark" style={{ fontSize: 22 }} />
                    </Box>

                    <Typography variant="body2" fontWeight="bold" gutterBottom>{t('likes', { count: '1,234' })}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 'bold', marginRight: 8 }}>{t('yourBrand')}</span>
                        {previewCaption && previewCaption.slice(0, 100)}... <span style={{ color: 'text.secondary' }}>{t('more')}</span>
                    </Typography>
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>{t('fullCaptionPreview')}</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                            {previewCaption}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </React.Fragment>
    )
}
