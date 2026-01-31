'use client'

import React from 'react'

import { Grid } from '@mui/material'

// Dashboard
import StudioDashboard from '@/components/studio/dashboard/StudioDashboard'

export default function AIStudioPage() {
    return (
        <Grid container spacing={4}>
            <Grid size={12}>
                <StudioDashboard />
            </Grid>
        </Grid>
    )
}
