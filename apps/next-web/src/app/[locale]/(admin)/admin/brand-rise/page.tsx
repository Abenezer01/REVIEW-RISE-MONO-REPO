import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const AdminBrandRisePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          BrandRise™
        </Typography>
        <Typography variant='body1'>
          Admin tools for brand identity, assets, and guidelines.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminBrandRisePage
