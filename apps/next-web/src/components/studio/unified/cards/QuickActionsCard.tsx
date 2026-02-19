import React from 'react'

import { Card, CardContent, Typography, Button, Box } from '@mui/material'

import { useTranslation } from '@/hooks/useTranslation'

interface QuickActionsCardProps {
    onInstantPost: () => void
    onOpenSchedule: () => void
}

export default function QuickActionsCard({ onInstantPost, onOpenSchedule }: QuickActionsCardProps) {
    const t = useTranslation('studio')

    return (
        <React.Fragment>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>{t('magic.quickActionsTitle')}</Typography>
            <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                        { label: t('magic.postInstantly'), icon: 'tabler-send', action: onInstantPost },
                        { label: t('magic.scheduleToSocial'), icon: 'tabler-calendar', action: onOpenSchedule },
                        { label: t('magic.downloadPdf'), icon: 'tabler-download', action: () => {} },
                        { label: t('magic.shareWithTeam'), icon: 'tabler-share', action: () => {} }
                    ].map((action, i) => (
                        <Button 
                            key={i}
                            fullWidth 
                            onClick={action.action}
                            sx={{ 
                                justifyContent: 'flex-start', py: 1.5, px: 2, 
                                color: 'text.primary',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            startIcon={<Box sx={{ p: 0.5, bgcolor: 'action.hover', borderRadius: 1, display: 'flex' }}><i className={action.icon} /></Box>}
                        >
                            {action.label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </React.Fragment>
    )
}
