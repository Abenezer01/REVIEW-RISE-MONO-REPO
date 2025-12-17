
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

const AdminPage = () => {
    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <Typography variant='h3' className='mbe-2'>
                    Admin Dashboard
                </Typography>
                <Typography variant='body1'>
                    Manage users, settings, and system configurations.
                </Typography>
            </Grid>
        </Grid>
    )
}

export default AdminPage
