/* eslint-disable import/no-unresolved */
// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import useTranslation from '@/hooks/useTranslation'

const AccountOverview = ({ data }: { data: any }) => {
  const t = useTranslation('dashboard')

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('accounts.overview.subscription.title')}
            subheader={t('accounts.overview.subscription.subtitle')}
            avatar={
              <CustomAvatar skin='light' variant='rounded' color='warning' sx={{ width: 48, height: 48 }}>
                <i className='tabler-credit-card' style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            }
          />
          <Divider />
          <CardContent>
            {data.subscriptions?.length > 0 ? (
              data.subscriptions.map((sub: any) => (
                <Box key={sub.id} sx={{ mb: 2, p: 4, borderRadius: 1, border: theme => `1px solid ${theme.palette.divider}` }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant='h5' sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {t('accounts.overview.subscription.planName', { plan: sub.plan })}
                    </Typography>
                    <CustomChip
                      size='small'
                      variant='tonal'
                      color={sub.status === 'active' ? 'success' : 'error'}
                      label={t(`common.status.${sub.status}`)}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <i className='tabler-calendar-time' style={{ marginRight: 8 }} />
                    <Typography variant='body1'>
                      {t('accounts.overview.subscription.renewsOn', { date: new Date(sub.currentPeriodEnd).toLocaleDateString() })}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4, bgcolor: 'action.hover', borderRadius: 1 }}>
                <CustomAvatar skin='light' color='secondary' size={40}>
                  <i className='tabler-alert-circle' />
                </CustomAvatar>
                <Box>
                  <Typography variant='subtitle1'>{t('accounts.overview.subscription.noActive')}</Typography>
                  <Typography variant='body2' color='text.secondary'>{t('accounts.overview.subscription.freeTier')}</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('accounts.overview.stats.title')}
            subheader={t('accounts.overview.stats.subtitle')}
            avatar={
              <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
                <i className='tabler-chart-bar' style={{ fontSize: '1.5rem' }} />
              </CustomAvatar>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{
                  p: 4,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <CustomAvatar skin='light' color='primary' size={50}>
                    <i className='tabler-map-pin' style={{ fontSize: '1.75rem' }} />
                  </CustomAvatar>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' sx={{ fontWeight: 600 }}>{data.locations?.length || 0}</Typography>
                    <Typography variant='body2' color='text.secondary'>{t('accounts.overview.stats.locations')}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{
                  p: 4,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <CustomAvatar skin='light' color='success' size={50}>
                    <i className='tabler-users' style={{ fontSize: '1.75rem' }} />
                  </CustomAvatar>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' sx={{ fontWeight: 600 }}>
                      {data.userBusinessRoles?.length || 1}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>{t('accounts.overview.stats.users')}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AccountOverview
