import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const AdminSocialRisePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          SocialRise™
        </Typography>
        <Typography variant='body1'>
          Admin management for social campaigns and presence.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminSocialRisePage
