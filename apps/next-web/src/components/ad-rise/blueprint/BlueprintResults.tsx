'use client';

import React from 'react';

import { Alert, Box, Button, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

import type { BlueprintOutput } from '@platform/contracts';

import { useTranslation } from '@/hooks/useTranslation';

import ResultsAdGroups from './ResultsAdGroups';
import ResultsKeywords from './ResultsKeywords';
import ResultsLandingPage from './ResultsLandingPage';
import ResultsNegatives from './ResultsNegatives';

interface Props {
    results: BlueprintOutput | null;
}

export default function BlueprintResults({ results }: Props) {
    const t = useTranslation('blueprint');
    const theme = useTheme();

    if (!results) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="info">{t('results.noBlueprint')}</Alert>
            </Box>
        );
    }

    const handleExport = (format: 'pdf' | 'csv' | 'google-ads') => {
        // TODO: Implement export functionality
        console.log(`Exporting as ${format}`);
        alert(`Export as ${format.toUpperCase()} - Coming soon!`);
    };

    return (
        <Box>
            {/* Success Banner */}
            <Paper
                elevation={0}
                sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    borderRadius: 2,
                    p: 3,
                    mb: 4
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'success.contrastText'
                        }}
                    >
                        <Typography variant="h5">✓</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.dark' }}>
                            {t('results.successTitle')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('results.successText')}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleExport('csv')}
                        >
                            {t('results.exportCsv')}
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleExport('google-ads')}
                        >
                            {t('results.exportGoogleAds')}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* Results Sections */}
            <Stack spacing={3}>
                {/* Keywords Section */}
                <ResultsKeywords clusters={results.clusters} />

                {/* Landing Page Analysis */}
                {results.landingPageAnalysis && (
                    <ResultsLandingPage analysis={results.landingPageAnalysis} />
                )}

                {/* Ad Groups Section */}
                <ResultsAdGroups adGroups={results.adGroups} />

                {/* Negative Keywords Section */}
                <ResultsNegatives negatives={results.negatives} />
            </Stack>

            {/* Bottom Actions */}
            <Paper
                elevation={0}
                sx={{
                    mt: 4,
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {t('results.support')}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={() => window.print()}>
                            {t('results.print')}
                        </Button>
                        <Button variant="contained" onClick={() => handleExport('pdf')}>
                            {t('results.pdf')}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}
