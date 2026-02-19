'use client'

import React from 'react'

import { Box, Typography, Card, CardContent, Button, Divider } from '@mui/material'

import { useTranslation } from '@/hooks/useTranslation'

interface PlanSidebarProps {
    totalPosts: number
    platformCounts: Record<string, number>
}

export default function PlanSidebar({ totalPosts, platformCounts }: PlanSidebarProps) {
    const t = useTranslation('studio')

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* AI Suggestions */}
            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#FFC1070A', borderColor: '#FFC10750' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <i className="tabler-bulb" style={{ color: '#FFB300', fontSize: 24 }} />
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">{t('planner.sidebar.aiSuggestions')}</Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t.raw('planner.sidebar.engagementTip') }} />
                        <Button 
                            endIcon={<i className="tabler-arrow-right" />} 
                            sx={{ color: '#FFB300', fontWeight: 'bold', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                        >
                            {t('planner.sidebar.applyChanges')}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: '#FFC10720' }} />

                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t.raw('planner.sidebar.videoTip') }} />
                         <Button 
                            endIcon={<i className="tabler-arrow-right" />} 
                            sx={{ color: '#FFB300', fontWeight: 'bold', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                        >
                            {t('planner.sidebar.generateVideos')}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Plan Overview Stats */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" mb={3}>{t('planner.sidebar.planOverview')}</Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography color="text.secondary">{t('planner.sidebar.totalPosts')}</Typography>
                        <Typography fontWeight="bold">{totalPosts}</Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Object.entries(platformCounts).map(([platform, count]) => (
                            <Box key={platform} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">{platform}</Typography>
                                <Typography fontWeight="bold">{count}</Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
