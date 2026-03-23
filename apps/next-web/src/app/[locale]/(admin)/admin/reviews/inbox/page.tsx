/* eslint-disable import/no-unresolved */
import Grid from '@mui/material/Grid'

import ReviewsInboxDashboard from '@/views/admin/reviews/ReviewsInboxDashboard'

const AdminReviewsInboxPage = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <ReviewsInboxDashboard />
            </Grid>
        </Grid>
    )
}

export default AdminReviewsInboxPage
