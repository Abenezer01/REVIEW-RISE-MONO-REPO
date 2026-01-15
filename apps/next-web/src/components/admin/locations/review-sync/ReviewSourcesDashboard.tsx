import { Box, Button, Card, CardContent, Grid, LinearProgress, Typography, Dialog, Snackbar, Alert, Skeleton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import SyncIcon from '@mui/icons-material/Sync';
import GoogleIcon from '@mui/icons-material/Google';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

import ConnectGoogleModal from './ConnectGoogleModal';
import ConnectionSuccessView from './ConnectionSuccessView';
import ConnectedSourceCard from './ConnectedSourceCard';
import AvailableSourceCard from './AvailableSourceCard';

export interface ReviewSource {
    id: string;
    platform: string;
    status: string;
    locationId: string;
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
}

const ReviewSourcesDashboard = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { id: locationId } = params;

    const [modalOpen, setModalOpen] = useState(false);
    const [view, setView] = useState<'dashboard' | 'success'>('dashboard');
    const [sources, setSources] = useState<ReviewSource[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false, 
        message: '', 
        severity: 'info'
    });

    // Check for success param on mount
    useEffect(() => {
        if (searchParams.get('google_connected') === 'true') {
            setView('success');
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('google_connected');
            router.replace(`?${newParams.toString()}`);
            setSnackbar({ open: true, message: 'Source connected successfully!', severity: 'success' });
        } else if (searchParams.get('google_error')) {
             setSnackbar({ open: true, message: 'Failed to connect source.', severity: 'error' });
        }
    }, [searchParams, router]);

const REVIEWS_API_URL = process.env.NEXT_PUBLIC_REVIEWS_API_URL || 'http://localhost:3006/api/v1';

    const fetchData = useCallback(async () => {
        if (!locationId) return;
        try {
            setLoading(true);
            const [sourcesRes, statsRes] = await Promise.all([
                apiClient.get(`${REVIEWS_API_URL}/locations/${locationId}/sources`),
                apiClient.get(`${REVIEWS_API_URL}/locations/${locationId}/stats`)
            ]);

            if (sourcesRes.data?.data) setSources(sourcesRes.data.data);
            if (statsRes.data?.data) setStats(statsRes.data.data);

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [locationId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleConnectTrigger = () => {
        setModalOpen(true);
    };

    const handleConnectGoogle = async () => {
        try {
            const res = await apiClient.get(`${REVIEWS_API_URL}/auth/google/connect`, {
                params: { locationId }
            });
            if (res.data?.data?.url) {
                window.location.href = res.data.data.url;
            }
        } catch (error) {
            console.error('Failed to get connect URL', error);
            setSnackbar({ open: true, message: 'Failed to initiate connection', severity: 'error' });
        }
    };

    const handleDisconnect = async (id: string) => {
        try {
            await apiClient.delete(`${REVIEWS_API_URL}/sources/${id}`);
            setSnackbar({ open: true, message: 'Source disconnected', severity: 'success' });
            fetchData();
        } catch (error) {
            console.error('Failed to disconnect', error);
            setSnackbar({ open: true, message: 'Failed to disconnect source', severity: 'error' });
        }
    };

    const handleSyncAll = async () => {
        if (!locationId) return;
        try {
            setSyncing(true);
            setSnackbar({ open: true, message: 'Sync started...', severity: 'info' });
            await apiClient.post(`${REVIEWS_API_URL}/locations/${locationId}/sync`);
            setSnackbar({ open: true, message: 'Sync completed successfully', severity: 'success' });
            fetchData();
        } catch (error) {
            console.error('Sync failed', error);
            setSnackbar({ open: true, message: 'Sync failed', severity: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleGoToDashboard = () => {
        setView('dashboard');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <ConnectGoogleModal 
                open={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onConnect={handleConnectGoogle} 
            />

            <Dialog 
                open={view === 'success'} 
                onClose={handleGoToDashboard}
                maxWidth="sm"
                fullWidth
            >
                <ConnectionSuccessView onGoToDashboard={handleGoToDashboard} onViewLogs={handleGoToDashboard} />
            </Dialog>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Review Sources</Typography>
                    <Typography variant="body2" color="text.secondary">Connect and manage your review platforms</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    color="warning" 
                    startIcon={<SyncIcon />} 
                    onClick={handleSyncAll}
                    disabled={syncing || loading}
                >
                    {syncing ? 'Syncing...' : 'Sync All Now'}
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">CONNECTED SOURCES</Typography>
                                {loading ? <Skeleton variant="rectangular" width={40} height={40} sx={{ my: 1 }} /> : (
                                    <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>{sources.length}</Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    {loading ? <Skeleton width={100} /> : `${sources.length > 0 ? 'Active sources' : 'No sources connected'}`}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, color: 'primary.contrastText' }}>
                                <SyncIcon />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 4}}>
                     <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">TOTAL REVIEWS</Typography>
                                {loading ? <Skeleton variant="rectangular" width={60} height={40} sx={{ my: 1 }} /> : (
                                    <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>{stats?.totalReviews || 0}</Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    {loading ? <Skeleton width={120} /> : `Average Rating: ${stats?.averageRating || 0}/5`}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'success.main', borderRadius: 2, color: 'success.contrastText' }}>
                                <StarIcon />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 4}}>
                     <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">SYNC STATUS</Typography>
                                {loading ? <Skeleton variant="rectangular" width={80} height={40} sx={{ my: 1 }} /> : (
                                    <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>{sources.length > 0 ? 'Healthy' : 'Inactive'}</Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    {loading ? <Skeleton width={140} /> : (sources.length > 0 ? 'All sources syncing properly' : 'Connect a source to start syncing')}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'secondary.main', borderRadius: 2, color: 'secondary.contrastText' }}>
                                <CheckCircleIcon />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Connected Sources List */}
                <Grid size={{xs: 12, md: 8}}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Connected Sources</Typography>
                    
                    {loading ? (
                        <>
                            <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
                            <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
                        </>
                    ) : (
                        sources.length > 0 ? (
                            sources.map(source => (
                                <ConnectedSourceCard 
                                    key={source.id} 
                                    source={source} 
                                    onDisconnect={handleDisconnect} 
                                    onConfigure={() => setSnackbar({ open: true, message: 'Configuration coming soon', severity: 'info' })}
                                />
                            ))
                        ) : (
                            <Typography color="text.secondary" sx={{ mb: 4 }}>No sources connected yet.</Typography>
                        )
                    )}

                    <Typography variant="h6" sx={{ mb: 2 }}>Available Sources</Typography>
                    
                    {/* Filter out already connected specific platforms? For MVP, Google is unique. */}
                    {!sources.some(s => s.platform === 'google') && (
                        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}><GoogleIcon color="info" /></Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Google Business Profile</Typography>
                                        <Typography variant="caption" color="text.secondary">Connect to sync reviews</Typography>
                                    </Box>
                                </Box>
                                <Button variant="contained" color="warning" onClick={handleConnectTrigger}>Connect</Button>
                            </CardContent>
                        </Card>
                    )}

                    <AvailableSourceCard platform="facebook" disabled />
                    <AvailableSourceCard platform="trustpilot" disabled />
                    <AvailableSourceCard platform="yelp" disabled />

                </Grid>

                {/* Sidebar */}
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
                        <CardContent>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                 <ScheduleIcon color="secondary" />
                                 <Typography variant="h6">Sync Status</Typography>
                             </Box>

                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                 <Typography variant="caption" color="text.secondary">Next Scheduled Sync</Typography>
                                 <Typography variant="caption" fontWeight="bold">In 4 hours</Typography>
                             </Box>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                 <Typography variant="caption" color="text.secondary">Sync Frequency</Typography>
                                 <Typography variant="caption" fontWeight="bold">Daily at 2:00 AM</Typography>
                             </Box>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                 <Typography variant="caption" color="text.secondary">Last Sync Duration</Typography>
                                 <Typography variant="caption" fontWeight="bold">2m 34s</Typography>
                             </Box>
                             
                             <Typography variant="caption" color="text.secondary" gutterBottom>Current Sync Progress</Typography>
                             <LinearProgress variant="determinate" value={syncing ? 30 : 0} sx={{ bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' } }} />
                        </CardContent>
                    </Card>

                    <Card>
                         <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Box sx={{ p: 0.5, bgcolor: 'success.main', borderRadius: 1, height: 'fit-content', color: 'success.contrastText' }}>
                                    <CheckCircleIcon fontSize="small" color="inherit" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">Google sync completed</Typography>
                                    <Typography variant="caption" color="text.secondary">2 hours ago • 23 new reviews</Typography>
                                </Box>
                            </Box>
                         </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReviewSourcesDashboard;
