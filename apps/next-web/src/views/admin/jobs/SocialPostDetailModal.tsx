/* eslint-disable import/no-unresolved */
'use client'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import { useTheme, alpha } from '@mui/material/styles'
import Fade from '@mui/material/Fade'

import CustomChip from '@core/components/mui/Chip'

interface SocialPostDetailModalProps {
  open: boolean
  onClose: () => void
  job: any
}

const SocialPostDetailModal = ({ open, onClose, job }: SocialPostDetailModalProps) => {
  const theme = useTheme()

  if (!job) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      completed: 'success',
      failed: 'error',
      pending: 'warning',
      processing: 'info',
      scheduled: 'primary'
    }
    
    return colors[status] || 'secondary'
  }

  const payload = job.payload || {}
  const platform = payload.platform || 'unknown'

  return (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth='lg'
        fullWidth
        scroll='body'
        PaperProps={{
            sx: {
                borderRadius: 4,
                boxShadow: theme.shadows[20],
                overflow: 'hidden',
                backgroundImage: 'none',
                bgcolor: 'background.paper'
            }
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
    >
      {/* Premium Header with Gradient Accent */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Top Gradient Line */}
        <Box sx={{ 
            height: 6, 
            width: '100%', 
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
        }} />
        
        <Box sx={{ 
            px: 4, 
            py: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar 
                    variant="rounded" 
                    sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08), 
                        color: 'primary.main',
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        boxShadow: theme.shadows[2]
                    }}
                >
                    <i className='tabler-social' style={{ fontSize: '2rem' }} />
                </Avatar>
                <Box>
                    <Typography variant='h5' fontWeight={700} sx={{ letterSpacing: -0.5 }}>
                        Social Post Details
                    </Typography>
                    <Typography component="div" variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Job ID: <Chip label={job.id} size='small' variant='outlined' sx={{ height: 20, fontFamily: 'monospace', fontSize: '0.75rem', borderRadius: 1 }} />
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CustomChip
                    label={job.status}
                    color={getStatusColor(job.status)}
                    variant='tonal'
                    size='medium'
                    sx={{ textTransform: 'uppercase', fontWeight: 700, borderRadius: 1.5, px: 1 }}
                />
                <IconButton onClick={onClose} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05), '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) } }}>
                    <i className='tabler-x' />
                </IconButton>
            </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
        
        <Grid container sx={{ minHeight: 500 }}>
            {/* Left Column: Mobile Preview */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ 
                p: 5, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRight: { md: `1px solid ${theme.palette.divider}` }
            }}>
                <Typography variant='overline' color='text.secondary' fontWeight={700} sx={{ mb: 3, letterSpacing: 1 }}>
                    Mobile Preview
                </Typography>

                {/* Mobile Device Frame */}
                <Box sx={{
                    width: 320,
                    bgcolor: 'background.paper',
                    borderRadius: 5,
                    border: `12px solid ${theme.palette.text.primary}`,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: theme.shadows[10],
                    '&:before': { // Notch/Top Bar
                        content: '""',
                        display: 'block',
                        height: 24,
                        bgcolor: theme.palette.background.default,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        mb: 0
                    }
                }}>
                     {/* Mock App Header */}
                     <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <i className='tabler-arrow-left' style={{ fontSize: '1.2rem' }} />
                        <Typography variant='subtitle2' fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {platform}
                        </Typography>
                        <i className='tabler-dots' style={{ fontSize: '1.2rem' }} />
                     </Box>

                     {/* Post Content Area */}
                     <Box sx={{ pb: 4 }}>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={job.business?.logo} sx={{ width: 32, height: 32 }}>
                                {job.business?.name?.charAt(0) || 'A'}
                            </Avatar>
                            <Box>
                                <Typography variant='subtitle2' lineHeight={1.2} fontSize='0.875rem'>
                                    {job.business?.name || 'Account Name'}
                                </Typography>
                                <Typography variant='caption' color='text.secondary' fontSize='0.7rem'>
                                    {job.location?.name}
                                </Typography>
                            </Box>
                        </Box>

                        {payload.mediaUrl ? (
                             <Box
                                 sx={{
                                     width: '100%',
                                     aspectRatio: '1/1',
                                     bgcolor: 'black',
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                     overflow: 'hidden'
                                 }}
                             >
                                 <Box
                                     component="img"
                                     src={payload.mediaUrl}
                                     alt="Post media"
                                     sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                 />
                             </Box>
                         ) : (
                             <Box sx={{ 
                                 width: '100%', 
                                 aspectRatio: '16/9', 
                                 bgcolor: alpha(theme.palette.action.disabled, 0.1),
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 color: 'text.disabled',
                                 flexDirection: 'column',
                                 gap: 1
                             }}>
                                 <i className='tabler-photo-off' style={{ fontSize: '2rem' }} />
                             </Box>
                         )}

                         <Box sx={{ px: 2, py: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1.5, color: 'text.primary' }}>
                                <i className='tabler-heart' style={{ fontSize: '1.2rem' }} />
                                <i className='tabler-message-circle' style={{ fontSize: '1.2rem' }} />
                                <i className='tabler-send' style={{ fontSize: '1.2rem' }} />
                            </Box>
                            <Typography variant='body2' fontSize='0.875rem' sx={{ whiteSpace: 'pre-wrap' }}>
                                <Box component="span" fontWeight={600} sx={{ mr: 1 }}>
                                    {job.business?.name || 'user'}
                                </Box>
                                {payload.content || 'No text content'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block', fontSize: '0.65rem' }}>
                                {payload.scheduledTime ? new Date(payload.scheduledTime).toLocaleString() : 'Just now'}
                            </Typography>
                         </Box>
                     </Box>
                </Box>
            </Grid>

            {/* Right Column: Detailed Metadata */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ p: 5 }}>
                <Typography variant='overline' color='text.secondary' fontWeight={700} sx={{ mb: 3, display: 'block', letterSpacing: 1 }}>
                    Job Information
                </Typography>

                <Grid container spacing={3}>
                    {/* Status Card */}
                    <Grid size={{ xs: 12 }}>
                        <Paper variant='outlined' sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, borderColor: alpha(theme.palette.divider, 0.8) }}>
                            <Box sx={{ 
                                p: 1.5, 
                                borderRadius: '50%', 
                                bgcolor: alpha((theme.palette as any)[getStatusColor(job.status)]?.main || theme.palette.secondary.main, 0.1),
                                color: `${getStatusColor(job.status)}.main`
                            }}>
                                <i className={`tabler-${job.status === 'completed' ? 'check' : job.status === 'failed' ? 'alert-triangle' : 'clock'}`} style={{ fontSize: '1.5rem' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant='subtitle2' color='text.secondary'>Current Status</Typography>
                                <Typography variant='h6' sx={{ textTransform: 'capitalize' }}>{job.status}</Typography>
                            </Box>
                            {job.status === 'failed' && (
                                <Box sx={{ flex: 2, bgcolor: alpha(theme.palette.error.main, 0.05), p: 1.5, borderRadius: 1, border: `1px dashed ${theme.palette.error.main}` }}>
                                    <Typography variant='caption' color='error.main' fontWeight={600} display='block'>
                                        Error Message
                                    </Typography>
                                    <Typography variant='body2' color='error.main'>
                                        {job.error?.message || 'Unknown error occurred'}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Schedule Info */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoCard 
                            icon='tabler-calendar-event'
                            title='Scheduled For'
                            value={payload.scheduledTime ? new Date(payload.scheduledTime).toLocaleString() : 'Not scheduled'}
                            color='primary'
                        />
                    </Grid>
                    
                    {/* Platform Info */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <InfoCard 
                            icon={`tabler-brand-${platform.toLowerCase()}`}
                            title='Target Platform'
                            value={platform}
                            color='info'
                            isCapitalized
                        />
                    </Grid>

                    {/* Account Info */}
                    <Grid size={{ xs: 12 }}>
                         <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <i className='tabler-building-store' />
                                <Typography variant='subtitle1' fontWeight={600}>Account Details</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography variant='caption' color='text.secondary'>Account Name</Typography>
                                    <Typography variant='body1' fontWeight={500}>{job.business?.name || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant='caption' color='text.secondary'>Location</Typography>
                                    <Typography variant='body1' fontWeight={500}>{job.location?.name || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant='caption' color='text.secondary'>Post Type</Typography>
                                    <Chip label={payload.type || 'organic'} size='small' variant='tonal' color='secondary' sx={{ ml: 1, textTransform: 'capitalize' }} />
                                </Box>
                            </Box>
                         </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        <Button onClick={onClose} variant='contained' color='secondary' sx={{ borderRadius: 2, px: 4 }}>
            Close Detail
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Helper component for info cards
const InfoCard = ({ icon, title, value, color = 'primary', isCapitalized = false }: any) => {
    const theme = useTheme();
    
    // Cast theme.palette to any to allow dynamic indexing
    const paletteColor = (theme.palette as any)[color] || theme.palette.primary;

    return (
        <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
            <Box sx={{ 
                p: 1, 
                borderRadius: 1.5, 
                bgcolor: alpha(paletteColor.main, 0.1),
                color: `${color}.main`,
                display: 'flex'
            }}>
                <i className={icon} style={{ fontSize: '1.25rem' }} />
            </Box>
            <Box>
                <Typography variant='caption' color='text.secondary' display='block'>{title}</Typography>
                <Typography variant='body1' fontWeight={600} sx={{ textTransform: isCapitalized ? 'capitalize' : 'none' }}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    )
}

export default SocialPostDetailModal
