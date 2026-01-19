/* eslint-disable import/no-unresolved */
import Grid from '@mui/material/Grid'

import SmartReviewList from '@/views/admin/reviews/SmartReviewList'

const AdminSmartReviewsPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SmartReviewList />
      </Grid>
    </Grid>
  )
}

export default AdminSmartReviewsPage
