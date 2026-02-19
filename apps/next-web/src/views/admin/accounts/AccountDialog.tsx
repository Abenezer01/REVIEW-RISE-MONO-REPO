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

// Hook Imports
import useTranslation from '@/hooks/useTranslation'

// Actions
import { createAccount, updateAccount } from '@/app/actions/account'

interface AccountDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  account?: any
}

const AccountDialog = ({ open, onClose, onSuccess, account }: AccountDialogProps) => {
  const t = useTranslation('dashboard')

  const validationSchema = useMemo(() => yup.object({
    name: yup.string().required(t('accounts.accountDialog.validation.nameRequired')),
    email: yup.string().email(t('accounts.accountDialog.validation.invalidEmail')).required(t('accounts.accountDialog.validation.emailRequired')),
    status: yup.string().required(t('accounts.accountDialog.validation.statusRequired')),
    plan: yup.string().required(t('accounts.accountDialog.validation.planRequired')),
    description: yup.string().max(250, t('accounts.accountDialog.validation.descriptionTooLong'))
  }), [t])

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
        <Typography variant='h5'>{account ? t('accounts.accountDialog.editTitle') : t('accounts.accountDialog.newTitle')}</Typography>
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
          {account ? t('accounts.accountDialog.editSubtitle') : t('accounts.accountDialog.newSubtitle')}
        </Typography>

        <FormPageWrapper
          renderPage={false}
          validationSchema={validationSchema}
          initialValues={initialValues}
          edit={!!account}
          title={account ? t('accounts.accountDialog.editTitle') : t('accounts.accountDialog.newTitle')}
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
                  label={t('accounts.accountDialog.fields.name')}
                  placeholder={t('accounts.accountDialog.fields.namePlaceholder')}
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
                  label={t('accounts.accountDialog.fields.ownerEmail')}
                  placeholder={t('accounts.accountDialog.fields.ownerEmailPlaceholder')}
                  {...formik.getFieldProps('email')}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={
                    (formik.touched.email && (formik.errors.email as string)) ||
                    (account && t('accounts.accountDialog.fields.ownerEmailDisabled'))
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
                  label={t('accounts.accountDialog.fields.status')}
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
                  <MenuItem value='active'>{t('accounts.accountDialog.fields.active')}</MenuItem>
                  <MenuItem value='inactive'>{t('accounts.accountDialog.fields.inactive')}</MenuItem>
                  <MenuItem value='pending'>{t('accounts.accountDialog.fields.pending')}</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <CustomTextField
                  select
                  fullWidth
                  label={t('accounts.accountDialog.fields.plan')}
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
                  <MenuItem value='free'>{t('accounts.accountDialog.fields.free')}</MenuItem>
                  <MenuItem value='pro'>{t('accounts.accountDialog.fields.pro')}</MenuItem>
                  <MenuItem value='enterprise'>{t('accounts.accountDialog.fields.enterprise')}</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('accounts.accountDialog.fields.description')}
                  placeholder={t('accounts.accountDialog.fields.descriptionPlaceholder')}
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
