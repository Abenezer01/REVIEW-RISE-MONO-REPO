/* eslint-disable import/no-unresolved */
'use client'

import { useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'

// Third-party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import { toast } from 'react-toastify'

// Core Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Actions
/* eslint-disable import/no-unresolved */
import { createAccount, updateAccount } from '@/app/actions/account'

interface AccountDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  account?: any
}

const validationSchema = yup.object({
  name: yup.string().required('Account name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  status: yup.string().required('Status is required'),
  plan: yup.string().required('Plan is required'),
  description: yup.string().max(250, 'Description too long')
})

const AccountDialog = ({ open, onClose, onSuccess, account }: AccountDialogProps) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      status: 'active',
      plan: 'free',
      description: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        let res

        if (account) {
          res = await updateAccount(account.id, values)
        } else {
          res = await createAccount(values)
        }

        if (res.success) {
          toast.success(account ? 'Account updated successfully' : 'Account created successfully')
          onSuccess()
          onClose()
          resetForm()
        } else {
          toast.error(res.message || 'Something went wrong')
        }
      } catch (error) {
        console.log(error)
        toast.error('An unexpected error occurred')
      } finally {
        setSubmitting(false)
      }
    }
  })

  // Update form values when account changes
  useEffect(() => {
    if (open) {
      if (account) {
        formik.setValues({
          name: account.name || '',
          email: account.email || '',
          status: account.status || 'active',
          plan: account.subscriptions?.[0]?.plan || 'free',
          description: account.description || ''
        })
      } else {
        formik.resetForm()
      }
    }
  }, [account, open])

  const handleClose = () => {
    onClose()
    formik.resetForm()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <IconButton
        aria-label='close'
        onClick={handleClose}
        sx={{
          top: 12,
          right: 12,
          position: 'absolute',
          color: 'text.secondary'
        }}
      >
        <i className='tabler-x' />
      </IconButton>

      <DialogTitle component='div' sx={{ textAlign: 'center', pt: 10, pb: 4, px: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 58, height: 58 }}>
            <i className='tabler-building-skyscraper' style={{ fontSize: '2rem' }} />
          </CustomAvatar>
        </Box>
        <Typography variant='h4' sx={{ mb: 1 }}>
          {account ? 'Edit Account' : 'New Account'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {account ? 'Update account details and subscription' : 'Create a new organization account'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 6, pb: 6 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Account Name'
                placeholder='e.g. Acme Corp'
                {...formik.getFieldProps('name')}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-building' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Owner Email'
                placeholder='e.g. admin@acme.com'
                {...formik.getFieldProps('email')}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={(formik.touched.email && formik.errors.email) || (account && 'Owner email cannot be changed directly')}
                disabled={!!account}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-mail' />
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Status'
                {...formik.getFieldProps('status')}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-activity' />
                      </InputAdornment>
                    )
                  }
                }}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Plan'
                {...formik.getFieldProps('plan')}
                error={formik.touched.plan && Boolean(formik.errors.plan)}
                helperText={formik.touched.plan && formik.errors.plan}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-credit-card' />
                      </InputAdornment>
                    )
                  }
                }}
              >
                <MenuItem value='free'>Free</MenuItem>
                <MenuItem value='pro'>Pro</MenuItem>
                <MenuItem value='enterprise'>Enterprise</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                label='Description'
                placeholder='Brief description...'
                {...formik.getFieldProps('description')}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'end', px: 6, pb: 8, pt: 2}}>
        <Button
          onClick={handleClose}
          variant='tonal'
          color='secondary'
          sx={{ mr: 2 }}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={formik.isSubmitting}
          loadingPosition='start'
          variant='contained'
          onClick={() => formik.handleSubmit()}
          startIcon={<i className='tabler-check' />}
        >
          {formik.isSubmitting ? (account ? 'Updating...' : 'Creating...') : account ? 'Update Account' : 'Create Account'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default AccountDialog
