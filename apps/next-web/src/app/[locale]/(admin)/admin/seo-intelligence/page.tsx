import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const AdminSeoIntelligencePage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h3' className='mbe-2'>
          SEO Intelligence
        </Typography>
        <Typography variant='body1'>
          Admin SEO analytics and tools for local performance.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default AdminSeoIntelligencePage
