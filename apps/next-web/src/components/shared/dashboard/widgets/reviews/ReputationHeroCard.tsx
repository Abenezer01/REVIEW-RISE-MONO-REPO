import React from 'react';
import { Card, Typography, Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useTranslation from '@/hooks/useTranslation';

// Icons placeholder
const GoogleIcon = () => <Typography variant="caption" sx={{ fontWeight: 'bold' }}>G</Typography>;
const YelpIcon = () => <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>Y</Typography>;
const FacebookIcon = () => <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>f</Typography>;

export default function ReputationHeroCard() {
    const theme = useTheme();
    const t = useTranslation('dashboard');

    return (
        <Card sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'stretch' }}>

                {/* Left: Overall Rating Block */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', flex: { lg: '0 0 auto' }, minWidth: { lg: 380 } }}>
                    <Box
                        sx={{
                            width: 100,
                            height: 120,
                            borderRadius: 3,
                            bgcolor: 'warning.main',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            boxShadow: `0 8px 16px ${theme.palette.warning.main}30`,
                            color: 'warning.contrastText'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                            4.8
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', lineHeight: 1.2, opacity: 0.9 }}>
                            {t('widgets.reputationHero.overallRating', { count: '1,247' })}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                            {t('widgets.reputationHero.excellentReputation')}
                        </Typography>
                        <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1.5, color: 'warning.dark', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>⚠️</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                                {t('widgets.reputationHero.unansweredWarning', { count: 12, percent: 5 })}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Middle: Response Metrics (Flex container for 2 boxes) */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flex: { lg: 1 } }}>

                    {/* Response Rate */}
                    <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                            {t('widgets.reputationHero.responseRate')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>94%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: 'success.dark', opacity: 0.2, height: 4, borderRadius: 2, position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '94%', bgcolor: 'success.main', borderRadius: 2 }} />
                        </Box>
                    </Box>

                    {/* Avg Response Time */}
                    <Box sx={{ flex: 1, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>
                            {t('widgets.reputationHero.avgResponseTime')}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>2.4h</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {t('widgets.reputationHero.industryAvg', { avg: '8.2h' })}
                        </Typography>
                    </Box>

                </Box>

                {/* Right: Positive Sentiment & Platform Breakdown */}
                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, flex: { lg: 1.2 }, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.5, fontWeight: 700, letterSpacing: 0.5, display: 'block' }}>
                                {t('widgets.reputationHero.positiveSentiment')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>92%</Typography>
                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                                    {t('widgets.reputationHero.sentimentIncrease', { value: 3.2 })}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
                            😁
                        </Box>
                    </Box>

                    <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <GoogleIcon />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>4.9</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {t('widgets.reputationHero.platformReviews', { count: 847 })}
                                </Typography>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <YelpIcon />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>4.7</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {t('widgets.reputationHero.platformReviews', { count: 289 })}
                                </Typography>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <FacebookIcon />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>4.6</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    {t('widgets.reputationHero.platformReviews', { count: 111 })}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

            </Box>
        </Card>
    );
}
