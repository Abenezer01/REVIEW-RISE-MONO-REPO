'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme, alpha } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Collapse } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useBusinessId } from '@/hooks/useBusinessId';
import type { BrandRecommendation} from '@/services/brand.service';
import { BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

// Extended interface for UI-only fields (mocked for now)
interface ExtendedRecommendation extends BrandRecommendation {
    targetKPI?: string;
    targetMetric?: string;
    timeEstimate?: string;
    priorityLabel?: string;
}

const RecommendationsPage = () => {
    const t = useTranslations('dashboard');
    const tc = useTranslations('common');
    const { businessId, loading: businessLoading } = useBusinessId();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<ExtendedRecommendation[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [generating, setGenerating] = useState(false);

    const fetchRecommendations = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);

        try {
            const data = await BrandService.getRecommendations(businessId);
            
            // Enrich with mock data for UI demo
            const enriched = data.map(rec => ({
                ...rec,
                targetKPI: rec.impact === 'high' ? '+12%' : rec.impact === 'medium' ? '+5%' : '+2%',
                targetMetric: rec.category === 'search' ? 'Visibility Score' : rec.category === 'reputation' ? 'Trust Score' : 'Monthly Traffic',
                timeEstimate: rec.effort === 'low' ? '~30 minutes' : rec.effort === 'medium' ? '~45 minutes' : '~6 hours',
                priorityLabel: rec.priorityScore > 85 ? 'HIGH PRIORITY' : rec.priorityScore > 50 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'
            }));

            setRecommendations(enriched);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (businessLoading) return;
        
        if (!businessId) {
            setLoading(false);
            
return;
        }

        fetchRecommendations();
    }, [businessId, businessLoading, fetchRecommendations]);

    const handleGenerate = async () => {
        if (!businessId) return;
        setGenerating(true);

        try {
            await BrandService.generateRecommendations(businessId, 'search');
            setTimeout(() => {
                setGenerating(false);
                fetchRecommendations();
            }, 3000);
        } catch (error) {
            console.error('Failed to generate recommendations', error);
            setGenerating(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            if (!businessId) return;
            await BrandService.updateRecommendationStatus(businessId, id, newStatus);
            fetchRecommendations();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const sortedRecommendations = [...recommendations].sort((a, b) => {
        return sortOrder === 'desc' 
            ? b.priorityScore - a.priorityScore 
            : a.priorityScore - b.priorityScore;
    });

    const filteredRecommendations = sortedRecommendations.filter(rec => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'high_impact') return rec.impact === 'high' || rec.impact === 'critical';
        
        // Status matching
        if (filterStatus === 'open') return rec.status === 'open';
        if (filterStatus === 'in_progress') return rec.status === 'in_progress';
        if (filterStatus === 'completed') return rec.status === 'completed';
        
        return true;
    });

    const counts = {
        all: recommendations.length,
        highImpact: recommendations.filter(r => r.impact === 'high' || r.impact === 'critical').length,
        open: recommendations.filter(r => r.status === 'open').length,
        inProgress: recommendations.filter(r => r.status === 'in_progress').length,
        done: recommendations.filter(r => r.status === 'completed').length,
    };

    return (
        <Stack spacing={4}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="bold">{t('brandRise.tabs.recommendations')}</Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('brandRise.recommendations.actionableCount', { count: recommendations.length })}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        startIcon={<Icon icon="tabler-download" fontSize={20} />}
                        sx={{ color: 'text.secondary', borderColor: 'divider' }}
                    >
                        {tc('common.export')}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Icon icon="tabler-wand" fontSize={20} />}
                        onClick={handleGenerate}
                        disabled={generating}
                        sx={{ 
                            background: 'linear-gradient(45deg, #FF9F43 0%, #FF6B6B 100%)',
                            color: 'white',
                            boxShadow: '0px 4px 12px rgba(255, 107, 107, 0.4)'
                        }}
                    >
                        {generating ? tc('common.loading') : t('brandRise.recommendations.generateNew')}
                    </Button>
                </Stack>
            </Stack>

            {/* Filter Bar */}
            <Card sx={{ p: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ToggleButtonGroup
                        value={filterStatus}
                        exclusive
                        onChange={(e, v) => v && setFilterStatus(v)}
                        size="small"
                        sx={{ 
                            '& .MuiToggleButton-root': { 
                                border: 'none', 
                                borderRadius: 1, 
                                px: 2, 
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 500,
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                }
                            } 
                        }}
                    >
                        <ToggleButton value="all">
                            <Box component="span" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), color: theme.palette.warning.main, px: 0.8, borderRadius: 0.5, mr: 1, fontSize: '0.75rem' }}>{counts.all}</Box>
                            {tc('common.all')}
                        </ToggleButton>
                        <ToggleButton value="high_impact">
                            <Box component="span" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, px: 0.8, borderRadius: 0.5, mr: 1, fontSize: '0.75rem' }}>{counts.highImpact}</Box>
                            {t('aiVisibility.tips.impact.High')}
                        </ToggleButton>
                        <ToggleButton value="open">
                            <Box component="span" sx={{ bgcolor: 'action.selected', color: 'text.secondary', px: 0.8, borderRadius: 0.5, mr: 1, fontSize: '0.75rem' }}>{counts.open}</Box>
                            {t('status.pending')}
                        </ToggleButton>
                        <ToggleButton value="in_progress">
                            <Box component="span" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, px: 0.8, borderRadius: 0.5, mr: 1, fontSize: '0.75rem' }}>{counts.inProgress}</Box>
                            {t('status.processing')}
                        </ToggleButton>
                        <ToggleButton value="completed">
                            <Box component="span" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, px: 0.8, borderRadius: 0.5, mr: 1, fontSize: '0.75rem' }}>{counts.done}</Box>
                            {t('status.completed')}
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Button 
                        startIcon={<Icon icon={sortOrder === 'desc' ? "tabler-sort-descending" : "tabler-sort-ascending"} fontSize={18} />} 
                        size="small"
                        color="inherit"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        sx={{ color: 'text.secondary' }}
                    >
                        {t('brandRise.recommendations.sortPriority')}
                    </Button>
                </Stack>
            </Card>

            {/* List */}
            {loading ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                    <CircularProgress />
                </Box>
            ) : filteredRecommendations.length === 0 ? (
                <Card sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">{t('brandRise.recommendations.noFound')}</Typography>
                </Card>
            ) : (
                <Stack spacing={3}>
                    {filteredRecommendations.map((rec) => (
                        <RecommendationCard 
                            key={rec.id} 
                            rec={rec} 
                            theme={theme} 
                            onUpdateStatus={handleStatusUpdate} 
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
};



const RecommendationCard = ({ rec, theme, onUpdateStatus }: { rec: ExtendedRecommendation, theme: any, onUpdateStatus: (id: string, status: string) => void }) => {
    const t = useTranslations('dashboard');
    const tc = useTranslations('common');
    const isHighPriority = rec.priorityScore > 80;
    const [expanded, setExpanded] = useState(false);

    return (
        <Card sx={{ 
            p: 0, 
            bgcolor: alpha(theme.palette.background.paper, 0.6), // Slightly elegant bg
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
            <Box sx={{ p: 3 }}>
                {/* Card Header badges */}
                <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Stack direction="row" spacing={1}>
                        <Chip 
                            label={rec.priorityLabel} 
                            size="small"
                            sx={{ 
                                borderRadius: 1, 
                                bgcolor: isHighPriority ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.warning.main, 0.1), 
                                color: isHighPriority ? theme.palette.error.main : theme.palette.warning.main,
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                            }} 
                        />
                        <Chip 
                            label={rec.category.toUpperCase().replace('_', ' ')} 
                            size="small"
                            sx={{ 
                                borderRadius: 1, 
                                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                            }} 
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Chip 
                            label={rec.status === 'in_progress' ? t('status.processing') : rec.status === 'completed' ? t('status.completed') : t('status.pending')}
                            color={rec.status === 'in_progress' ? 'warning' : rec.status === 'completed' ? 'success' : 'primary'}
                            variant={rec.status === 'open' ? 'outlined' : 'filled'}
                            size="small" 
                        />
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 50 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={rec.priorityScore} 
                                sx={{ 
                                    width: 40, 
                                    height: 6, 
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette[isHighPriority ? 'error' : 'success'].main, 0.2),
                                    '& .MuiLinearProgress-bar': { bgcolor: isHighPriority ? theme.palette.error.main : theme.palette.success.main }
                                }} 
                            />
                            <Typography variant="caption" fontWeight="bold" color="success.main">{rec.priorityScore}%</Typography>
                        </Stack>
                    </Stack>
                </Stack>

                {/* Title & Description */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>{rec.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: '80%' }}>
                    {rec.description}
                </Typography>

                {/* Metrics Grid */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>{t('landing.results.impact')}</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: rec.impact === 'high' ? 'white' : 'text.primary' }}>
                            {t(`aiVisibility.tips.impact.${rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)}` as any)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{t('brandRise.recommendations.priorityScore', { score: rec.priorityScore })}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>{t('brandRise.recommendations.effort')}</Typography>
                        <Typography variant="h6" fontWeight="bold">{t(`aiVisibility.tips.impact.${rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)}` as any)}</Typography>
                        <Typography variant="caption" color="text.secondary">{rec.timeEstimate}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>{t('brandRise.recommendations.targetKPI')}</Typography>
                        <Typography variant="h6" fontWeight="bold">{rec.targetKPI}</Typography>
                        <Typography variant="caption" color="text.secondary">{rec.targetMetric}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>{t('landing.results.categories.technical.label')}</Typography>
                        <Typography variant="h6" fontWeight="bold">{rec.category === 'local' ? t('brandRise.recommendations.localSEO') : t('brandRise.recommendations.reputation')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('brandRise.recommendations.optimization')}</Typography>
                    </Grid>
                </Grid>

                {/* Why This Matters */}
               <Collapse in={expanded}>
                    <Box sx={{ mb: 4, bgcolor: alpha(theme.palette.background.default, 0.5), p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('brandRise.recommendations.whyTitle')}:</Typography>
                        {rec.why.map((reason, idx) => (
                            <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                {reason}
                            </Typography>
                        ))}
                        
                        <Box sx={{ mt: 2 }}>
                             <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('brandRise.recommendations.actionSteps')}:</Typography>
                             <Stack spacing={0.5}>
                                {rec.steps.map((step, idx) => (
                                    <Typography key={idx} variant="body2" color="text.secondary">{'•'} {step}</Typography>
                                ))}
                             </Stack>
                        </Box>
                    </Box>
                </Collapse>

                {/* Footer Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" pt={2} sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Stack direction="row" spacing={2}>
                        {rec.status === 'open' ? (
                            <Button 
                                variant="contained" 
                                color="warning"
                                onClick={() => onUpdateStatus(rec.id, 'in_progress')}
                                startIcon={<Icon icon="tabler-player-play" fontSize={18} />}
                            >
                                {t('brandRise.recommendations.startTask')}
                            </Button>
                        ) : rec.status === 'in_progress' ? (
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => onUpdateStatus(rec.id, 'completed')}
                                startIcon={<Icon icon="tabler-check" fontSize={18} />}
                            >
                                {t('brandRise.recommendations.markComplete')}
                            </Button>
                        ) : null}

                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            onClick={() => setExpanded(!expanded)}
                            sx={{ borderColor: 'divider' }}
                            endIcon={<Icon icon={expanded ? "tabler-chevron-up" : "tabler-chevron-down"} fontSize={16} />}
                        >
                            {expanded ? t('brandRise.recommendations.hideSteps') : t('brandRise.recommendations.viewStepsCount', { count: rec.steps.length })}
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            sx={{ borderColor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.main }}
                        >
                            {tc('common.delete')}
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Icon icon="tabler-clock" fontSize={14} /> {t('brandRise.recommendations.generatedTime', { time: '2 hours ago' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Icon icon="tabler-robot" fontSize={14} /> {t('brandRise.recommendations.aiStrategist')}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        </Card>
    );
};

export default RecommendationsPage;
