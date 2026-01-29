import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import GoogleIcon from '@mui/icons-material/Google';
import StarIcon from '@mui/icons-material/Star';
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Grid, Rating, Typography } from '@mui/material';

import apiClient from '@/lib/apiClient';

interface Review {
    id: string;
    platform: string;
    author: string;
    rating: number;
    content: string;
    publishedAt: string;
    response?: string;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform.toLowerCase()) {
        case 'google': return <GoogleIcon sx={{ color: '#4285F4' }} />;
        case 'yelp': return <StarIcon sx={{ color: 'red' }} />;
        case 'facebook': return <StarIcon sx={{ color: '#1877F2' }} />;
        default: return <StarIcon />;
    }
};

const LocationReviews = () => {
    const params = useParams();
    const { id: locationId } = params;
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!locationId) return;

        const fetchReviews = async () => {
            try {
                // Use apiClient (auto-unwraps data field)
                const res = await apiClient.get<Review[]>(`/locations/${locationId}/reviews`);

                if (res.data) {
                     setReviews(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [locationId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    <StarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No reviews found</Typography>
                    <Typography variant="body2" color="text.secondary">Connect a review source to start syncing reviews.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Grid container spacing={3}>
            {reviews.map((review) => (
                <Grid size={12} key={review.id}>
                    <Card sx={{ bgcolor: '#0D0E14', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar alt={review.author}>
                                        {review.author?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {review.author}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Rating value={review.rating} readOnly size="small" />
                                            <Typography variant="caption" color="text.secondary">
                                                • {new Date(review.publishedAt).toLocaleDateString()}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, bgcolor: 'rgba(255,255,255,0.05)', px: 1, borderRadius: 1 }}>
                                                <PlatformIcon platform={review.platform} />
                                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{review.platform}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            
                            <Typography variant="body2" sx={{ mt: 2, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                                {review.content}
                            </Typography>

                            {review.response && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                                    <Typography variant="caption" color="primary.main" fontWeight="bold">Response</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {review.response}
                                    </Typography>
                                </Box>
                            )}

                             <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    {!review.response && (
                                        <Button size="small" variant="outlined" color="primary">
                                            Reply
                                        </Button>
                                    )}
                             </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default LocationReviews;
