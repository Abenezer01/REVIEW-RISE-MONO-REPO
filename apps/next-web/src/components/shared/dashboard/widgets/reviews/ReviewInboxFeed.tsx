'use client'

import React from 'react';
import { Box, Typography, TextField, MenuItem, CircularProgress } from '@mui/material';
import ReviewCard from './ReviewCard';
import { useReviewsInbox, type ReviewFeedFilters } from '@/views/admin/reviews/hooks/useReviewsInbox';
import { useSearchParams } from 'next/navigation';
import useTranslation from '@/hooks/useTranslation';

export default function ReviewInboxFeed() {
    const searchParams = useSearchParams();
    const locationId = searchParams.get('locationId') || 'default';
    const t = useTranslation('dashboard');

    const { reviews, isLoading, isError, generateAiReply, postReply, filters, setFilters } = useReviewsInbox(locationId);

    const handleFilterChange = (key: keyof ReviewFeedFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Box>
            {/* Search & Filter Bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('widgets.reviewInbox.searchPlaceholder')}
                    sx={{ bgcolor: 'background.paper', borderRadius: 1, maxWidth: 320 }}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <TextField
                    select
                    size="small"
                    value={filters.replyStatus || 'unanswered'}
                    onChange={(e) => handleFilterChange('replyStatus', e.target.value)}
                    sx={{ minWidth: 175, bgcolor: 'background.paper', borderRadius: 1 }}
                >
                    <MenuItem value="all">{t('widgets.reviewInbox.status.all')}</MenuItem>
                    <MenuItem value="unanswered">{t('widgets.reviewInbox.status.unanswered')}</MenuItem>
                    <MenuItem value="replied">{t('widgets.reviewInbox.status.replied')}</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    value={filters.rating || 'all'}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    sx={{ minWidth: 140, bgcolor: 'background.paper', borderRadius: 1 }}
                >
                    <MenuItem value="all">{t('widgets.reviewInbox.rating.all')}</MenuItem>
                    <MenuItem value="5">⭐⭐⭐⭐⭐ {t('widgets.reviewInbox.rating.stars5')}</MenuItem>
                    <MenuItem value="4">⭐⭐⭐⭐ {t('widgets.reviewInbox.rating.stars4plus')}</MenuItem>
                    <MenuItem value="3">⭐⭐⭐ {t('widgets.reviewInbox.rating.stars3plus')}</MenuItem>
                    <MenuItem value="2">⭐⭐ {t('widgets.reviewInbox.rating.stars2less')}</MenuItem>
                </TextField>
                <TextField
                    select
                    size="small"
                    value={filters.sentiment || 'all'}
                    onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                    sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 1 }}
                >
                    <MenuItem value="all">{t('widgets.reviewInbox.sentiment.all')}</MenuItem>
                    <MenuItem value="Positive">{t('widgets.reviewCard.sentiment.Positive')}</MenuItem>
                    <MenuItem value="Neutral">{t('widgets.reviewCard.sentiment.Neutral')}</MenuItem>
                    <MenuItem value="Negative">{t('widgets.reviewCard.sentiment.Negative')}</MenuItem>
                </TextField>
            </Box>

            {/* Feed */}
            <Box>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Typography variant="body1" color="error" sx={{ textAlign: 'center', p: 4 }}>
                        {t('widgets.reviewInbox.loadFailed')}
                    </Typography>
                ) : reviews.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
                        {t('widgets.reviewInbox.noResults')}
                    </Typography>
                ) : (
                    reviews.map((review: any) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            onGenerateReply={(tone) => generateAiReply({ reviewId: review.id, tone })}
                            onPostReply={(content) => postReply({ reviewId: review.id, content })}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
}
