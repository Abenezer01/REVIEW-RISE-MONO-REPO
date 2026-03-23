'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

import CustomTextField from '@core/components/mui/TextField'

const PreferencesTab = () => {
    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 6 }}>Localization</Typography>

                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            select
                            fullWidth
                            label='Language'
                            defaultValue='english'
                        >
                            <MenuItem value='english'>English</MenuItem>
                            <MenuItem value='arabic'>Arabic</MenuItem>
                            <MenuItem value='french'>French</MenuItem>
                            <MenuItem value='german'>German</MenuItem>
                            <MenuItem value='portuguese'>Portuguese</MenuItem>
                        </CustomTextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            select
                            fullWidth
                            label='Timezone'
                            defaultValue='gmt-4'
                        >
                            <MenuItem value='gmt-12'>(GMT-12:00) International Date Line West</MenuItem>
                            <MenuItem value='gmt-11'>(GMT-11:00) Midway Island, Samoa</MenuItem>
                            <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
                            <MenuItem value='gmt-9'>(GMT-09:00) Alaska</MenuItem>
                            <MenuItem value='gmt-8'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
                            <MenuItem value='gmt-7'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
                            <MenuItem value='gmt-6'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
                            <MenuItem value='gmt-5'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
                            <MenuItem value='gmt-4'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
                            <MenuItem value='gmt-l'>(GMT) London, Edinburgh, Lisbon, London</MenuItem>
                            <MenuItem value='gmt+1'>(GMT+01:00) Amsterdam, Berlin, Bern, Rome</MenuItem>
                            <MenuItem value='gmt+2'>(GMT+02:00) Athens, Bucharest, Istanbul</MenuItem>
                            <MenuItem value='gmt+3'>(GMT+03:00) Moscow, St. Petersburg, Riyadh</MenuItem>
                            <MenuItem value='gmt+4'>(GMT+04:00) Abu Dhabi, Muscat, Baku</MenuItem>
                        </CustomTextField>
                        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                            Used to display timestamps for reviews and notifications.
                        </Typography>
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant='h5' sx={{ mb: 4 }}>Notifications</Typography>
                        <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
                            We will email you when these important events occur:
                        </Typography>

                        {/* Notification toggles go here - placeholder for now */}
                        <Typography variant='body2' sx={{ fontStyle: 'italic', mb: 6 }}>
                            Notification settings are currently managed globally.
                        </Typography>

                        <Button variant='contained' sx={{ mr: 4 }}>
                            Save Preferences
                        </Button>
                        <Button type='reset' variant='tonal' color='secondary'>
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PreferencesTab
