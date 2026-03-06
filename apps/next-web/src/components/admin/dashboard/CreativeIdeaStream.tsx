/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, useTheme, alpha, Button } from '@mui/material'

export default function CreativeIdeaStream() {
    const theme = useTheme()

    const ideas = [
        {
            type: 'Ad Concept',
            title: 'Summer Flash Sale',
            platform: 'Facebook',
            status: 'Ready to Publish',
            image: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=200&h=120&fit=crop', // Placeholder
            icon: 'tabler-brand-facebook',
            color: '#1877F2'
        },
        {
            type: 'Social Draft',
            title: 'Review Highlight',
            platform: 'Instagram',
            status: 'Awaiting Auth',
            image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=120&fit=crop',
            icon: 'tabler-brand-instagram',
            color: '#E4405F'
        }
    ]

    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
        >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, display: 'flex' }}>
                        <i className="tabler-wand" style={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{'AI Creative Stream'}</Typography>
                </Box>
                <Button variant="text" size="small" sx={{ fontWeight: 600 }}>{'Studio'}</Button>
            </Box>

            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ideas.map((idea, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            '&:hover': { transform: 'translateX(4px)', borderColor: theme.palette.primary.main }
                        }}
                    >
                        <Box
                            sx={{
                                minWidth: 100,
                                height: 70,
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundImage: `url(${idea.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ color: idea.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <i className={idea.icon} /> {idea.platform}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.5, mb: 0.5, lineHeight: 1.2 }}>
                                {idea.title} ({idea.type})
                            </Typography>
                            <Typography variant="caption" sx={{
                                color: idea.status === 'Ready to Publish' ? theme.palette.success.main : theme.palette.warning.main,
                                fontWeight: 600
                            }}>
                                • {idea.status}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </CardContent>
        </Card>
    )
}
