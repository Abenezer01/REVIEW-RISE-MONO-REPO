'use client';

import React from 'react';
import { Box, Card, Chip, Grid, Stack, Typography, useTheme, alpha } from '@mui/material';
import {
    TrendingUp,
    Gavel,
    AdsClick,
    Layers,
    MonetizationOn
} from '@mui/icons-material';
import type { StrategySummary, BudgetModeling } from '@platform/contracts';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    strategy: StrategySummary;
    budget: BudgetModeling;
}

export default function ResultsStrategy({ strategy, budget }: Props) {
    const t = useTranslation('blueprint');
    const theme = useTheme();

    const getBudgetColor = (tier: string) => {
        switch (tier) {
            case 'High': return 'success';
            case 'Medium': return 'primary';
            case 'Low': return 'warning';
            default: return 'default';
        }
    };

    const MetricCard = ({ icon: Icon, title, value, subtext, color = 'primary.main' }: any) => (
        <Card sx={{ p: 2, height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    opacity: 0.1,
                    transform: 'rotate(-15deg)'
                }}
            >
                <Icon sx={{ fontSize: 80, color }} />
            </Box>
            <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Icon sx={{ color }} />
                    <Typography variant="subtitle2" color="text.secondary">
                        {title}
                    </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="600">
                    {value}
                </Typography>
                {subtext && (
                    <Typography variant="caption" color="text.secondary">
                        {subtext}
                    </Typography>
                )}
            </Stack>
        </Card>
    );

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                {t('results.strategyTitle')}
            </Typography>

            <Grid container spacing={3}>
                {/* Goal & Bid Strategy */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: 3, height: '100%', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('results.campaignGoal')}
                                </Typography>
                                <Typography variant="h6" fontWeight="600" color="primary.main">
                                    {strategy.goal}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('results.bidStrategy')}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Gavel fontSize="small" color="action" />
                                    <Typography variant="h6" fontWeight="600">
                                        {strategy.bidStrategy}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('results.vertical')}
                                </Typography>
                                <Chip label={strategy.vertical} size="small" variant="outlined" />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* Budget Overview */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <MetricCard
                        icon={MonetizationOn}
                        title={t('results.totalBudget')}
                        value={`$${strategy.totalBudget.toLocaleString()}`}
                        subtext={`${t('results.budgetTier')}: ${budget.budgetTier}`}
                        color={theme.palette.success.main}
                    />
                </Grid>

                {/* Performance Modeling */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <MetricCard
                        icon={AdsClick}
                        title={t('results.clickCapacity')}
                        value={`~${budget.clickCapacity}`}
                        subtext={t('results.clickCapacitySub')}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <MetricCard
                        icon={Layers}
                        title={t('results.campaignCount')}
                        value={budget.recommendedCampaignCount}
                        subtext={t('results.campaignCountSub')}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
