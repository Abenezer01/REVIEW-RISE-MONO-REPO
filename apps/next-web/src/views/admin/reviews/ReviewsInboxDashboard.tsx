'use client'

import React from 'react';
import Grid from '@mui/material/Grid';
import ReputationHeroCard from '@/components/shared/dashboard/widgets/reviews/ReputationHeroCard';
import ReviewInboxFeed from '@/components/shared/dashboard/widgets/reviews/ReviewInboxFeed';
import SentimentTrendChart from '@/components/shared/dashboard/widgets/reviews/SentimentTrendChart';
import TopicCloudCard from '@/components/shared/dashboard/widgets/reviews/TopicCloudCard';
import ReputationActionsCard from '@/components/shared/dashboard/widgets/reviews/ReputationActionsCard';
import { Box } from '@mui/material';

export default function ReviewsInboxDashboard() {
    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* Top Header / Stats Row */}
            <ReputationHeroCard />

            {/* Main Content Grid (Feed left, Analytics right) */}
            <Grid container spacing={4}>
                {/* Left Column: The Review Feed */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <ReviewInboxFeed />
                </Grid>

                {/* Right Column: Analytics & Nudges */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <SentimentTrendChart />
                        <TopicCloudCard />
                        <ReputationActionsCard />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
