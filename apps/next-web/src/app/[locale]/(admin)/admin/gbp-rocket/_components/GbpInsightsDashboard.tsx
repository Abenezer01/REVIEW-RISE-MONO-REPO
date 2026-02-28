// @ts-nocheck
'use client'

import { SERVICES_CONFIG } from '@/configs/services';
import apiClient from '@/lib/apiClient';
import {
    ArrowDownward,
    ArrowUpward,
    CalendarToday,
    Circle,
    Delete,
    DescriptionOutlined,
    Edit,
    InfoOutlined,
    LightbulbOutlined,
    Place,
    Search,
    Sync
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box, Button, Card, CardContent, Chip,
    CircularProgress,
    FormControlLabel, IconButton,
    MenuItem,
    Tooltip as MuiTooltip,
    Paper,
    Select,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead, TableRow,
    ToggleButton, ToggleButtonGroup,
    Typography
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    XAxis, YAxis
} from 'recharts';

const GBP_API_URL = SERVICES_CONFIG.gbp.url;

export default function GbpInsightsDashboard({ locationId }: { locationId: string | undefined }) {
    const t = useTranslations('gbpRocket.insights');
    const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
    const [compare, setCompare] = useState(false);
    const [dateRange, setDateRange] = useState(30);

    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [competitors, setCompetitors] = useState<any[]>([]);
    const [jobStatus, setJobStatus] = useState<any>(null);

    useEffect(() => {
        if (locationId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationId, granularity, compare, dateRange]);

    const fetchData = async () => {
        if (!locationId) return;

        setLoading(true);

        try {
            const end = new Date();
            const start = new Date();

            start.setDate(start.getDate() - dateRange);

            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];

            const [metricsRes, compRes, jobRes] = await Promise.all([
                apiClient.get(`${GBP_API_URL}/locations/${locationId}/metrics`, {
                    params: { start_date: startStr, end_date: endStr, granularity, compare }
                }),
                apiClient.get(`${GBP_API_URL}/locations/${locationId}/competitors`),
                apiClient.get(`${GBP_API_URL}/locations/${locationId}/metrics/job-status`)
            ]);

            setMetrics(metricsRes.data);
            setCompetitors(compRes.data);
            setJobStatus(jobRes.data);
        } catch (error) {
            console.error('Error fetching insights data', error);
        } finally {
            setLoading(false);
        }
    };

    const syncData = async () => {
        if (!locationId) return;

        try {
            await apiClient.post(`${GBP_API_URL}/locations/${locationId}/metrics/sync`);
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    if (!locationId) {
        return <Alert severity="info">{t('selectLocationToView')}</Alert>;
    }

    if (loading && !metrics) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
            </Box>
        );
    }

    // Safely extract totals prioritizing the real backend data, falling back to visually empty zeros
    const totals = metrics?.current?.totals || {
        impressionsTotal: 0,
        impressionsDiscovery: 0,
        impressionsDirect: 0,
        photoViews: 0,
        visibilityScore: 0
    };

    const changes = metrics?.compare?.percentChanges || {
        impressionsTotal: 0,
        photoViews: 0,
        visibilityScore: 0 // points
    };

    // Calculate split
    const totalDiscOrDir = totals.impressionsDiscovery + totals.impressionsDirect;
    const discRatio = totalDiscOrDir > 0 ? Math.round((totals.impressionsDiscovery / totalDiscOrDir) * 100) : 0;
    const dirRatio = totalDiscOrDir > 0 ? Math.round((totals.impressionsDirect / totalDiscOrDir) * 100) : 0;

    const sparklineData = metrics?.current?.series || [];

    const KPICard = ({ title, value, trend, trendLabel, trendIsPoints = false, chartType = 'none', chartColor = '#10B981', isBar = false, dataKey = '' }: any) => {
        const isPositive = trend >= 0;
        const TrendIcon = isPositive ? ArrowUpward : ArrowDownward;
        const trendColor = isPositive ? '#10B981' : '#EF4444';
        const displayTrend = trendIsPoints ? `${Math.abs(trend)} points` : `${Math.abs(trend)}%`;

        return (
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
                        <MuiTooltip title="Details here"><InfoOutlined sx={{ fontSize: 16, color: 'text.disabled' }} /></MuiTooltip>
                    </Stack>
                    <Typography variant="h4" fontWeight="bold" mb={1}>{value.toLocaleString()}</Typography>

                    <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                        <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
                        <Typography variant="caption" sx={{ color: trendColor, fontWeight: 'bold' }}>
                            {displayTrend}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {trendLabel}
                        </Typography>
                    </Box>

                    {/* Bottom visualizer */}
                    <Box mt="auto" pt={1}>
                        {chartType === 'line' && sparklineData.length > 0 && (
                            <Box height={40} width="60%">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sparklineData}>
                                        <Line type="monotone" dataKey={dataKey} stroke={chartColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                        {isBar && (
                            <Box sx={{ width: '100%', height: 6, borderRadius: 3, bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                                <Box sx={{ width: `${Math.min(value || 0, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B 0%, #10B981 100%)' }} />
                            </Box>
                        )}
                        {chartType === 'none' && !isBar && <Box height={40} />}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ bgcolor: '#F9FAFB', p: { xs: 2, md: 4 }, mx: -3, mt: -3 }}>
            {/* Header */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={4} gap={2}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>{t('insightsTitle')}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('insightsSubtitle')}</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Select
                        size="small"
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                        sx={{ bgcolor: 'white', minWidth: 160, borderRadius: 2, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 } }}
                    >
                        <MenuItem value={7}><CalendarToday fontSize="small" color="action" /> {t('last7Days')}</MenuItem>
                        <MenuItem value={30}><CalendarToday fontSize="small" color="action" /> {t('last30Days')}</MenuItem>
                        <MenuItem value={90}><CalendarToday fontSize="small" color="action" /> {t('last90Days')}</MenuItem>
                    </Select>

                    <Box sx={{ bgcolor: 'white', px: 2, py: 0.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={<Switch size="small" checked={compare} onChange={(e) => setCompare(e.target.checked)} color="primary" />}
                            label={<Typography variant="body2" color="text.secondary">{t('compareToPrevious')}</Typography>}
                            sx={{ m: 0 }}
                        />
                    </Box>

                    <Button variant="contained" color="primary" onClick={syncData} sx={{ minWidth: 40, p: 1, borderRadius: 2 }}>
                        <Sync fontSize="small" />
                    </Button>
                </Stack>
            </Box>

            {/* KPI Cards Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3, mb: 3 }}>
                <KPICard title={t('totalImpressions')} value={totals.impressionsTotal} trend={changes.impressionsTotal || 0} trendLabel={t('vsPreviousPeriod')} chartType="line" chartColor="#10B981" dataKey="impressionsTotal" />
                <KPICard title={t('photoViews')} value={totals.photoViews} trend={changes.photoViews || 0} trendLabel={t('vsPreviousPeriod')} chartType="line" chartColor="#10B981" dataKey="photoViews" />

                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>{t('discoveryVsDirect')}</Typography>
                            <InfoOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </Stack>
                        <Typography variant="h4" fontWeight="bold" mb={2}>{(totals.impressionsDiscovery + totals.impressionsDirect).toLocaleString()}</Typography>
                        <Box mt="auto">
                            <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Circle sx={{ fontSize: 10, color: '#3B82F6' }} />
                                    <Typography variant="caption" color="text.secondary">{t('discovery')} {discRatio}{'%'}</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Circle sx={{ fontSize: 10, color: '#8B5CF6' }} />
                                    <Typography variant="caption" color="text.secondary">{t('direct')} {dirRatio}{'%'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                <KPICard title={t('visibilityScore')} value={totals.visibilityScore || 0} trend={changes.visibilityScore || 0} trendLabel={t('fromLastMonth')} trendIsPoints={true} isBar={true} />
                <KPICard title={t('customerActions')} value={0} trend={0} trendLabel={t('vsPreviousPeriod')} chartType="none" />
            </Box>

            {/* Main Content Area - True 2-Column Masonry Layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                {/* Left Column (2/3 width) */}
                <Box sx={{ minWidth: 0 }}>
                    <Stack spacing={3}>
                        {/* Impressions Trend Card */}
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight="bold">{t('impressionsTrend')}</Typography>
                                    <ToggleButtonGroup
                                        size="small"
                                        value={granularity}
                                        exclusive
                                        onChange={(_, val) => val && setGranularity(val)}
                                        sx={{
                                            bgcolor: '#F3F4F6', p: 0.5, borderRadius: 2,
                                            '& .MuiToggleButton-root': { border: 'none', borderRadius: '8px !important', px: 2, textTransform: 'none', fontWeight: 500 },
                                            '& .Mui-selected': { bgcolor: 'white !important', color: '#2563EB !important', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
                                        }}
                                    >
                                        <ToggleButton value="daily">{t('daily')}</ToggleButton>
                                        <ToggleButton value="weekly">{t('weekly')}</ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>

                                <Stack direction="row" spacing={3} mb={4}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Box sx={{ width: 16, height: 4, bgcolor: '#3B82F6', borderRadius: 1 }} />
                                        <Typography variant="caption" color="text.secondary">{t('currentPeriod')}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Box sx={{ width: 16, height: 4, bgcolor: '#E5E7EB', borderRadius: 1 }} />
                                        <Typography variant="caption" color="text.secondary">{t('previousPeriod')}</Typography>
                                    </Stack>
                                </Stack>

                                <Box height={300}>
                                    {metrics?.current?.series && metrics.current.series.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={metrics.current.series}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                                                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Line type="monotone" dataKey="impressionsTotal" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                                {compare && metrics.compare?.series && (
                                                    <Line type="monotone" data={metrics.compare.series} dataKey="impressionsTotal" stroke="#E5E7EB" strokeWidth={3} dot={false} />
                                                )}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Box display="flex" justifyContent="center" alignItems="center" height="100%" bgcolor="#F9FAFB" borderRadius={2}>
                                            <Typography color="text.disabled">{t('noData')}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Discovery vs Direct Breakdown Card */}
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" mb={4}>{t('discoveryVsDirect')}</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
                                    <Box>
                                        <Box height={200} position="relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: t('discovery'), value: totals.impressionsDiscovery || 0 },
                                                            { name: t('direct'), value: totals.impressionsDirect || 0 }
                                                        ]}
                                                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none"
                                                        dataKey="value"
                                                    >
                                                        <Cell fill="#3B82F6" />
                                                        <Cell fill="#8B5CF6" />
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        <Box display="flex" justifyContent="center" gap={6} mt={2}>
                                            <Box textAlign="center">
                                                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center" mb={0.5}>
                                                    <Circle sx={{ fontSize: 10, color: '#3B82F6' }} />
                                                    <Typography variant="caption" color="text.secondary">{t('discovery')}</Typography>
                                                </Stack>
                                                <Typography variant="body2" fontWeight="bold">{(totals.impressionsDiscovery || 0).toLocaleString()} ({discRatio}{'%'})</Typography>
                                            </Box>
                                            <Box textAlign="center">
                                                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center" mb={0.5}>
                                                    <Circle sx={{ fontSize: 10, color: '#8B5CF6' }} />
                                                    <Typography variant="caption" color="text.secondary">{t('direct')}</Typography>
                                                </Stack>
                                                <Typography variant="body2" fontWeight="bold">{(totals.impressionsDirect || 0).toLocaleString()} ({dirRatio}{'%'})</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Stack spacing={4}>
                                            <Box display="flex" gap={2}>
                                                <Avatar sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', width: 48, height: 48 }}>
                                                    <Search fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('discovery')}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                                                        {t('discoveryDesc')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box display="flex" gap={2}>
                                                <Avatar sx={{ bgcolor: '#F5F3FF', color: '#8B5CF6', width: 48, height: 48 }}>
                                                    <Place fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{t('direct')}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                                                        {t('directDesc')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Competitor Baseline Card */}
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>{t('competitorBaseline')}</Typography>
                                <Paper elevation={0} sx={{ border: 'none' }}>
                                    <Table size="medium">
                                        <TableHead>
                                            <TableRow sx={{ '& th': { borderBottom: '1px solid #F3F4F6', color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' } }}>
                                                <TableCell>{t('businessName')}</TableCell>
                                                <TableCell align="center">{t('estVisibility')}</TableCell>
                                                <TableCell align="center">{t('photoCount')}</TableCell>
                                                <TableCell align="center">{t('reviewCount')}</TableCell>
                                                <TableCell align="center">{t('rating')}</TableCell>
                                                <TableCell align="right">{t('actions')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {/* Dynamic "You" Row based on DB totals */}
                                            <TableRow sx={{ bgcolor: '#F8FAFC', '& td': { borderBottom: competitors.length > 0 ? '1px solid #F3F4F6' : 'none', py: 2.5 } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Chip label={t('you')} size="small" sx={{ bgcolor: '#DBEAFE', color: '#1E3A8A', fontWeight: 'bold', fontSize: '0.7rem', height: 20 }} />
                                                        <Typography variant="body2" fontWeight="bold">{t('yourProfile')}</Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{
                                                        bgcolor: totals.visibilityScore >= 75 ? '#D1FAE5' : totals.visibilityScore >= 50 ? '#FEF3C7' : '#FEE2E2',
                                                        color: totals.visibilityScore >= 75 ? '#065F46' : totals.visibilityScore >= 50 ? '#92400E' : '#991B1B',
                                                        py: 0.5, px: 2, borderRadius: 1.5, display: 'inline-block', fontWeight: 'bold', fontSize: '0.875rem'
                                                    }}>
                                                        {totals.visibilityScore || 0}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center"><Typography variant="body2" color="text.secondary">—</Typography></TableCell>
                                                <TableCell align="center"><Typography variant="body2" color="text.secondary">—</Typography></TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography color="text.disabled">—</Typography>
                                                </TableCell>
                                            </TableRow>

                                            {/* DB competitors mapped here */}
                                            {competitors.map((comp, index) => (
                                                <TableRow key={comp.id} sx={{ '& td': { borderBottom: index === competitors.length - 1 ? 'none' : '1px solid #F3F4F6', py: 2.5 } }}>
                                                    <TableCell><Typography variant="body2" fontWeight={500}>{comp.competitorName}</Typography></TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{
                                                            bgcolor: (comp.estimatedVisibility || 0) >= 75 ? '#D1FAE5' : (comp.estimatedVisibility || 0) >= 50 ? '#FEF3C7' : '#FEE2E2',
                                                            color: (comp.estimatedVisibility || 0) >= 75 ? '#065F46' : (comp.estimatedVisibility || 0) >= 50 ? '#92400E' : '#991B1B',
                                                            py: 0.5, px: 2, borderRadius: 1.5, display: 'inline-block', fontWeight: 'bold', fontSize: '0.875rem'
                                                        }}>
                                                            {comp.estimatedVisibility || 0}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center"><Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>{comp.photoCount || 0}</Typography></TableCell>
                                                    <TableCell align="center"><Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>{comp.reviewCount || 0}</Typography></TableCell>
                                                    <TableCell align="center">
                                                        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
                                                            {/* eslint-disable-next-line react/jsx-no-literals */}
                                                            <Typography sx={{ color: '#F59E0B', fontSize: 16 }}>{'★'}</Typography>
                                                            <Typography variant="body2" fontWeight="bold">{comp.rating || 0}</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <IconButton size="small"><Edit sx={{ fontSize: 16, color: '#9CA3AF' }} /></IconButton>
                                                            <IconButton size="small"><Delete sx={{ fontSize: 16, color: '#9CA3AF' }} /></IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {competitors.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                        <Typography variant="body2" color="text.secondary">{t('noCompetitors')}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>

                {/* Right Column (1/3 width) */}
                <Box sx={{ minWidth: 0 }}>
                    <Stack spacing={3} height="100%">
                        {/* Photo Views Trend Card */}
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>{t('photoViewsTrend')}</Typography>
                                <Box display="flex" justifyContent="center" mb={4}>
                                    <Chip label={changes.photoViews > 0 ? `+${changes.photoViews}%` : `${changes.photoViews}%`} size="small" sx={{ bgcolor: changes.photoViews >= 0 ? '#D1FAE5' : '#FEE2E2', color: changes.photoViews >= 0 ? '#065F46' : '#991B1B', fontWeight: 600, px: 1 }} />
                                </Box>

                                <Box height={200}>
                                    {metrics?.current?.series && metrics.current.series.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={metrics.current.series}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide />
                                                <Bar dataKey="photoViews" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Box display="flex" justifyContent="center" alignItems="center" height="100%" bgcolor="#F9FAFB" borderRadius={2}>
                                            <Typography color="text.disabled">{t('noData')}</Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ mt: 4, p: 2, bgcolor: '#FFFBEB', borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5, border: '1px solid #FEF3C7' }}>
                                    <LightbulbOutlined sx={{ color: '#D97706', fontSize: 20, mt: 0.5 }} />
                                    <Typography variant="caption" sx={{ color: '#92400E', lineHeight: 1.5 }}>
                                        {t('photosInfluence')}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Visibility Signals Card */}
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" mb={4}>{t('visibilitySignals')}</Typography>
                                <Stack spacing={3}>
                                    {[
                                        { label: t('postingFrequency'), rating: t('strong'), color: 'success' },
                                        { label: t('photoFreshness'), rating: t('strong'), color: 'success' },
                                        { label: t('reviewActivity'), rating: t('moderate'), color: 'warning' },
                                        { label: t('categoryCompleteness'), rating: t('weak'), color: 'error' },
                                        { label: t('profileCompleteness'), rating: t('strong'), color: 'success' }
                                    ].map((signal, i) => {
                                        const chipBg = signal.color === 'success' ? '#D1FAE5' : signal.color === 'warning' ? '#FEF3C7' : '#FEE2E2';
                                        const chipColor = signal.color === 'success' ? '#065F46' : signal.color === 'warning' ? '#92400E' : '#991B1B';

                                        return (
                                            <Box key={i} display="flex" justifyContent="space-between" alignItems="center" p={1.5} bgcolor="#F9FAFB" borderRadius={2}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{signal.label}</Typography>
                                                    <InfoOutlined sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                                </Stack>
                                                <Chip label={signal.rating} size="small" sx={{ bgcolor: chipBg, color: chipColor, fontWeight: 'bold', fontSize: '0.7rem', height: 24 }} />
                                            </Box>
                                        )
                                    })}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* System Health Card */}
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h6" fontWeight="bold">{t('systemHealth')}</Typography>
                                    <DescriptionOutlined sx={{ color: '#9CA3AF' }} />
                                </Stack>
                                <Stack spacing={2.5}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.disabled">{t('lastDataSync')}</Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.primary">
                                            {jobStatus?.finishedAt ? new Date(jobStatus.finishedAt).toLocaleString() : t('na')}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.disabled">{t('jobStatus')}</Typography>
                                        {jobStatus?.status === 'success' ? (
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <Circle sx={{ fontSize: 10, color: '#10B981' }} />
                                                <Typography variant="body2" color="#10B981" fontWeight={500}>{t('success')}</Typography>
                                            </Stack>
                                        ) : jobStatus?.status === 'failed' ? (
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <Circle sx={{ fontSize: 10, color: '#EF4444' }} />
                                                <Typography variant="body2" color="#EF4444" fontWeight={500}>{t('failed')}</Typography>
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.primary" fontWeight={500}>{jobStatus?.status || t('unknown')}</Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.disabled">{t('nextSync')}</Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.primary">{t('tomorrow')}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
