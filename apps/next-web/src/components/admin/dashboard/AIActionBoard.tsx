/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, Button, useTheme, alpha, Divider } from '@mui/material'

export default function AIActionBoard() {
    const theme = useTheme()

    const actionItems = [
        {
            id: 1,
            type: 'Triage',
            priority: 'high',
            title: 'Review Triage Desk',
            description: '3 new Negative reviews holding down your 4.8 Rating.',
            actionText: 'Draft Auto-Replies',
            icon: 'tabler-message-circle-x',
            color: theme.palette.error.main,
        },
        {
            id: 2,
            type: 'Visibility',
            priority: 'high',
            title: 'AI Share of Voice Drop',
            description: 'ChatGPT mentions for "Best Coffee Downtown" dropped 15% this week.',
            actionText: 'Generate SEO Blueprint',
            icon: 'tabler-chart-down',
            color: theme.palette.warning.main,
        },
        {
            id: 3,
            type: 'Opportunity',
            priority: 'medium',
            title: 'Brand Recommendation',
            description: 'Your recent Instagram post has high engagement. Boost it via Ad Rise.',
            actionText: 'Create Campaign',
            icon: 'tabler-rocket',
            color: theme.palette.info.main,
        }
    ]

    return (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`,
            }}
        >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        display: 'flex'
                    }}>
                        <i className="tabler-brain" style={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{'AI Action Board'}</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.error.main, backgroundColor: alpha(theme.palette.error.main, 0.1), px: 1.5, py: 0.5, borderRadius: 4 }}>
                    {actionItems.filter(i => i.priority === 'high').length} {'Urgent Items'}
                </Typography>
            </Box>

            <CardContent sx={{ p: '0 !important' }}>
                {actionItems.map((item, index) => (
                    <Box key={item.id}>
                        <Box
                            sx={{
                                p: 2.5,
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: 2,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.action.hover, 0.5)
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box sx={{
                                    p: 1.2,
                                    borderRadius: '50%',
                                    backgroundColor: alpha(item.color, 0.1),
                                    color: item.color,
                                    display: 'flex',
                                    mt: 0.5
                                }}>
                                    <i className={item.icon} style={{ fontSize: '1.2rem' }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {item.description}
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    whiteSpace: 'nowrap',
                                    borderRadius: 2,
                                    backgroundColor: item.priority === 'high' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                                    color: item.priority === 'high' ? '#fff' : theme.palette.primary.main,
                                    boxShadow: item.priority === 'high' ? theme.shadows[4] : 'none',
                                    '&:hover': {
                                        backgroundColor: item.priority === 'high' ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.2),
                                        boxShadow: item.priority === 'high' ? theme.shadows[6] : 'none',
                                    },
                                    fontWeight: 600,
                                    alignSelf: { xs: 'flex-end', sm: 'center' }
                                }}
                                endIcon={<i className="tabler-arrow-right" style={{ fontSize: '1rem' }} />}
                            >
                                {item.actionText}
                            </Button>
                        </Box>
                        {index < actionItems.length - 1 && <Divider />}
                    </Box>
                ))}
            </CardContent>
        </Card>
    )
}
