'use client'

import React from 'react'

import { Card, CardContent, Typography, Box, IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { useTranslations } from 'next-intl'

export default function RecentGenerations() {
    const t = useTranslations('studio.dashboard')

    // Mock data for now
    const generations = [
        { id: 1, title: 'Instagram Caption - Product Launch', time: '2 hours ago', type: 'caption', icon: 'tabler-brand-instagram' },
        { id: 2, title: 'AI Image - Summer Campaign', time: '5 hours ago', type: 'image', icon: 'tabler-photo' },
        { id: 3, title: '30-Day Content Plan - January', time: '1 day ago', type: 'plan', icon: 'tabler-calendar' },
        { id: 4, title: 'Carousel - 5 Tips for Growth', time: '2 days ago', type: 'carousel', icon: 'tabler-slideshow' },
    ]

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>{t('recentTitle')}</Typography>
                
                <List disablePadding>
                    {generations.map((gen) => (
                        <ListItem key={gen.id} disableGutters sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                            <ListItemIcon sx={{ minWidth: 48 }}>
                                <Box sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    borderRadius: 1, 
                                    bgcolor: 'action.hover', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <i className={gen.icon} style={{ fontSize: 20, color: 'inherit' }} />
                                </Box>
                            </ListItemIcon>
                            <ListItemText 
                                primary={gen.title} 
                                secondary={gen.time} 
                                primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold', color: 'text.primary' }}
                                secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton size="small"><i className="tabler-eye" /></IconButton>
                                <IconButton size="small"><i className="tabler-copy" /></IconButton>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    )
}
