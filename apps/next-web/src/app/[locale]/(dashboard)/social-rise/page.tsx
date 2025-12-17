
'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { useApiGet } from '@/hooks/useApi'

const SocialRisePage = () => {
    useApiGet(['social-campaigns'], '/social/campaigns', {}, { enabled: false })

    return (
        <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
                <Typography variant='h3' className='mbe-2'>
                    SocialRise
                </Typography>
                <Typography variant='body1'>
                    Manage your social media presence and campaigns.
                </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
                {/* Lazy loaded heavy components can go here */}
            </Grid>
        </Grid>
    )
}

export default SocialRisePage
