import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { BrandService } from '@/services/brand.service';
import { useBusinessId } from '@/hooks/useBusinessId';
import { formatRelativeTime, formatShortDate, isWithinLast24Hours } from '@/utils/dateHelper';


const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

interface JobsDashboardProps {
    onViewReport: (reportId: string) => void;
}

// Mock Data for Active Jobs
const MOCK_JOBS = [
    {
        id: 'JOB-2847',
        title: 'Generate Visibility Recommendations',
        type: 'GENERATE_VISIBILITY_RECOMMENDATIONS',
        status: 'running',
        progress: 65,
        startedAt: '2 minutes ago',
        estimatedTime: '~3 minutes',
        brand: 'TechStart Inc.'
    },
    {
        id: 'JOB-2846',
        title: 'Generate 30-Day Visibility Plan',
        type: 'GENERATE_30DAY_PLAN',
        status: 'completed',
        progress: 100,
        completedAt: '15 minutes ago',
        duration: '4m 23s',
        output: 'Report #R-1847',
        reportId: 'latest'
    },
    {
        id: 'JOB-2845',
        title: 'Competitor Analysis Snapshot',
        type: 'COMPETITOR_SNAPSHOT',
        status: 'failed',
        error: 'Unable to access competitor website (timeout after 30s). The target domain may be blocking automated requests or is temporarily unavailable.',
        failedAt: '1 hour ago',
        retryCount: '2 of 3',
        target: 'competitor-site.com'
    }
];

// Mock Data fallback for Reports if API returns empty (for demo)
const MOCK_REPORTS = [
    {
        id: 'report-1',
        title: '30-Day Visibility Plan',
        type: 'visibility_plan',
        description: 'Comprehensive action plan with prioritized tasks, timelines, and expected outcomes for improving brand visibility.',
        generatedAt: formatRelativeTime(new Date(Date.now() - 15 * 60 * 1000)), // 15 minutes ago
        version: 'v1.0',
        pages: 12,
        icon: 'tabler-calendar-time',
        color: 'primary',
        isNew: isWithinLast24Hours(new Date(Date.now() - 15 * 60 * 1000))
    },
    {
        id: 'report-2',
        title: 'Local SEO Fix List',
        type: 'local_seo',
        description: 'Detailed checklist of local SEO issues detected across Google Business Profile, citations, and local directories.',
        generatedAt: formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
        version: 'v2.1',
        pages: 8,
        icon: 'tabler-map-pin',
        color: 'warning',
        isNew: isWithinLast24Hours(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
    },
    {
        id: 'report-3',
        title: 'Competitor Brief',
        type: 'competitor_analysis',
        description: 'Analysis of top 5 competitors including positioning, content strategy, SEO performance, and opportunities.',
        generatedAt: formatRelativeTime(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
        version: 'v1.3',
        pages: 18,
        icon: 'tabler-users',
        color: 'info',
        isNew: isWithinLast24Hours(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
    }
];


export const JobsDashboard = ({ onViewReport }: JobsDashboardProps) => {
    const theme = useTheme();
    const t = useTranslations('dashboard.brandRise.jobs');
    const { businessId } = useBusinessId();
    const [reports, setReports] = useState<any[]>([]);
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);

    const loadJobs = useCallback(async () => {
         if (!businessId) return;

         try {
            const data = await BrandService.listJobs(businessId);

            if (data && data.length > 0) {
                 setJobs(data);
            } else {
                 setJobs(MOCK_JOBS); // Fallback to mock data
            }
         } catch (error) {
             console.error('Failed to load jobs', error);
             setJobs(MOCK_JOBS); // Fallback on error
         }
    }, [businessId]);

    const loadReports = useCallback(async () => {
         if (!businessId) return;

         try {
            const data = await BrandService.listReports(businessId);

            if (data && data.length > 0) {
                 // Transform API data to UI model
                 const uiReports = data.map((r: any) => ({
                     id: r.id,
                     title: r.title || 'Untitled Report',
                     type: r.type || 'generic',
                     description: r.description || 'Generated AI Report',
                     generatedAt: formatShortDate(r.generatedAt),
                     version: `v${r.version || '1.0'}`,
                     pages: r.pageCount || (r.htmlContent ? Math.ceil(r.htmlContent.length / 3000) : 5), // rough estimate validation
                     icon: getReportIcon(r.type || 'generic'),
                     color: getReportColor(r.type || 'generic'),
                     isNew: isWithinLast24Hours(r.generatedAt)
                 }));

                 setReports(uiReports);
            } else {
                 setReports(MOCK_REPORTS); // Keep mock for demo functionality if no real reports
            }
         } catch (error) {
             console.error('Failed to load reports', error);
             setReports(MOCK_REPORTS); // Fallback on error
         }
    }, [businessId]);

    useEffect(() => {
        loadJobs();
        loadReports();
    }, [loadJobs, loadReports]);

    const getReportIcon = (type: string) => {
        if (type.includes('visibility')) return 'tabler-calendar-time';
        if (type.includes('local')) return 'tabler-map-pin';
        if (type.includes('competitor')) return 'tabler-users';
        
return 'tabler-file-analytics';
    };

    const getReportColor = (type: string) => {
        if (type.includes('visibility')) return 'primary';
        if (type.includes('local')) return 'warning';
        if (type.includes('competitor')) return 'info';
        
return 'secondary';
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'running': return 'info';
            case 'completed': return 'success';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    return (
        <Stack spacing={4}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight="bold">{t('title')}</Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('subtitle')}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="warning" sx={{ borderRadius: 2 }}>
                        {t('activeJobs', {count: jobs.filter(j => j.status === 'running').length})}
                    </Button>
                    <Button variant="text" color="inherit" sx={{ color: 'text.secondary' }}>
                        {t('reportsLibrary', {count: reports.length})}
                    </Button>
                </Stack>
            </Stack>

            {/* Available Generators */}
            <Stack spacing={2}>
                 <Typography variant="h6" fontWeight="bold">{t('availableGenerators')}</Typography>
                 <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ 
                            p: 3, 
                            height: '100%',
                            display: 'flex', 
                            flexDirection: 'column',
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: 'background.default'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <Box sx={{ 
                                    p: 1.5, 
                                    borderRadius: 2, 
                                    bgcolor: 'primary.lightOpacity', 
                                    color: 'primary.main'
                                }}>
                                    <Icon icon="tabler-wand" fontSize={24} />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">Visibility Plan</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                                Generate a data-backed, 30-day roadmap tailored to your brand&apos;s unique DNA. Outpace competitors with actionable steps.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth
                                onClick={async () => {
                                    try {
                                        if (!businessId) return;
                                        setGeneratingPlan(true);
                                        await BrandService.generateVisibilityPlan(businessId);

                                        // Wait a bit for backend to process (mock delay if needed, or real)
                                        setTimeout(() => {
                                            loadReports();
                                            loadJobs(); // Also reload jobs
                                            setGeneratingPlan(false);
                                        }, 2000);
                                    } catch (e) {
                                        console.error(e);
                                        setGeneratingPlan(false);
                                    }
                                }}
                                disabled={generatingPlan}
                                startIcon={generatingPlan ? <CircularProgress size={16} color="inherit" /> : <Icon icon="tabler-player-play" fontSize={16} />}
                            >
                                {generatingPlan ? (t('generatingBtn') || 'Generating...') : (t('generateBtn') || 'Generate Plan')}
                            </Button>
                        </Card>
                    </Grid>
                 </Grid>
            </Stack>

            {/* Active Jobs Section */}
            <Stack spacing={2}>
                 <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">{t('activeJobsTitle')}</Typography>
                    <Button 
                        startIcon={<Icon icon="tabler-refresh" fontSize={16} />} 
                        variant="outlined" 
                        size="small" 
                        color="inherit" 
                        sx={{ color: 'text.secondary', borderColor: 'divider' }}
                    >
                        {t('autoRefresh')}
                    </Button>
                 </Stack>

                     {jobs.map((job) => (
                    <Card key={job.id} sx={{ 
                        p: 3, 
                        borderLeft: `6px solid ${(theme.palette as any)[getStatusColor(job.status)].main}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.6)
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ 
                                    p: 1.5, 
                                    borderRadius: 2, 
                                    bgcolor: alpha((theme.palette as any)[getStatusColor(job.status)].main, 0.1),
                                    color: (theme.palette as any)[getStatusColor(job.status)].main,
                                    display: 'flex'
                                }}>
                                    <Icon icon={
                                        job.status === 'running' ? 'tabler-settings' : 
                                        job.status === 'completed' ? 'tabler-circle-check' : 'tabler-alert-triangle'
                                    } fontSize={24} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{job.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{job.type}</Typography>
                                </Box>
                            </Stack>
                            <Chip 
                                label={job.status === 'running' ? t('running') : job.status === 'completed' ? t('completed') : t('failed')} 
                                color={getStatusColor(job.status) as any}
                                size="small"
                                variant={job.status === 'completed' ? 'outlined' : 'filled'}
                                sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                            />
                        </Stack>

                        {/* Progress / Status Message */}
                        {job.status === 'running' && (
                            <Box sx={{ mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">{t('analyzing')}</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="info.main">{job.progress}%</Typography>
                                </Stack>
                                <LinearProgress variant="determinate" value={job.progress} sx={{ height: 6, borderRadius: 3 }} />
                            </Box>
                        )}
                        
                        {job.status === 'completed' && (
                            <Box sx={{ mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" color="text.secondary">{t('success')}</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="success.main">100%</Typography>
                                </Stack>
                                <LinearProgress variant="determinate" value={100} color="success" sx={{ height: 6, borderRadius: 3 }} />
                            </Box>
                        )}

                        {job.status === 'failed' && (
                             <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                                <Typography variant="body2" color="error.main">Error: {job.error}</Typography>
                             </Box>
                        )}

                        {/* Metadata Grid */}
                        <Grid container spacing={2}>
                            {job.status === 'running' ? (
                                <>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">{t('started')}</Typography><Typography variant="body2">{job.startedAt}</Typography></Grid>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">{t('estimatedTime')}</Typography><Typography variant="body2">{job.estimatedTime}</Typography></Grid>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">{t('brand')}</Typography><Typography variant="body2">{job.brand}</Typography></Grid>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">{t('jobId')}</Typography><Typography variant="body2">{job.id}</Typography></Grid>
                                </>
                            ) : job.status === 'completed' ? (
                                <>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">COMPLETED</Typography><Typography variant="body2">{job.completedAt}</Typography></Grid>
                                    <Grid size={2}><Typography variant="caption" display="block" color="text.secondary">{t('duration')}</Typography><Typography variant="body2">{job.duration}</Typography></Grid>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">{t('output')}</Typography><Typography variant="body2">{job.output}</Typography></Grid>
                                    <Grid size={2}><Typography variant="caption" display="block" color="text.secondary">{t('jobId')}</Typography><Typography variant="body2">{job.id}</Typography></Grid>
                                    <Grid size={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Button variant="outlined" size="small" startIcon={<Icon icon="tabler-eye" />} onClick={() => job.reportId && onViewReport(job.reportId)}>{t('viewReport')}</Button>
                                        <Button variant="outlined" size="small" color="inherit" sx={{ borderColor: 'divider', minWidth: 'auto', px: 1 }}>{t('clear')}</Button>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid size={2}><Typography variant="caption" display="block" color="text.secondary">{t('failedAt')}</Typography><Typography variant="body2">{job.failedAt}</Typography></Grid>
                                    <Grid size={2}><Typography variant="caption" display="block" color="text.secondary">{t('retryCount')}</Typography><Typography variant="body2">{job.retryCount}</Typography></Grid>
                                    <Grid size={3}><Typography variant="caption" display="block" color="text.secondary">{t('target')}</Typography><Typography variant="body2">{job.target}</Typography></Grid>
                                    <Grid size={2}><Typography variant="caption" display="block" color="text.secondary">{t('jobId')}</Typography><Typography variant="body2">{job.id}</Typography></Grid>
                                    <Grid size={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                         <Button variant="contained" color="warning" size="small" startIcon={<Icon icon="tabler-rotate" />}>{t('retryJob')}</Button>
                                         <Button variant="text" size="small" color="inherit">{t('viewLogs')}</Button>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Card>
                 ))}
            </Stack>

            {/* Generated Reports Section */}
            <Stack spacing={2}>
                 <Typography variant="h6" fontWeight="bold">{t('generatedReports')}</Typography>
                 <Grid container spacing={3}>
                    {reports.map((report) => (
                        <Grid size={{ xs: 12, md: 4 }} key={report.id}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                p: 3, 
                                position: 'relative',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}>
                                {report.isNew && (
                                    <Chip label={t('new')} color="success" size="small" sx={{ position: 'absolute', top: 16, right: 16, borderRadius: 1 }} />
                                )}
                                <Box sx={{ 
                                    width: 48, 
                                    height: 48, 
                                    borderRadius: 3, 
                                    bgcolor: alpha((theme.palette as any)[report.color].main, 0.1), 
                                    color: (theme.palette as any)[report.color].main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2
                                }}>
                                    <Icon icon={report.icon} fontSize={24} />
                                </Box>
                                
                                <Typography variant="h6" fontWeight="bold" gutterBottom>{report.title}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                                    {report.description}
                                </Typography>

                                <Stack spacing={1} sx={{ mb: 3 }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">{t('generated')}</Typography>
                                        <Typography variant="caption" fontWeight="bold">{report.generatedAt}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">{t('version')}</Typography>
                                        <Typography variant="caption" fontWeight="bold">{report.version}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">{t('pages')}</Typography>
                                        <Typography variant="caption" fontWeight="bold">{t('pagesCount', {count: report.pages})}</Typography>
                                    </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="contained" 
                                        color="warning" 
                                        fullWidth 
                                        startIcon={<Icon icon="tabler-download" fontSize={16} />}
                                    >
                                        {t('download')}
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="inherit" 
                                        sx={{ color: 'text.secondary', borderColor: 'divider' }}
                                        onClick={() => onViewReport(report.id)}
                                    >
                                        {t('preview')}
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    ))}
                 </Grid>
            </Stack>
        </Stack>
    );
};
