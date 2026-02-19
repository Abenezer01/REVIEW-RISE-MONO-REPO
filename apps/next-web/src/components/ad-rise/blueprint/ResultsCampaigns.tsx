'use client';

import React from 'react';
import {
    Box,
    Chip,
    Stack,
    Typography,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Divider
} from '@mui/material';
import { ExpandMore, Campaign as CampaignIcon, GroupWork, Percent } from '@mui/icons-material';
import type { Campaign } from '@platform/contracts';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    campaigns: Campaign[];
}

export default function ResultsCampaigns({ campaigns }: Props) {
    const t = useTranslation('blueprint');
    const theme = useTheme();

    if (!campaigns || campaigns.length === 0) {
        return null; // Or show a default state
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CampaignIcon color="secondary" />
                {t('results.campaignStructureTitle')}
            </Typography>

            <Stack spacing={2}>
                {campaigns.map((campaign, index) => (
                    <Accordion key={index} defaultExpanded={true} sx={{
                        '&:before': { display: 'none' }, // Remove default before line
                        boxShadow: 1,
                        borderRadius: 2
                    }}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" sx={{ pr: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: 'secondary.main',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="600">
                                            {campaign.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {campaign.objective}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Chip
                                    icon={<Percent style={{ fontSize: 16 }} />}
                                    label={`${campaign.budgetRecommendation} ${t('results.totalBudget')}`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                />
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        {t('results.adGroups.objective')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="500">
                                        {campaign.objective}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <GroupWork fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {t('results.adGroups.included', { count: campaign.adGroups?.length || 0 })}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* Preview of Ad Groups contained */}
                            {campaign.adGroups && campaign.adGroups.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Divider sx={{ mb: 1, borderStyle: 'dashed' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        {t('results.adGroups.summary')}
                                    </Typography>
                                    <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                                        {campaign.adGroups.slice(0, 5).map((ag, i) => (
                                            <Chip key={i} label={ag.name} size="small" />
                                        ))}
                                        {campaign.adGroups.length > 5 && (
                                            <Chip label={`+${campaign.adGroups.length - 5} ${t('results.adGroups.more')}`} size="small" variant="outlined" />
                                        )}
                                    </Stack>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Stack>
        </Box>
    );
}
