'use client'

import React from 'react'

import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { useTranslations } from 'next-intl'

export default function ProTips() {
    const t = useTranslations('studio.captions')

    const tips = [
        t('proTip1'),
        t('proTip2'),
        t('proTip3'),
        t('proTip4')
    ]

    return (
        <Card variant="outlined" sx={{  bgcolor: 'rgba(76, 175, 80, 0.08)', borderColor: 'rgba(76, 175, 80, 0.3)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <i className="tabler-bulb" style={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">{t('proTips')}</Typography>
                </Box>
                <List dense disablePadding>
                    {tips.map((tip, idx) => (
                         <ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={tip} 
                                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'medium' }} 
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    )
}
