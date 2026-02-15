'use client';

import React from 'react';

import {
    Box,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Stack,
    Typography,
    alpha,
    useTheme
} from '@mui/material';

import type { LandingPageAnalysis } from '@platform/contracts';

import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    analysis?: LandingPageAnalysis;
}

export default function ResultsLandingPage({ analysis }: Props) {
    const t = useTranslation('blueprint');
    const theme = useTheme();

    if (!analysis) {
        return null;
    }

    const getScoreColor = (score: number, isScale10 = false) => {
        const value = isScale10 ? score * 10 : score;
        if (value >= 80) return theme.palette.success.main;
        if (value >= 60) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const scoreColor = getScoreColor(analysis.score);
    const qsColor = getScoreColor(analysis.qualityScorePrediction || 0, true);

    return (
        <Card
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: theme.shadows[4],
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <CardContent sx={{ p: 0 }}>
                {/* Header with Type Badge */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}
                        >
                            🎯
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {t('results.landingPage.title')}
                                </Typography>
                                <Chip
                                    label={(analysis.landingPageType || 'Web Page').toUpperCase()}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                                />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                                {analysis.url}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* Top Strategic Metrics Grid */}
                    <Box
                        display="grid"
                        gridTemplateColumns={{ xs: '1fr', md: '1fr 1.5fr' }}
                        gap={3}
                        sx={{ mb: 4 }}
                    >
                        {/* Quality Score Tooltip Style Box */}
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: alpha(qsColor, 0.05),
                                border: `1px solid ${alpha(qsColor, 0.2)}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="overline" sx={{ fontWeight: 700, color: qsColor, letterSpacing: 1 }}>
                                Google Ads Quality Score
                            </Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800, color: qsColor, my: 1 }}>
                                {analysis.qualityScorePrediction || 0}<Typography component="span" variant="h5" sx={{ opacity: 0.6 }}>/10</Typography>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Predicted based on relevance, CTR, and experience logic.
                            </Typography>
                        </Box>

                        {/* Conversion & Friction */}
                        <Stack spacing={2} justifyContent="center">
                            <Box>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>🚀 Conversion Readiness</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                        {analysis.conversionReadinessScore || 0}/10
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analysis.conversionReadinessScore || 0) * 10}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }}
                                />
                            </Box>
                            <Box>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>🛑 Conversion Friction</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                                        {analysis.frictionScore || 0}/10
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analysis.frictionScore || 0) * 10}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.error.main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: 'error.main' } }}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    {/* Recommendations Section (Gems) */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <Box sx={{ mb: 4, p: 2.5, bgcolor: alpha(theme.palette.warning.main, 0.03), borderRadius: 2, border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                💡 Strategic Recommendations
                            </Typography>
                            <Stack spacing={1.5}>
                                {analysis.recommendations.map((rec, i) => (
                                    <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                                        <Typography variant="body2" sx={{ color: 'warning.dark' }}>•</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                            {rec}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Secondary Metrics Grid */}
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                        {/* Trust Signals */}
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5, textTransform: 'uppercase' }}>
                                Trust & Authority
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {(analysis.trustSignalsDetected || []).map((signal, i) => (
                                    <Chip
                                        key={i}
                                        label={signal}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.success.main, 0.05),
                                            color: 'success.dark',
                                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        {/* Missing/Warnings */}
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5, textTransform: 'uppercase' }}>
                                Optimization Gaps
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {(analysis.missingElements || []).map((el, i) => (
                                    <Chip
                                        key={i}
                                        label={el}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.error.main, 0.05),
                                            color: 'error.dark',
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
