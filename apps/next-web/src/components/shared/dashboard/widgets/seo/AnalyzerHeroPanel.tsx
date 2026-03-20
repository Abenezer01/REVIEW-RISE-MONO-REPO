/* eslint-disable react/jsx-no-literals */
'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, Grid, Stack, Button, useTheme } from '@mui/material'

interface AnalyzerHeroPanelProps {
    score: number;
    issuesCount: number;
    criticalCount: number;
    loadTimeMs: number;
    onDownload?: () => void;
    onShare?: () => void;
}

export default function AnalyzerHeroPanel({
    score,
    issuesCount,
    criticalCount,
    loadTimeMs,
    onDownload,
    onShare
}: AnalyzerHeroPanelProps) {
    const theme = useTheme();

    const getScoreVerdict = (s: number) => {
        if (s >= 85) return { label: 'Excellent', color: theme.palette.success.main, bg: theme.palette.success.light + '20' }
        if (s >= 70) return { label: 'Good', color: theme.palette.success.main, bg: theme.palette.success.light + '20' }
        if (s >= 50) return { label: 'Fair', color: theme.palette.warning.main, bg: theme.palette.warning.light + '20' }

        return { label: 'Poor', color: theme.palette.error.main, bg: theme.palette.error.light + '20' }
    }

    const verdict = getScoreVerdict(score)

    return (
        <Card sx={{
            borderRadius: 3,
            mb: 3,
            bgcolor: theme.palette.background.paper,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${verdict.bg}`,
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                bgcolor: verdict.color
            }
        }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Grid container spacing={4} alignItems="center">

                    {/* Left: Score Hero */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
                                {'HEALTH SCORE'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1, mb: 2 }}>
                                <Typography variant="h1" fontWeight={900} sx={{
                                    color: verdict.color,
                                    fontFamily: 'monospace'
                                }}>
                                    {score}
                                </Typography>
                                <Typography variant="h4" color="text.secondary" sx={{ ml: 1, fontFamily: 'monospace' }}>
                                    {'/ 100'}
                                </Typography>
                            </Box>

                            <Box sx={{
                                display: 'inline-flex',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1.5,
                                bgcolor: verdict.bg,
                                color: verdict.color,
                                fontWeight: 700,
                                mb: 4
                            }}>
                                {verdict.label}
                            </Box>

                            <Stack spacing={1.5}>
                                <LegendItem color={theme.palette.error.main} label="Poor (0-49)" />
                                <LegendItem color={theme.palette.warning.main} label="Fair (50-69)" />
                                <LegendItem color={theme.palette.success.main} label="Good (70-84)" />
                                <LegendItem color={theme.palette.success.dark} label="Excellent (85-100)" />
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Right: Stats and CTAs */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Stack spacing={4}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 4 }}>
                                    <StatBox value={issuesCount} label="Total Issues" />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <StatBox
                                        value={criticalCount}
                                        label="Critical"
                                        color={theme.palette.error.main}
                                        bg={theme.palette.error.light + '15'}
                                    />
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <StatBox value={`${loadTimeMs}ms`} label="Load Time" />
                                </Grid>
                            </Grid>

                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                    onClick={onDownload}
                                    startIcon={<i className="tabler-download" />}
                                >
                                    {'Get Full Report'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="large"
                                    fullWidth
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                                    onClick={onShare}
                                    startIcon={<i className="tabler-share" />}
                                >
                                    {'Share'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 6, borderRadius: 1, bgcolor: color }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
        </Box>
    )
}

function StatBox({ value, label, color, bg }: { value: string | number, label: string, color?: string, bg?: string }) {
    const theme = useTheme();


    return (
        <Box sx={{
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${bg ? color : theme.palette.divider}`,
            bgcolor: bg || theme.palette.background.default,
            textAlign: 'center'
        }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: color || 'text.primary', mb: 0.5, fontFamily: 'monospace' }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
            </Typography>
        </Box>
    )
}
