/* eslint-disable import/no-unresolved */
'use client'

import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import * as yup from 'yup'

// Core Imports
import CustomTextField from '@core/components/mui/TextField'

import FormPageWrapper from '@/components/shared/form/form-wrapper'

// Actions
import { createAccount, updateAccount, getRoles } from '@/app/actions/account'

interface UserDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user?: any
}

const UserDialog = ({ open, onClose, onSuccess, user }: UserDialogProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    const fetchRoles = async () => {
      const fetchedRoles = await getRoles()
      
      setRoles(fetchedRoles)
    }

    fetchRoles()
  }, [])

  const validationSchema = useMemo(() => yup.object({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    role: yup.string().required('Role is required'),
    password: user ? yup.string() : yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
  }), [user])

  const initialValues = useMemo(
    () => {
      // Handle both flat structure (new) and nested structure (old)
      const name = user?.name || user?.user?.name || ''
      const email = user?.email || user?.user?.email || ''
      const roleName = typeof user?.role === 'string' ? user.role : (user?.role?.name || 'User')

      const nameParts = name.split(' ')
      const firstName = nameParts.length > 0 ? nameParts[0] : ''
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

      return {
        firstName,
        lastName,
        email,
        role: roleName,
        password: ''
      }
    },
    [user]
  )

  const handleClose = () => {
    onClose()
  }

  const handleAction = async (apiPayload: any) => {
    const { data } = apiPayload
    
    const payload = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: data.role,
      password: data.password
    }

    const userId = user?.user?.id || user?.id

    const result = user
      ? await updateAccount(userId, payload)
      : await createAccount(payload)

    if (!result.success) {
      throw result
    }

    return {
      success: true,
      data: data as any, // Cast to any to bypass type mismatch between form values and API result
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
        <Typography variant='h5'>{user ? 'Edit User' : 'Add User'}</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: 'text.secondary' }}>
          <i className='tabler-x' style={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 6 }}>
        <FormPageWrapper
          renderPage={false}
          validationSchema={validationSchema}
          initialValues={initialValues}
          edit={!!user}
          title={user ? 'User' : 'User'}
          onCancel={handleClose}
          getPayload={values => ({ data: values })}
          createActionFunc={handleAction}
          onActionSuccess={() => {
            onSuccess()
            handleClose()
          }}
        >
          {formik => (
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='First Name'
                  placeholder='e.g. John'
                  {...formik.getFieldProps('firstName')}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && (formik.errors.firstName as string)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Last Name'
                  placeholder='e.g. Doe'
                  {...formik.getFieldProps('lastName')}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && (formik.errors.lastName as string)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Email'
                  placeholder='e.g. john@example.com'
                  {...formik.getFieldProps('email')}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && (formik.errors.email as string)}
                  disabled={!!user}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  select
                  fullWidth
                  label='Role'
                  {...formik.getFieldProps('role')}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && (formik.errors.role as string)}
                >
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value='User'>User</MenuItem>
                  )}
                </CustomTextField>
              </Grid>
              {!user && (
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    fullWidth
                    label='Password'
                    placeholder='············'
                    type={showPassword ? 'text' : 'password'}
                    {...formik.getFieldProps('password')}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && (formik.errors.password as string)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </FormPageWrapper>
      </Box>
    </Drawer>
  )
}

export default UserDialog