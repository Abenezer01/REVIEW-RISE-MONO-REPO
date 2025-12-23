import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const AdminGBPRocketPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          GBPRocket™
        </Typography>
        <Typography variant='body1'>
          Admin tools for Google Business Profile optimization and sync.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminGBPRocketPage
