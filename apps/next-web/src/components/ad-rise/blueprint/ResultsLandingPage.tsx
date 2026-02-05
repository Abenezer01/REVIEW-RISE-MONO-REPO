'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Chip,
    LinearProgress,
    alpha,
    useTheme
} from '@mui/material';
import { LandingPageAnalysis } from '@platform/contracts';

interface Props {
    analysis?: LandingPageAnalysis;
}

export default function ResultsLandingPage({ analysis }: Props) {
    const theme = useTheme();

    if (!analysis) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return theme.palette.success.main;
        if (score >= 60) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const scoreColor = getScoreColor(analysis.score);

    return (
        <Card
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: theme.shadows[2]
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="h6">📊</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Landing Page Analysis
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {analysis.url}
                        </Typography>
                    </Box>
                </Stack>

                {/* Score Section */}
                <Box
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: alpha(scoreColor, 0.05),
                        borderRadius: 2,
                        border: `1px solid ${alpha(scoreColor, 0.2)}`
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={3}>
                        {/* Circular Score */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: 100,
                                height: 100,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    border: `8px solid ${alpha(scoreColor, 0.2)}`
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    border: `8px solid ${scoreColor}`,
                                    borderTopColor: 'transparent',
                                    borderRightColor: 'transparent',
                                    transform: `rotate(${(analysis.score / 100) * 360}deg)`,
                                    transition: 'transform 1s ease'
                                }}
                            />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: scoreColor }}>
                                {analysis.score}
                            </Typography>
                        </Box>

                        {/* Score Details */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Overall Match Quality
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {analysis.score >= 80 && 'Excellent! Your landing page is well-optimized for this campaign.'}
                                {analysis.score >= 60 && analysis.score < 80 && 'Good, but there\'s room for improvement.'}
                                {analysis.score < 60 && 'Consider optimizing your landing page for better ad performance.'}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={analysis.score}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha(scoreColor, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: scoreColor,
                                        borderRadius: 4
                                    }
                                }}
                            />
                        </Box>
                    </Stack>
                </Box>

                {/* Page Checklist */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Page Checklist
                    </Typography>
                    <Stack spacing={1.5}>
                        {/* Mobile Optimized */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1.5,
                                bgcolor: analysis.mobileOptimized
                                    ? alpha(theme.palette.success.main, 0.05)
                                    : alpha(theme.palette.error.main, 0.05),
                                borderRadius: 1,
                                border: `1px solid ${analysis.mobileOptimized
                                    ? alpha(theme.palette.success.main, 0.2)
                                    : alpha(theme.palette.error.main, 0.2)
                                    }`
                            }}
                        >
                            <Typography sx={{ mr: 1 }}>
                                {analysis.mobileOptimized ? '✓' : '✗'}
                            </Typography>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                Mobile Optimized
                            </Typography>
                            <Chip
                                label={analysis.mobileOptimized ? 'Passed' : 'Failed'}
                                size="small"
                                color={analysis.mobileOptimized ? 'success' : 'error'}
                                sx={{ fontWeight: 500 }}
                            />
                        </Box>
                    </Stack>
                </Box>

                {/* Trust Signals */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                        ✓ Detected Trust Signals ({analysis.trustSignalsDetected?.length || 0})
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {(analysis.trustSignalsDetected || []).map((signal, i) => (
                            <Chip
                                key={i}
                                label={signal}
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: 'success.dark',
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                    fontWeight: 500
                                }}
                            />
                        ))}
                    </Stack>
                </Box>

                {/* Missing Elements */}
                {analysis.missingElements && analysis.missingElements.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
                            ⚠ Recommended Trust Elements ({analysis.missingElements.length})
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {analysis.missingElements.map((el, i) => (
                                <Chip
                                    key={i}
                                    label={el}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        color: 'warning.dark',
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                        fontWeight: 500
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
