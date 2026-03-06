'use client'

import React from 'react'
import { Card, CardHeader, CardContent, Typography, Box, useTheme, alpha } from '@mui/material'

export default function PlatformActivityTimeline() {
    const theme = useTheme()

    const activities = [
        { title: 'Auto-replied to 5 Reviews', module: 'SmartReviews', time: '10 mins ago', color: 'success', icon: 'tabler-star' },
        { title: 'Published 2 Tweets', module: 'SocialRise', time: '45 mins ago', color: 'info', icon: 'tabler-brand-twitter' },
        { title: 'Generated New Audience Blueprint', module: 'AdRise', time: '2 hours ago', color: 'primary', icon: 'tabler-badge-ad' },
        { title: 'Weekly SEO Audit Completed', module: 'SEO Intelligence', time: '5 hours ago', color: 'warning', icon: 'tabler-search' },
        { title: 'Failed to Sync Google Location', module: 'GBP Rocket', time: '1 day ago', color: 'error', icon: 'tabler-rocket' },
    ]

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader
                title="Platform Activity"
                subheader="Real-time log of automated actions."
            />
            <CardContent>
                <Box sx={{ position: 'relative' }}>
                    {/* Vertical Line */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 19,
                            top: 10,
                            bottom: 20,
                            width: 2,
                            backgroundColor: alpha(theme.palette.divider, 0.5)
                        }}
                    />

                    {activities.map((act, idx) => (
                        <Box key={idx} sx={{ display: 'flex', mb: idx === activities.length - 1 ? 0 : 3, position: 'relative' }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.background.paper,
                                    border: `2px solid ${(theme.palette as any)[act.color]?.main || theme.palette.primary.main}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1,
                                    flexShrink: 0,
                                    boxShadow: `0 0 0 4px ${alpha((theme.palette as any)[act.color]?.main || theme.palette.primary.main, 0.1)}`
                                }}
                            >
                                <i className={act.icon} style={{ color: (theme.palette as any)[act.color]?.main || theme.palette.primary.main, fontSize: '1.2rem' }} />
                            </Box>

                            <Box sx={{ ml: 3, pt: 0.5, width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{act.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{act.time}</Typography>
                                </Box>
                                <Typography variant="caption" sx={{
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    backgroundColor: alpha((theme.palette as any)[act.color]?.main || theme.palette.primary.main, 0.1),
                                    color: (theme.palette as any)[act.color]?.main || theme.palette.primary.main,
                                    fontWeight: 600,
                                    display: 'inline-block'
                                }}>
                                    {act.module}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}
