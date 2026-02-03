/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslations } from 'next-intl';

import { BrandService, type ScheduledPost, type PublishingLog } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import DashboardLineChart from '@/components/shared/dashboard/DashboardLineChart';
import DashboardDonutChart from '@/components/shared/dashboard/DashboardDonutChart';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number; [key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

const SocialRiseOverviewPage = () => {
    const theme = useTheme();
    const router = useRouter();
    const t = useTranslations('dashboard');
    const { businessId } = useBusinessId();
    
    const [stats, setStats] = useState({
        totalScheduled: 0,
        publishedLast30: 0,
        failedLast30: 0,
    });

    const [recentPosts, setRecentPosts] = useState<ScheduledPost[]>([]);
    const [recentLogs, setRecentLogs] = useState<PublishingLog[]>([]);
    const [loading, setLoading] = useState(true);

    const [chartData, setChartData] = useState<{
        activitySeries: { name: string; data: number[] }[];
        activityCategories: string[];
        platformSeries: number[];
        platformLabels: string[];
    }>({
        activitySeries: [],
        activityCategories: [],
        platformSeries: [],
        platformLabels: [],
    });

    const isDark = theme.palette.mode === 'dark';

    const fetchData = useCallback(async () => {
        if (!businessId) return;
        setLoading(true);
        
        try {
            const [posts, logs] = await Promise.all([
                BrandService.listScheduledPosts(businessId),
                BrandService.listPublishingLogs(businessId, {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                })
            ]);

            // Stats
            setStats({
                totalScheduled: posts.filter(p => p.status === 'scheduled').length,
                publishedLast30: logs.filter(l => l.status === 'completed').length,
                failedLast30: logs.filter(l => l.status === 'failed').length,
            });

            // Activity Chart (Last 14 days)
            const last14Days = [...Array(14)].map((_, i) => {
                const d = new Date();

                d.setDate(d.getDate() - (13 - i));

                return d.toISOString().split('T')[0];
            });

            const activityMap = logs.reduce((acc, log) => {
                const date = new Date(log.updatedAt).toISOString().split('T')[0];

                if (!acc[date]) acc[date] = { completed: 0, failed: 0 };
                if (log.status === 'completed') acc[date].completed++;
                if (log.status === 'failed') acc[date].failed++;

                return acc;
            }, {} as Record<string, { completed: number; failed: number }>);

            const completedData = last14Days.map(date => activityMap[date]?.completed || 0);
            const failedData = last14Days.map(date => activityMap[date]?.failed || 0);

            // Platform Distribution
            const platformCounts = posts.reduce((acc, post) => {
                const ALL_SUPPORTED_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'GOOGLE_BUSINESS'];

                const normalizedPlatforms = (post.platforms || []).reduce((pAcc: string[], curr: string) => {
                    if (typeof curr === 'string' && (curr.toUpperCase() === 'ALL PLATFORMS' || curr.toUpperCase() === 'ALL_PLATFORMS')) {
                        return [...pAcc, ...ALL_SUPPORTED_PLATFORMS];
                    }

                    if (typeof curr === 'string' && curr.includes(',')) {
                        const split = curr.split(',').map(p => p.trim());

                        return [...pAcc, ...split.reduce((spAcc: string[], p) => {
                            if (p.toUpperCase() === 'ALL PLATFORMS' || p.toUpperCase() === 'ALL_PLATFORMS') {
                                return [...spAcc, ...ALL_SUPPORTED_PLATFORMS];
                            }

                            const normalized = p.toUpperCase().replace(/\s+/g, '_');
                            const finalPlatform = normalized === 'X' ? 'TWITTER' : normalized;

                            return [...spAcc, finalPlatform];
                        }, [])];
                    }

                    const normalized = curr.toUpperCase().replace(/\s+/g, '_');
                    const finalPlatform = normalized === 'X' ? 'TWITTER' : normalized;

                    return [...pAcc, finalPlatform];
                }, []);

                const uniquePlatforms = Array.from(new Set(normalizedPlatforms));

                uniquePlatforms.forEach(p => {
                    acc[p] = (acc[p] || 0) + 1;
                });

                return acc;
            }, {} as Record<string, number>);

            setChartData({
                activitySeries: [
                    { name: 'Successful', data: completedData },
                    { name: 'Failed', data: failedData }
                ],
                activityCategories: last14Days.map(d => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' })),
                platformSeries: Object.values(platformCounts),
                platformLabels: Object.keys(platformCounts),
            });

            setRecentPosts(posts.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()).slice(0, 5));
            setRecentLogs(logs.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch social overview data', error);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: string; color: string }) => (
        <Card sx={{ 
            height: '100%', 
            bgcolor: isDark ? alpha(color, 0.05) : alpha(color, 0.02),
            border: `1px solid ${alpha(color, 0.1)}`,
            borderRadius: '16px',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
        }}>
            <CardContent sx={{ p: 5 }}>
                <Stack direction="row" spacing={4} alignItems="center">
                    <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        bgcolor: alpha(color, 0.1), 
                        color: color,
                        display: 'flex'
                    }}>
                        <Icon icon={icon} fontSize={24} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight="800">{value}</Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            {title}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                width: '100%',
                bgcolor: isDark ? 'background.default' : '#F8F9FA'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            width: '100%', 
            p: { xs: 4, sm: 6, md: 8 },
            minHeight: '100vh',
            bgcolor: isDark ? 'background.default' : '#F8F9FA'
        }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', lg: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', lg: 'flex-end' }, 
                mb: 8,
                gap: 4
            }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: '12px', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: 'flex'
                        }}>
                            <Icon icon="tabler-chart-pie" fontSize={24} />
                        </Box>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '1px' }}>
                            SOCIAL MEDIA STUDIO
                        </Typography>
                    </Box>
                    <Typography variant="h2" fontWeight="800" sx={{ mb: 1.5, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        {t('navigation.social-overview', { defaultValue: 'Overview' })}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.7, maxWidth: 600, lineHeight: 1.5 }}>
                        Your centralized command center for Social Rise visibility, performance metrics, and strategy reports.
                    </Typography>
                </Box>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={6} sx={{ mb: 8 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard 
                        title="Scheduled Posts" 
                        value={stats.totalScheduled} 
                        icon="tabler-calendar-check" 
                        color={theme.palette.primary.main} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard 
                        title="Published (30d)" 
                        value={stats.publishedLast30} 
                        icon="tabler-circle-check" 
                        color={theme.palette.success.main} 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <StatCard 
                        title="Failed Posts" 
                        value={stats.failedLast30} 
                        icon="tabler-alert-circle" 
                        color={theme.palette.error.main} 
                    />
                </Grid>
            </Grid>

            {/* Graphs Section */}
            <Grid container spacing={6} sx={{ mb: 8 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <DashboardLineChart 
                        title="Publishing Performance"
                        subtitle="Successful vs Failed posts over the last 14 days"
                        series={chartData.activitySeries}
                        categories={chartData.activityCategories}
                    />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <DashboardDonutChart 
                        title="Platform Distribution"
                        subtitle="Posts by social platform"
                        series={chartData.platformSeries}
                        labels={chartData.platformLabels}
                    />
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={8}>
                {/* Left Column: Recent Activity */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ 
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        bgcolor: 'background.paper'
                    }}>
                        <CardContent sx={{ p: 8 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
                                <Typography variant="h4" fontWeight="800">Upcoming Posts</Typography>
                                <Typography 
                                    variant="button" 
                                    color="primary" 
                                    sx={{ cursor: 'pointer', fontWeight: 700 }}
                                    onClick={() => router.push('../social-rise?tab=calendar')}
                                >
                                    Content & Messaging
                                </Typography>
                            </Stack>

                            <Stack spacing={4}>
                                {recentPosts.length > 0 ? (
                                    recentPosts.map((post) => (
                                        <Box key={post.id} sx={{ 
                                            p: 4, 
                                            borderRadius: '16px', 
                                            bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02),
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                        }}>
                                            <Stack direction="row" spacing={4} alignItems="center">
                                                <Box sx={{ 
                                                    p: 2, 
                                                    borderRadius: '10px', 
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main,
                                                    display: 'flex'
                                                }}>
                                                    <Icon icon="tabler-calendar-event" fontSize={20} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="700" noWrap>
                                                        {post.content.title || post.content.text.substring(0, 50)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Scheduled for {new Date(post.scheduledAt).toLocaleDateString()} at {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={1}>
                                                    {post.platforms.map(p => (
                                                        <Chip 
                                                            key={p} 
                                                            label={p} 
                                                            size="small" 
                                                            variant="outlined" 
                                                            sx={{ fontSize: '0.65rem', fontWeight: 700 }} 
                                                        />
                                                    ))}
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        No upcoming posts scheduled.
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column: Publishing Logs Summary */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ 
                        boxShadow: isDark ? 'none' : '0 20px 60px 0 rgba(0, 0, 0, 0.03)',
                        border: `1px solid ${isDark ? theme.palette.divider : alpha(theme.palette.divider, 0.6)}`,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        height: '100%'
                    }}>
                        <CardContent sx={{ p: 8 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
                                <Typography variant="h4" fontWeight="800">Recent Logs</Typography>
                                <Typography 
                                    variant="button" 
                                    color="primary" 
                                    sx={{ cursor: 'pointer', fontWeight: 700 }}
                                    onClick={() => router.push('../social-rise?tab=logs')}
                                >
                                    Logs
                                </Typography>
                            </Stack>

                            <Stack spacing={4}>
                                {recentLogs.length > 0 ? (
                                    recentLogs.map((log) => (
                                        <Box key={log.id} sx={{ pb: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
                                            <Stack direction="row" spacing={3} alignItems="flex-start">
                                                <Box sx={{ 
                                                    mt: 0.5,
                                                    width: 8, 
                                                    height: 8, 
                                                    borderRadius: '50%', 
                                                    bgcolor: log.status === 'completed' ? 'success.main' : log.status === 'failed' ? 'error.main' : 'warning.main',
                                                    flexShrink: 0
                                                }} />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5 }}>
                                                        {log.platform} Publishing
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                        {new Date(log.updatedAt).toLocaleDateString()}
                                                    </Typography>
                                                    <Chip 
                                                        label={log.status} 
                                                        size="small" 
                                                        color={log.status === 'completed' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}
                                                        variant="tonal"
                                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
                                                    />
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                        No recent publishing activity.
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SocialRiseOverviewPage;
