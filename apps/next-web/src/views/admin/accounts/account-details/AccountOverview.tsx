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

const AccountOverview = ({ data }: { data: any }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Subscription Details'
            subheader='Current plan and status'
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
                      {sub.plan} Plan
                    </Typography>
                    <CustomChip
                      size='small'
                      variant='tonal'
                      color={sub.status === 'active' ? 'success' : 'error'}
                      label={sub.status}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <i className='tabler-calendar-time' style={{ marginRight: 8 }} />
                    <Typography variant='body1'>
                      Renews on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
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
                  <Typography variant='subtitle1'>No active subscription</Typography>
                  <Typography variant='body2' color='text.secondary'>This account is on the free tier.</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='Account Stats'
            subheader='Overview of account usage'
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
                    <Typography variant='body2' color='text.secondary'>Locations</Typography>
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
                    <Typography variant='body2' color='text.secondary'>Users</Typography>
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
