
'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import LocationForm from '@/components/admin/locations/LocationForm'

const CreateLocationPage = () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Typography variant='h5'>Create New Location</Typography>
            </Grid>
            <Grid item xs={12}>
                <LocationForm />
            </Grid>
        </Grid>
    )
}

export default CreateLocationPage
