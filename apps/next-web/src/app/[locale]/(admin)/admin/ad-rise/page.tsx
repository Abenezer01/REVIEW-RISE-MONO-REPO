import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const AdminAdRisePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          AdRise™
        </Typography>
        <Typography variant='body1'>
          Admin tools for advertising campaigns and performance tracking.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminAdRisePage
