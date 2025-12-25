/* eslint-disable import/no-unresolved */
// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'

const AccountLocations = ({ data }: { data: any }) => {
  return (
    <Grid container spacing={6}>
      {data.locations?.length > 0 ? (
        data.locations.map((loc: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={loc.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  cursor: 'pointer'
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 4
                  }}
                >
                  <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 48, height: 48 }}>
                    <i className='tabler-building-store' style={{ fontSize: '1.5rem' }} />
                  </CustomAvatar>
                  <CustomChip
                    size='small'
                    variant='tonal'
                    color={loc.status === 'active' ? 'success' : 'default'}
                    label={loc.status}
                  />
                </Box>
                <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
                  {loc.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, color: 'text.secondary' }}>
                  <i className='tabler-map-pin' style={{ fontSize: 20 }} />
                  <Typography variant='body1' noWrap>
                    {loc.address}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid size={{ xs: 12 }}>
          <Card sx={{ border: theme => `2px dashed ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ textAlign: 'center', py: 12 }}>
              <CustomAvatar
                skin='light'
                color='secondary'
                sx={{ width: 72, height: 72, mb: 4, mx: 'auto' }}
              >
                <i className='tabler-building-off' style={{ fontSize: 36 }} />
              </CustomAvatar>
              <Typography variant='h5' sx={{ mb: 2 }}>No locations found</Typography>
              <Typography variant='body1' color='text.secondary'>
                This account has no locations yet. Add a location to get started.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default AccountLocations
