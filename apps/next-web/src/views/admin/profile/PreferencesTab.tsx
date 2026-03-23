'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

import { useTranslation } from '@/hooks/useTranslation'
import CustomTextField from '@core/components/mui/TextField'

const PreferencesTab = () => {
    const t = useTranslation('dashboard')

    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 6 }}>{t('accounts.profile.preferences.localization')}</Typography>

                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            select
                            fullWidth
                            label={t('accounts.profile.preferences.language')}
                            defaultValue='english'
                        >
                            <MenuItem value='english'>{t('common.language.english')}</MenuItem>
                            <MenuItem value='arabic'>{t('common.language.arabic')}</MenuItem>
                            <MenuItem value='french'>{t('common.language.french')}</MenuItem>
                            <MenuItem value='german'>{t('common.language.german')}</MenuItem>
                            <MenuItem value='portuguese'>{t('common.language.portuguese')}</MenuItem>
                        </CustomTextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            select
                            fullWidth
                            label={t('accounts.profile.preferences.timezone')}
                            defaultValue='gmt-4'
                        >
                            <MenuItem value='gmt-12'>{t('accounts.profile.timezones.gmt-12')}</MenuItem>
                            <MenuItem value='gmt-11'>{t('accounts.profile.timezones.gmt-11')}</MenuItem>
                            <MenuItem value='gmt-10'>{t('accounts.profile.timezones.gmt-10')}</MenuItem>
                            <MenuItem value='gmt-9'>{t('accounts.profile.timezones.gmt-9')}</MenuItem>
                            <MenuItem value='gmt-8'>{t('accounts.profile.timezones.gmt-8')}</MenuItem>
                            <MenuItem value='gmt-7'>{t('accounts.profile.timezones.gmt-7')}</MenuItem>
                            <MenuItem value='gmt-6'>{t('accounts.profile.timezones.gmt-6')}</MenuItem>
                            <MenuItem value='gmt-5'>{t('accounts.profile.timezones.gmt-5')}</MenuItem>
                            <MenuItem value='gmt-4'>{t('accounts.profile.timezones.gmt-4')}</MenuItem>
                            <MenuItem value='gmt-l'>{t('accounts.profile.timezones.gmt-l')}</MenuItem>
                            <MenuItem value='gmt+1'>{t('accounts.profile.timezones.gmt+1')}</MenuItem>
                            <MenuItem value='gmt+2'>{t('accounts.profile.timezones.gmt+2')}</MenuItem>
                            <MenuItem value='gmt+3'>{t('accounts.profile.timezones.gmt+3')}</MenuItem>
                            <MenuItem value='gmt+4'>{t('accounts.profile.timezones.gmt+4')}</MenuItem>
                        </CustomTextField>

                        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                            {t('accounts.profile.preferences.timezoneDesc')}
                        </Typography>
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant='h5' sx={{ mb: 4 }}>{t('accounts.profile.preferences.notifications')}</Typography>

                        <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
                            {t('accounts.profile.preferences.notificationsDesc')}
                        </Typography>

                        {/* Notification toggles go here - placeholder for now */}
                        <Typography variant='body2' sx={{ fontStyle: 'italic', mb: 6 }}>
                            {t('accounts.profile.preferences.managedGlobally')}
                        </Typography>

                        <Button variant='contained' sx={{ mr: 4 }}>
                            {t('accounts.profile.preferences.savePreferences')}
                        </Button>

                        <Button type='reset' variant='tonal' color='secondary'>
                            {t('accounts.profile.general.reset')}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PreferencesTab
