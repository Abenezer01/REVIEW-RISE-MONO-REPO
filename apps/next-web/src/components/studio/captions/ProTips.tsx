'use client'

import React from 'react'

import { Card, CardContent, Typography, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'

export default function ProTips() {
    const tips = [
        "Add emojis to increase engagement by up to 47%",
        "Keep captions under 150 characters for Instagram",
        "Use questions to encourage comments",
        "Include clear CTAs for better conversion"
    ]

    return (
        <Card variant="outlined" sx={{  bgcolor: 'rgba(76, 175, 80, 0.08)', borderColor: 'rgba(76, 175, 80, 0.3)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <i className="tabler-bulb" style={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">Pro Tips</Typography>
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
