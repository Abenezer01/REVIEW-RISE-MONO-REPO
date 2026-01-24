'use client'

import React from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

const MOCK_SAVED_SETS = [
    { title: 'Fitness Campaign', count: 30 },
    { title: 'Product Launch', count: 25 },
    { title: 'Holiday Sale', count: 28 }
]

interface HashtagSidebarProps {
    insights?: {
        reach: string
        engagement: string
        competition: string
    }
}

export default function HashtagSidebar({ insights }: HashtagSidebarProps) {
    const defaultInsights = insights || {
        reach: '2.4M',
        engagement: '4.2%',
        competition: 'Medium'
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Insights Card */}
            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <i className="tabler-chart-line" style={{ color: '#4CAF50' }} />
                        <Typography variant="h6" fontWeight="bold">Hashtag Insights</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                                <i className="tabler-eye" style={{ color: '#4CAF50' }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">EST. REACH</Typography>
                                <Typography variant="h6" fontWeight="bold">{defaultInsights.reach}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                                <i className="tabler-users" style={{ color: '#2196F3' }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">ENGAGEMENT RATE</Typography>
                                <Typography variant="h6" fontWeight="bold">{defaultInsights.engagement}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255, 152, 0, 0.1)' }}>
                                <i className="tabler-trophy" style={{ color: '#FF9800' }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">COMPETITION</Typography>
                                <Typography variant="h6" fontWeight="bold">{defaultInsights.competition}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Saved Sets */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>Saved Sets</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {MOCK_SAVED_SETS.map((set, i) => (
                            <Box 
                                key={i} 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    p: 1.5, 
                                    borderRadius: 1, 
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover' } 
                                }}
                            >
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{set.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{set.count} hashtags</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton size="small">
                                        <i className="tabler-copy" style={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton size="small">
                                        <i className="tabler-trash" style={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
