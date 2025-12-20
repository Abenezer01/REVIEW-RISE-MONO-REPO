/* eslint-disable import/no-unresolved */
'use client'

import { useMemo } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'

// Third-party Imports
import * as yup from 'yup'

// Core Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Shared Imports
import FormPageWrapper from '@/components/shared/form/form-wrapper'

// Actions
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
  const initialValues = useMemo(
    () => ({
      name: account?.name || '',
      email: account?.email || '',
      status: account?.status || 'active',
      plan: account?.subscriptions?.[0]?.plan || 'free',
      description: account?.description || ''
    }),
    [account]
  )

  const handleClose = () => {
    onClose()
  }

  const handleAction = async (data: any) => {
    let result
    
    if (account) {
      result = await updateAccount(account.id, data)
    } else {
      result = await createAccount(data)
    }

    if (!result.success) {
      throw result
    }

    return {
      success: true,
      data: result.data as any,
      statusCode: 200,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'generated-from-client'
      }
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleClose}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ p: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h5'>{account ? 'Edit Account' : 'New Account'}</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <i className='tabler-x' style={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <CustomAvatar skin='light' color='primary' variant='rounded' sx={{ width: 58, height: 58 }}>
            <i className='tabler-building-skyscraper' style={{ fontSize: '2rem' }} />
          </CustomAvatar>
        </Box>
        <Typography variant='body2' color='text.secondary' align='center' sx={{ mb: 6 }}>
          {account ? 'Update account details and subscription' : 'Create a new organization account'}
        </Typography>

        <FormPageWrapper
          renderPage={false}
          validationSchema={validationSchema}
          initialValues={initialValues}
          edit={!!account}
          title={account ? 'Account' : 'Account'}
          onCancel={handleClose}
          getPayload={values => values}
          createActionFunc={handleAction}
          onActionSuccess={() => {
            onSuccess()
            handleClose()
          }}
        >
          {formik => (
            <Grid container spacing={5}>
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Account Name'
                  placeholder='e.g. Acme Corp'
                  {...formik.getFieldProps('name')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && (formik.errors.name as string)}
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
                  helperText={
                    (formik.touched.email && (formik.errors.email as string)) ||
                    (account && 'Owner email cannot be changed directly')
                  }
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
                  helperText={formik.touched.status && (formik.errors.status as string)}
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
                  helperText={formik.touched.plan && (formik.errors.plan as string)}
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
                  helperText={formik.touched.description && (formik.errors.description as string)}
                />
              </Grid>
            </Grid>
          )}
        </FormPageWrapper>
      </Box>
    </Drawer>
  )
}

export default AccountDialog
