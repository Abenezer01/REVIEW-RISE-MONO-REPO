
'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import LocationForm from '@/components/admin/locations/LocationForm'
import apiClient from '@/lib/apiClient'

const EditLocationPage = () => {
    const params = useParams()
    const [location, setLocation] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            apiClient.get(`/admin/locations/${params.id}`)
                .then(res => {
                    setLocation(res.data)
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
    }, [params.id])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!location) {
        return <Typography>Location not found</Typography>
    }

    return (
        <Grid container spacing={6}>
            <Grid>
                <Typography variant='h5'>Edit Location</Typography>
            </Grid>
            <Grid>
                <LocationForm initialData={location} isEdit />
            </Grid>
        </Grid>
    )
}

export default EditLocationPage
