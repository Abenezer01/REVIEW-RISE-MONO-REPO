import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useTranslations } from 'next-intl'

const AdminReviewsPage = () => {
  const tDashboard = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          {tDashboard('reviews.title')}
        </Typography>
        <Typography variant='body1'>
          {tCommon('app.description')}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminReviewsPage
