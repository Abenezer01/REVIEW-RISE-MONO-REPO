/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardHeader, CardContent, Typography, Box, Avatar, useTheme, alpha, Button, IconButton } from '@mui/material'

interface InsightProps {
    type: 'anomaly' | 'recommendation' | 'success'
    title: string
    description: string
    actionText?: string
    time: string
}

const InsightItem = ({ type, title, description, actionText, time }: InsightProps) => {
    const theme = useTheme()

    const getColors = () => {
        switch (type) {
            case 'anomaly': return { main: theme.palette.error.main, icon: 'tabler-alert-triangle' }
            case 'recommendation': return { main: theme.palette.primary.main, icon: 'tabler-bulb' }
            case 'success': return { main: theme.palette.success.main, icon: 'tabler-check' }
            default: return { main: theme.palette.info.main, icon: 'tabler-info-circle' }
        }
    }

    const colors = getColors()

    return (
        <Box sx={{
            display: 'flex',
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(colors.main, 0.2)}`,
            backgroundColor: alpha(colors.main, 0.03),
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: alpha(colors.main, 0.08) }
        }}>
            <Avatar
                sx={{
                    bgcolor: alpha(colors.main, 0.1),
                    color: colors.main,
                    mr: 2,
                    boxShadow: `0 0 10px ${alpha(colors.main, 0.2)}`
                }}
            >
                <i className={colors.icon} />
            </Avatar>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary">{time}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
                    {description}
                </Typography>
                {actionText && (
                    <Button
                        variant="outlined"
                        size="small"
                        color={type === 'anomaly' ? 'error' : 'primary'}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                    >
                        {actionText}
                    </Button>
                )}
            </Box>
        </Box>
    )
}

export default function AINerveCenterFeed() {
    const theme = useTheme()

    return (
        <Card sx={{ height: '100%' }}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="tabler-brain" style={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
                        {'AI Nerve Center'}
                    </Box>
                }
                subheader="Real-time insights and anomalies detected across your brand."
                action={
                    <IconButton size="small">
                        <i className="tabler-dots-vertical" />
                    </IconButton>
                }
            />
            <CardContent sx={{ pt: 0 }}>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(theme.palette.divider, 0.5), borderRadius: 3 } }}>

                    <InsightItem
                        type="anomaly"
                        title="Review Sentiment Drop"
                        description="Sentiment has dropped by 15% across 3 New York locations in the last 48 hours. Negative mentions of 'wait time' increased."
                        actionText="View Review Analysis"
                        time="2h ago"
                    />

                    <InsightItem
                        type="recommendation"
                        title="GBP Opportunity Detected"
                        description="Your 'Summer Sale' Facebook ad has a high CTR but Google Business Profile views are down. Consider publishing a GBP Offer post to capture local intent."
                        actionText="Generate GBP Post"
                        time="5h ago"
                    />

                    <InsightItem
                        type="success"
                        title="SEO Keyword Jump"
                        description="Your AI Visibility score for 'best coffee near me' jumped 4 positions. You are now ranking #2 in the local pack."
                        time="1d ago"
                    />

                    <InsightItem
                        type="recommendation"
                        title="Social Content Gap"
                        description="You haven't posted on LinkedIn this week. The AI Studio has generated 3 draft professional posts based on your recent blog article."
                        actionText="Review Drafts"
                        time="1d ago"
                    />

                </Box>
            </CardContent>
        </Card>
    )
}
