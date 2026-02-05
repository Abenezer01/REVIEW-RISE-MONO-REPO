'use client';

import React from 'react';
import { Box, Typography, Alert, Paper, Stack, Button, Divider, alpha, useTheme } from '@mui/material';
import { BlueprintOutput } from '@platform/contracts';
import ResultsKeywords from './ResultsKeywords';
import ResultsAdGroups from './ResultsAdGroups';
import ResultsNegatives from './ResultsNegatives';
import ResultsLandingPage from './ResultsLandingPage';

interface Props {
    results: BlueprintOutput | null;
}

export default function BlueprintResults({ results }: Props) {
    const theme = useTheme();

    if (!results) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="info">No blueprint generated yet.</Alert>
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
                            Your Google Ads Blueprint is Ready
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Review your campaign structure, keywords, and ad copy below
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleExport('csv')}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleExport('google-ads')}
                        >
                            Export to Google Ads
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
                        Need help implementing this blueprint? Contact our support team.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={() => window.print()}>
                            Print Blueprint
                        </Button>
                        <Button variant="contained" onClick={() => handleExport('pdf')}>
                            Download PDF
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}
