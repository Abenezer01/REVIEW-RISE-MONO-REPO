import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

const Icon = ({ icon, fontSize, ...rest }: { icon: string; fontSize?: number;[key: string]: any }) => {
    return <i className={icon} style={{ fontSize }} {...rest} />
}

export interface Job {
    id: string;
    title: string;
    type: string;
    status: 'running' | 'completed' | 'failed';
    progress?: number;
    startedAt?: string;
    estimatedTime?: string;
    brand?: string;
    completedAt?: string;
    duration?: string;
    output?: string;
    reportId?: string;
    error?: string;
    failedAt?: string;
    retryCount?: string;
    target?: string;
}

interface JobCardProps {
    job: Job;
    onViewReport: (reportId: string) => void;
}

export const JobCard = ({ job, onViewReport }: JobCardProps) => {
    const theme = useTheme();
    const t = useTranslations('dashboard.brandRise.jobs');

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'running': return 'info';
            case 'completed': return 'success';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card sx={{ 
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
    );
};
