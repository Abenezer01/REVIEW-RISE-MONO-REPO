'use client';

import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Alert,
    Stack,
    Card,
    CardContent
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { CampaignPlan } from '@platform/campaign-engine';

interface SimulatorResultsProps {
    plan: CampaignPlan;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const SimulatorResults = ({ plan }: SimulatorResultsProps) => {
    const t = useTranslations('simulator');

    return (
        <Paper sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    {t('funnel.generated_plan')}
                </Typography>
                {plan.warnings.length > 0 && (
                    <Chip
                        icon={<WarningAmberIcon />}
                        label={t('funnel.optimization_needed')}
                        color="warning"
                        variant="outlined"
                        size="small"
                    />
                )}
            </Stack>

            {plan.warnings.map((warn, i) => (
                <Alert severity="warning" key={i} sx={{ mb: 2 }}>{warn}</Alert>
            ))}

            <Grid container spacing={3}>
                {/* Chart Section */}
                <Grid size={{xs:12,md:6}}>
                    <Typography variant="subtitle2" gutterBottom align="center">
                        {t('charts.channel_mix')}
                    </Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={plan.channels}
                                    dataKey="allocationPercentage"
                                    nameKey="channel"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                >
                                    {plan.channels.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Grid>

                {/* Funnel Visualizer */}
                <Grid size={{xs:12,md:6}}>
                    <Stack spacing={1}>
                        {plan.campaigns.some(c => c.stage === 'Awareness') && (
                            <Card variant="outlined" sx={{ borderTop: '4px solid #00C49F', bgcolor: 'background.paper' }}>
                                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">{t('funnel.awareness').toUpperCase()}</Typography>
                                    <Typography variant="body2">{plan.campaigns.find(c => c.stage === 'Awareness')?.description.split('|')[0]}</Typography>
                                </CardContent>
                            </Card>
                        )}
                        {plan.campaigns.some(c => c.stage === 'Consideration') && (
                            <Card variant="outlined" sx={{ borderTop: '4px solid #0088FE', bgcolor: 'background.paper', ml: 2, mr: 2 }}>
                                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">{t('funnel.consideration').toUpperCase()}</Typography>
                                    <Typography variant="body2">{plan.campaigns.find(c => c.stage === 'Consideration')?.description.split('|')[0]}</Typography>
                                </CardContent>
                            </Card>
                        )}
                        <Card variant="outlined" sx={{ borderTop: '4px solid #FF8042', bgcolor: 'background.paper', ml: 4, mr: 4 }}>
                            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">{t('funnel.conversion').toUpperCase()}</Typography>
                                <Typography variant="body2">{plan.campaigns.find(c => c.stage === 'Conversion')?.description.split('|')[0]}</Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Execution Checklist */}
                <Grid size={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                        {t('checklist.title')}
                    </Typography>
                    <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                        {plan.execution_steps.map((step, idx) => (
                            <ListItem key={idx}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircleIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={step} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </Paper>
    );
};
