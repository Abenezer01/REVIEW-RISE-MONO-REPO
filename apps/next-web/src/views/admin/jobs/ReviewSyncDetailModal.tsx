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

interface ReviewSyncDetailModalProps {
  open: boolean
  onClose: () => void
  onRetry: () => void
  job: any
}

const ReviewSyncDetailModal = ({ open, onClose, onRetry, job }: ReviewSyncDetailModalProps) => {
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

  const platform = job.platform || 'unknown'
  const responseData = job.responseData || {}
  const requestData = job.requestData || {}
  const retryCount = job.job?.retryCount || 0
  const maxRetries = job.job?.maxRetries || 3
  const isRetrying = job.job?.status === 'pending' || job.job?.status === 'processing'

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
      {/* Header with Gradient Accent */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ 
            height: 6, 
            width: '100%', 
            background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})` 
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
                        bgcolor: alpha(theme.palette.info.main, 0.08), 
                        color: 'info.main',
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        boxShadow: theme.shadows[2]
                    }}
                >
                    <i className='tabler-refresh' style={{ fontSize: '2rem' }} />
                </Avatar>
                <Box>
                    <Typography variant='h5' fontWeight={700} sx={{ letterSpacing: -0.5 }}>
                        Review Sync Details
                    </Typography>
                    <Typography component='div' variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Log ID: <Chip label={job.id} size='small' variant='outlined' sx={{ height: 20, fontFamily: 'monospace', fontSize: '0.75rem', borderRadius: 1 }} />
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isRetrying ? (
                    <CustomChip
                        label="Retrying"
                        color="warning"
                        variant='tonal'
                        size='medium'
                        icon={<i className='tabler-loader animate-spin' />}
                        sx={{ textTransform: 'uppercase', fontWeight: 700, borderRadius: 1.5, px: 1 }}
                    />
                ) : (
                    <CustomChip
                        label={job.status}
                        color={getStatusColor(job.status)}
                        variant='tonal'
                        size='medium'
                        sx={{ textTransform: 'uppercase', fontWeight: 700, borderRadius: 1.5, px: 1 }}
                    />
                )}
                <IconButton onClick={onClose} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05), '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) } }}>
                    <i className='tabler-x' />
                </IconButton>
            </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
        
        <Grid container sx={{ minHeight: 400 }}>
            {/* Left Column: Log Details */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ 
                p: 5, 
                borderRight: { md: `1px solid ${theme.palette.divider}` },
                bgcolor: 'background.paper'
            }}>
                <Typography variant='overline' color='text.secondary' fontWeight={700} sx={{ mb: 3, display: 'block', letterSpacing: 1 }}>
                    Sync Information
                </Typography>

                <Grid container spacing={3}>
                    {/* Status Card */}
                    <Grid size={{ xs: 12 }}>
                        <Paper variant='outlined' sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, borderColor: alpha(theme.palette.divider, 0.8) }}>
                            <Box sx={{ 
                                p: 1.5, 
                                borderRadius: '50%', 
                                bgcolor: alpha((theme.palette as any)[isRetrying ? 'warning' : getStatusColor(job.status)]?.main || theme.palette.secondary.main, 0.1),
                                color: `${isRetrying ? 'warning' : getStatusColor(job.status)}.main`
                            }}>
                                <i className={`tabler-${isRetrying ? 'loader animate-spin' : job.status === 'success' || job.status === 'completed' ? 'check' : job.status === 'failed' ? 'alert-triangle' : 'clock'}`} style={{ fontSize: '1.5rem' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant='subtitle2' color='text.secondary'>Current Status</Typography>
                                <Typography variant='h6' sx={{ textTransform: 'capitalize' }}>
                                    {isRetrying ? 'Retrying in background...' : job.status}
                                </Typography>
                            </Box>
                            {job.status === 'failed' && !isRetrying && (
                                <Button 
                                    variant='contained' 
                                    color='error' 
                                    size='small' 
                                    startIcon={<i className='tabler-refresh' />}
                                    onClick={onRetry}
                                    disabled={!job.jobId}
                                >
                                    Retry Job
                                </Button>
                            )}
                        </Paper>
                    </Grid>

                    {/* Platform Info */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <InfoCard 
                            icon={`tabler-brand-${platform.toLowerCase()}`}
                            title='Provider'
                            value={platform}
                            color='info'
                            isCapitalized
                        />
                    </Grid>

                    {/* Reviews Synced Info */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <InfoCard 
                            icon='tabler-star'
                            title='Reviews Synced'
                            value={job.reviewsSynced || 0}
                            color='success'
                        />
                    </Grid>

                    {/* Retry Info */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                         <InfoCard 
                            icon='tabler-rotate-clockwise'
                            title='Retry Attempts'
                            value={`${retryCount} / ${maxRetries}`}
                            color={retryCount > 0 ? 'warning' : 'secondary'}
                        />
                    </Grid>

                     {/* Duration Info */}
                     <Grid size={{ xs: 12, sm: 6 }}>
                         <InfoCard 
                            icon='tabler-clock'
                            title='Duration'
                            value={job.durationMs ? `${(job.durationMs / 1000).toFixed(2)}s` : '-'}
                            color='secondary'
                        />
                    </Grid>

                    {/* Error Details if Failed */}
                    {job.errorMessage && (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ mt: 2, p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                                <Typography variant='subtitle2' color='error.main' sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className='tabler-alert-circle' /> Error Details
                                </Typography>
                                <Typography variant='body2' sx={{ fontFamily: 'monospace', mb: 2 }}>
                                    {job.errorMessage}
                                </Typography>
                                {job.errorStack && (
                                    <Box component="pre" sx={{ 
                                        m: 0, 
                                        p: 2, 
                                        bgcolor: 'background.default', 
                                        borderRadius: 1, 
                                        fontSize: '0.75rem', 
                                        overflow: 'auto',
                                        maxHeight: 200,
                                        color: 'text.secondary'
                                    }}>
                                        {job.errorStack}
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {/* Right Column: Technical Data */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ p: 5, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                <Typography variant='overline' color='text.secondary' fontWeight={700} sx={{ mb: 3, display: 'block', letterSpacing: 1 }}>
                    Technical Data
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>Account Details</Typography>
                        <Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Avatar src={job.business?.logo} sx={{ width: 32, height: 32 }}>
                                    {job.business?.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant='body2' fontWeight={600}>{job.business?.name}</Typography>
                                    <Typography variant='caption' color='text.secondary'>{job.location?.name}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {Object.keys(responseData).length > 0 && (
                        <Box>
                            <Typography variant='subtitle2' sx={{ mb: 1 }}>Sync Response</Typography>
                            <Paper variant='outlined' sx={{ p: 0, overflow: 'hidden', bgcolor: 'background.paper' }}>
                                <Box component="pre" sx={{ m: 0, p: 2, fontSize: '0.75rem', overflow: 'auto', maxHeight: 300 }}>
                                    {JSON.stringify(responseData, null, 2)}
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    {Object.keys(requestData).length > 0 && (
                        <Box>
                            <Typography variant='subtitle2' sx={{ mb: 1 }}>Request Data</Typography>
                            <Paper variant='outlined' sx={{ p: 0, overflow: 'hidden', bgcolor: 'background.paper' }}>
                                <Box component="pre" sx={{ m: 0, p: 2, fontSize: '0.75rem', overflow: 'auto', maxHeight: 300 }}>
                                    {JSON.stringify(requestData, null, 2)}
                                </Box>
                            </Paper>
                        </Box>
                    )}

                    <Box>
                         <Typography variant='subtitle2' sx={{ mb: 1 }}>Timestamps</Typography>
                         <Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant='caption' color='text.secondary'>Created</Typography>
                                <Typography variant='caption' fontWeight={500}>{new Date(job.createdAt).toLocaleString()}</Typography>
                            </Box>
                            {job.startedAt && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant='caption' color='text.secondary'>Started</Typography>
                                    <Typography variant='caption' fontWeight={500}>{new Date(job.startedAt).toLocaleString()}</Typography>
                                </Box>
                            )}
                            {job.completedAt && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant='caption' color='text.secondary'>Completed</Typography>
                                    <Typography variant='caption' fontWeight={500}>{new Date(job.completedAt).toLocaleString()}</Typography>
                                </Box>
                            )}
                         </Paper>
                    </Box>
                </Box>
            </Grid>
        </Grid>
      </DialogContent>


      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        {job.status === 'failed' && (
            <Button 
                onClick={onRetry} 
                variant='contained' 
                color='primary' 
                startIcon={<i className='tabler-refresh' />}
                sx={{ borderRadius: 2, px: 3, mr: 1 }}
            >
                Retry Job
            </Button>
        )}
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

export default ReviewSyncDetailModal
