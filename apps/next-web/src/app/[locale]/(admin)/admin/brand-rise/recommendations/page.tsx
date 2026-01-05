'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import CustomTextField from '@core/components/mui/TextField';

import { useBusinessId } from '@/hooks/useBusinessId';
import { BrandRecommendation, BrandService } from '@/services/brand.service';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

const RecommendationsPage = () => {
    const { businessId } = useBusinessId();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<BrandRecommendation[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('open');
    const [generating, setGenerating] = useState(false);

    const fetchRecommendations = async () => {
        if (!businessId) return;
        setLoading(true);
        try {
            const data = await BrandService.getRecommendations(businessId, { status: filterStatus === 'all' ? undefined : filterStatus });
            setRecommendations(data);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [businessId, filterStatus]);

    const handleGenerate = async () => {
        if (!businessId) return;
        setGenerating(true);
        try {
            // Trigger generation for all categories (simplified for UI)
            // Ideally we might select categories or have a global 'Generate' job
            const categories = ['search', 'local', 'social', 'reputation', 'conversion', 'content'];
            // Just confirm it started
            await BrandService.generateRecommendations(businessId, 'search');
            // In a real app we'd poll for job status or wait for socket event

            // Mock delay for UX
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
            await BrandService.updateRecommendationStatus(id, newStatus);
            fetchRecommendations(); // Refresh list
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getPriorityColor = (score: number) => {
        if (score > 80) return 'error';
        if (score > 50) return 'warning';
        return 'info';
    };

    return (
        <Grid container spacing={6}>
            <Grid size={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" mb={1}>AI Brand Strategist</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Personalized recommendations to improve your brand presence and trust.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            size="small"
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="open">Open</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="all">All Statuses</MenuItem>
                        </Select>
                        <Button
                            variant="contained"
                            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Icon icon="tabler-wand" fontSize={20} />}
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? 'Analyzing...' : 'Generate New Ideas'}
                        </Button>
                    </Box>
                </Stack>
            </Grid>

            <Grid size={12}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : recommendations.length === 0 ? (
                    <Card sx={{ p: 5, textAlign: 'center' }}>
                        <Box sx={{ mb: 3 }}>
                            <Icon icon="tabler-bulb-off" fontSize={48} color={theme.palette.text.disabled} />
                        </Box>
                        <Typography variant="h5" gutterBottom>No recommendations found</Typography>
                        <Typography color="text.secondary" mb={3}>
                            Generate your first set of AI-powered recommendations to get started.
                        </Typography>
                        <Button variant="outlined" onClick={handleGenerate}>
                            Run Analysis
                        </Button>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {recommendations.map((rec) => (
                            <Grid size={12} key={rec.id}>
                                <Card sx={{ p: 3, borderLeft: `6px solid ${theme.palette[getPriorityColor(rec.priorityScore)].main}` }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ width: '100%' }}>
                                            <Stack direction="row" spacing={1} mb={1} alignItems="center">
                                                <Chip label={rec.category} size="small" variant="outlined" />
                                                <Chip label={`${rec.impact} impact`} size="small" color={rec.impact === 'high' ? 'primary' : 'default'} />
                                                <Chip label={`${rec.effort} effort`} size="small" />
                                            </Stack>
                                            <Typography variant="h6" gutterBottom>{rec.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {rec.description}
                                            </Typography>

                                            <Box sx={{ mt: 2, bgcolor: theme.palette.action.hover, p: 2, borderRadius: 1 }}>
                                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Icon icon="tabler-info-circle" fontSize={16} /> Why this matters:
                                                </Typography>
                                                <Typography variant="body2" mb={2}>
                                                    {rec.why}
                                                </Typography>

                                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Icon icon="tabler-list-check" fontSize={16} /> Action Steps:
                                                </Typography>
                                                <Stack spacing={0.5}>
                                                    {rec.steps?.map((step: string, index: number) => (
                                                        <Typography key={index} variant="body2">• {step}</Typography>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Box>

                                        <Stack spacing={1} sx={{ ml: 4, minWidth: 140 }}>
                                            {rec.status === 'open' && (
                                                <Button variant="contained" size="small" onClick={() => handleStatusUpdate(rec.id, 'in_progress')}>
                                                    Start Acting
                                                </Button>
                                            )}
                                            {rec.status === 'in_progress' && (
                                                <Button variant="contained" color="success" size="small" onClick={() => handleStatusUpdate(rec.id, 'completed')}>
                                                    Mark Complete
                                                </Button>
                                            )}
                                            {rec.status !== 'dismissed' && (
                                                <Button variant="text" color="error" size="small" onClick={() => handleStatusUpdate(rec.id, 'dismissed')}>
                                                    Dismiss
                                                </Button>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

export default RecommendationsPage;
