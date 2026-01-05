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

const AccountChannels = () => {
  return (
    <Card>
      <CardHeader
        title='Connected Platforms'
        subheader='Manage integrations with third-party platforms'
        avatar={
          <CustomAvatar skin='light' variant='rounded' color='secondary' sx={{ width: 48, height: 48 }}>
            <i className='tabler-share' style={{ fontSize: '1.5rem' }} />
          </CustomAvatar>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                p: 6,
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover'
                }
              }}
            >
              <CustomAvatar skin='light' color='error' variant='rounded' sx={{ width: 56, height: 56 }}>
                <i className='tabler-brand-google' style={{ fontSize: '2rem' }} />
              </CustomAvatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant='h6' sx={{ mb: 0.5 }}>Google</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Business Profile
                </Typography>
              </Box>
              <CustomChip size='small' label='Connected' color='success' variant='tonal' />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                p: 6,
                border: theme => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                opacity: 0.8,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  opacity: 1
                }
              }}
            >
              <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 56, height: 56 }}>
                <i className='tabler-brand-facebook' style={{ fontSize: '2rem' }} />
              </CustomAvatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant='h6' sx={{ mb: 0.5 }}>Facebook</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Pages
                </Typography>
              </Box>
              <CustomChip size='small' label='Not Connected' color='secondary' variant='tonal' />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AccountChannels
