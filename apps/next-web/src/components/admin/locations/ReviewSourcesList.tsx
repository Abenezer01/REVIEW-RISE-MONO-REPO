import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import apiClient from '@/lib/apiClient';
import { useTranslation } from '@/hooks/useTranslation';

interface ReviewSource {
    id: string;
    platform: string;
    status: string;
    locationId: string;
}

const ReviewSourcesList = ({ locationId }: { locationId: string }) => {
    // const t = useTranslation('dashboard');
    const [sources, setSources] = useState<ReviewSource[]>([]);
    // const [loading, setLoading] = useState(false);

    const fetchSources = async () => {
        try {
            // Path: via Nginx /api/reviews -> express-reviews
            const res = await apiClient.get(`/reviews/api/v1/locations/${locationId}/sources`);
            if (res.data?.data) {
                setSources(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch sources', error);
        }
    };

    useEffect(() => {
        if (locationId) fetchSources();
    }, [locationId]);

    const handleConnectGoogle = async () => {
        try {
            // Get auth URL
            const res = await apiClient.get('/reviews/api/v1/auth/google/connect', {
                params: { locationId }
            });
            if (res.data?.data?.url) {
                window.location.href = res.data.data.url;
            }
        } catch (error) {
            console.error('Failed to get connect URL', error);
        }
    };

    const handleDisconnect = async (id: string) => {
        try {
            await apiClient.delete(`/reviews/api/v1/sources/${id}`);
            fetchSources();
        } catch (error) {
            console.error('Failed to disconnect', error);
        }
    }

    // Check if google is already connected
    const googleSource = sources.find(s => s.platform === 'google' && s.status === 'active');

    return (
        <Grid container spacing={2}>
             <Grid size={{ xs: 12 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>Review Sources</Typography>
             </Grid>
             
             {/* Google Business Profile */}
             <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined">
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                             {/* Use icon if available or just text */}
                            <Typography variant="h6">
                                Google Business Profile
                            </Typography>
                        </div>
                       
                        <Typography color="textSecondary" gutterBottom>
                            {googleSource ? 'Connected' : 'Not Connected'}
                        </Typography>
                        
                        {googleSource ? (
                            <Button variant="outlined" color="error" onClick={() => handleDisconnect(googleSource.id)}>
                                Disconnect
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleConnectGoogle} disabled={!locationId}>
                                Connect Google
                            </Button>
                        )}
                        {!locationId && <Typography variant="caption" display="block" color="error">Save location first to connect.</Typography>}
                    </CardContent>
                </Card>
             </Grid>
        </Grid>
    );
}

export default ReviewSourcesList;
