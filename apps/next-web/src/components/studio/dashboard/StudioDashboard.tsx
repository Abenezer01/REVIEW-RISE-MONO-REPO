'use client'

import React from 'react'

import { Grid, Typography, Box, Button, Paper } from '@mui/material'
import { useTranslations } from 'next-intl'

import ToolCard from './ToolCard'
import RecentGenerations from './RecentGenerations'
import CreditUsage from './CreditUsage'

interface StudioDashboardProps {
    onNavigate: (view: number) => void
}

export default function StudioDashboard({ onNavigate }: StudioDashboardProps) {
    const t = useTranslations('studio')

    return (
        <Grid container spacing={4}>
            {/* Header / Hero */}
            <Grid size={12}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: { xs: 4, md: 6 }, 
                        borderRadius: 4, 
                        background: 'linear-gradient(120deg, #1A237E 0%, #311B92 40%, #D81B60 100%)', // Vibrant Nebula Gradient
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 4
                    }}
                >
                    {/* Background Overlay */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)', pointerEvents: 'none' }} />

                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '100%', md: '60%' } }}>
                        <Typography variant="h2" fontWeight="900" mb={2} sx={{ 
                            background: '-webkit-linear-gradient(45deg, #FFFFFF 30%, #FF80AB 90%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}>
                            {t('dashboard.heroTitle')}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.25rem' }, color: 'inherit' }}>
                            {t('dashboard.heroSubtitle')}
                        </Typography>
                        <Box sx={{ mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 2 }}>
                                <i className="tabler-wand" style={{ color: '#69F0AE' }} />
                                <Typography variant="body2" fontWeight="bold" color="inherit">8 AI Tools</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 2 }}>
                                <i className="tabler-devices" style={{ color: '#69F0AE' }} />
                                <Typography variant="body2" fontWeight="bold" color="inherit">Multi-Platform</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 2 }}>
                                <i className="tabler-bolt" style={{ color: '#69F0AE' }} />
                                <Typography variant="body2" fontWeight="bold" color="inherit">Instant Results</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Illustration / Icon */}
                    <Box sx={{ 
                        width: 240, 
                        height: 240, 
                        mt: { xs: 4, md: 0 },
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            animation: 'pulse 3s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(0.95)', opacity: 0.5 },
                                '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                                '100%': { transform: 'scale(0.95)', opacity: 0.5 }
                            }
                        }} />
                        <Box sx={{ 
                            width: 140, 
                            height: 140, 
                            bgcolor: 'rgba(255,255,255,0.15)', 
                            backdropFilter: 'blur(20px)',
                            borderRadius: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            transform: 'rotate(-10deg) translateY(-10px)'
                        }}>
                            <i className="tabler-brain" style={{ fontSize: 72, color: 'white' }} />
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Tools Title */}
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="h5" fontWeight="bold">{t('dashboard.toolsTitle')}</Typography>
                <Button endIcon={<i className="tabler-arrow-right" />}>{t('dashboard.viewAll')}</Button>
            </Grid>

            {/* Tools Grid */}
            <Grid size={{sm: 12, md: 8}}>
                <Grid container spacing={3}>
                    <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('captions.title')}
                            description={t('captions.subtitle')}
                            icon={<i className="tabler-wand" style={{ fontSize: 24 }} />}
                            color="#9C27B0"
                            stats={[
                                { label: 'Variations', value: '3-5' },
                                { label: 'Generated', value: '1,247' }
                            ]}
                            isPopular
                            onClick={() => onNavigate(0)}
                        />
                    </Grid>
                    <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('hashtags.title')}
                            description={t('hashtags.subtitle')}
                            icon={<i className="tabler-hash" style={{ fontSize: 24 }} />}
                            color="#2196F3"
                            stats={[
                                { label: 'Hashtags', value: '20-30' },
                                { label: 'Generated', value: '892' }
                            ]}
                            onClick={() => onNavigate(1)}
                        />
                    </Grid>
                    <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('ideas.title')}
                            description={t('ideas.subtitle')}
                            icon={<i className="tabler-bulb" style={{ fontSize: 24 }} />}
                            color="#4CAF50"
                            stats={[
                                { label: 'Ideas', value: '10+' },
                                { label: 'Generated', value: '634' }
                            ]}
                            onClick={() => onNavigate(2)}
                        />
                    </Grid>
                     <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('planner.title')}
                            description={t('planner.subtitle')}
                            icon={<i className="tabler-calendar" style={{ fontSize: 24 }} />}
                            color="#FF9800"
                            stats={[
                                { label: 'Days', value: '30' },
                                { label: 'Generated', value: '156' }
                            ]}
                            isNew
                            onClick={() => onNavigate(3)}
                        />
                    </Grid>
                     <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('images.title')}
                            description={t('images.subtitle')}
                            icon={<i className="tabler-photo" style={{ fontSize: 24 }} />}
                            color="#E91E63"
                            stats={[
                                { label: 'Variations', value: '3' },
                                { label: 'Generated', value: '423' }
                            ]}
                            onClick={() => onNavigate(4)}
                        />
                    </Grid>
                    <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('carousels.title')}
                            description={t('carousels.subtitle')}
                            icon={<i className="tabler-slideshow" style={{ fontSize: 24 }} />}
                            color="#00BCD4"
                            stats={[
                                { label: 'Slides', value: '5-8' },
                                { label: 'Generated', value: '289' }
                            ]}
                            onClick={() => onNavigate(5)}
                        />
                    </Grid>
                    <Grid size={{sm: 12, md: 6}}>
                        <ToolCard 
                            title={t('scripts.title')}
                            description={t('scripts.subtitle')}
                            icon={<i className="tabler-movie" style={{ fontSize: 24 }} />}
                            color="#F44336"
                            stats={[
                                { label: 'Types', value: '3' },
                                { label: 'Generated', value: '112' }
                            ]}
                            onClick={() => onNavigate(6)}
                        />
                    </Grid>
                </Grid>
            </Grid>

            {/* Sidebar */}
            <Grid size={{sm: 12, md: 4}}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <CreditUsage />
                    <RecentGenerations />
                </Box>
            </Grid>
        </Grid>
    )
}
