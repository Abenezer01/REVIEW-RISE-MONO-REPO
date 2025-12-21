/* eslint-disable import/no-unresolved */
import { forwardRef, type ReactElement, type Ref } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Slide from '@mui/material/Slide'
import { useTheme } from '@mui/material/styles'
import { type TransitionProps } from '@mui/material/transitions'

import CustomChip from '@core/components/mui/Chip'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface JobDetailModalProps {
  open: boolean
  onClose: () => void
  job: any
  onRetry: (id: string) => void
  onResolve: (id: string) => void
  onIgnore: (id: string) => void
}

const JobDetailModal = ({ open, onClose, job, onRetry, onResolve, onIgnore }: JobDetailModalProps) => {
  const theme = useTheme()

  if (!job) return null

  const statusColors: Record<string, 'error' | 'success' | 'warning' | 'info' | 'primary' | 'secondary'> = {
    failed: 'error',
    completed: 'success',
    pending: 'warning',
    processing: 'info',
    resolved: 'success',
    ignored: 'secondary'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'failed':
        return 'tabler-alert-triangle'
      case 'completed':
      case 'resolved':
        return 'tabler-check'
      case 'processing':
        return 'tabler-loader-2'
      case 'pending':
        return 'tabler-clock'
      case 'ignored':
        return 'tabler-eye-off'
      default:
        return 'tabler-circle'
    }
  }

  // Helper to safely get color key
  const colorKey = (statusColors[job.status] || 'primary') as 'error' | 'success' | 'warning' | 'info' | 'primary' | 'secondary';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      TransitionComponent={Transition}
      scroll='paper'
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: theme.shadows[5]
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 4,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme: any) => `rgba(${theme.palette[colorKey].mainChannel} / 0.1)`,
            color: `${colorKey}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className={getStatusIcon(job.status)} style={{ fontSize: '1.75rem' }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 0.5 }}>
              Job Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CustomChip
                    label={job.status}
                    color={colorKey}
                    size='small'
                    variant='tonal'
                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                />
                <Typography variant='body2' color='text.secondary'>
                    ID: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{job.id}</Box>
                </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='overline' color='text.secondary' sx={{ fontWeight: 600, display: 'block', mb: 2 }}>
                    Configuration
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ mb: 0.5 }}>Job Type</Typography>
                    <CustomChip
                        label={job.type.replace('_', ' ')}
                        color='primary'
                        size='small'
                        variant='outlined'
                        sx={{ textTransform: 'capitalize' }}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ mb: 0.5 }}>Business</Typography>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {job.business?.name || 'N/A'}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant='subtitle2' sx={{ mb: 0.5 }}>Location</Typography>
                    <Typography variant='body1'>
                        {job.location?.name || 'N/A'}
                    </Typography>
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='overline' color='text.secondary' sx={{ fontWeight: 600, display: 'block', mb: 2 }}>
                    Execution & Timing
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ mb: 0.5 }}>Created At</Typography>
                    <Typography variant='body1'>
                        {new Date(job.createdAt).toLocaleString()}
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ mb: 0.5 }}>Failed At</Typography>
                    <Typography variant='body1' color={job.failedAt ? 'error.main' : 'text.primary'}>
                        {job.failedAt ? new Date(job.failedAt).toLocaleString() : '-'}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant='subtitle2' sx={{ mb: 0.5 }}>Retry Count</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant='body1' fontWeight={500}>
                            {job.retryCount}
                         </Typography>
                         <Typography variant='body2' color='text.secondary'>
                            of {job.maxRetries} max retries
                         </Typography>
                    </Box>
                </Box>
            </Grid>
            </Grid>
        </Box>

        <Divider />

        {job.error && (
            <Box sx={{ p: 4, bgcolor: (theme) => `rgba(${theme.palette.error.mainChannel} / 0.02)` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <i className='tabler-alert-circle' style={{ color: theme.palette.error.main }} />
                    <Typography variant='h6' sx={{ color: 'error.main' }}>Error Details</Typography>
                </Box>
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 300,
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                }}>
                    <pre style={{ margin: 0 }}>
                        {JSON.stringify(job.error, null, 2)}
                    </pre>
                </Box>
            </Box>
        )}

        {(job.payload || job.result) && (
            <>
                <Divider />
                <Box sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant='h6' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='tabler-code' /> Payload
                            </Typography>
                            <Box sx={{
                                bgcolor: 'action.hover',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: 300,
                                border: `1px solid ${theme.palette.divider}`,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem'
                            }}>
                                <pre style={{ margin: 0 }}>
                                    {JSON.stringify(job.payload, null, 2)}
                                </pre>
                            </Box>
                        </Grid>

                        {job.result && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant='h6' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className='tabler-file-check' /> Result / Metadata
                                </Typography>
                                <Box sx={{
                                    bgcolor: 'action.hover',
                                    p: 2,
                                    borderRadius: 1,
                                    overflow: 'auto',
                                    maxHeight: 300,
                                    border: `1px solid ${theme.palette.divider}`,
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                }}>
                                    <pre style={{ margin: 0 }}>
                                        {JSON.stringify(job.result, null, 2)}
                                    </pre>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant='outlined' color='secondary'>
            Close
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
            {job.status === 'failed' && (
            <>
                <Button
                variant='outlined'
                color='secondary'
                onClick={() => onIgnore(job.id)}
                startIcon={<i className='tabler-eye-off' />}
                >
                Ignore
                </Button>
                <Button
                variant='outlined'
                color='success'
                onClick={() => onResolve(job.id)}
                startIcon={<i className='tabler-check' />}
                >
                Resolve
                </Button>
                <Button
                variant='contained'
                color='primary'
                onClick={() => onRetry(job.id)}
                startIcon={<i className='tabler-refresh' />}
                sx={{ px: 4 }}
                >
                Retry Job
                </Button>
            </>
            )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default JobDetailModal
