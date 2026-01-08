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
import { useFormikContext } from 'formik'

// Core Imports
import CustomTextField from '@core/components/mui/TextField'

import FormPageWrapper from '@/components/shared/form/form-wrapper'

// Actions
import { createAccount, updateAccount, getRoles, getLocations, getBusinesses } from '@/app/actions/account'

interface UserDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user?: any
  businessId?: string
}

const LocationWatcher = ({ setLocations, setLoadingLocations }: { setLocations: (locs: any[]) => void, setLoadingLocations: (loading: boolean) => void }) => {
  const { values, setFieldValue } = useFormikContext<any>()
  const businessId = values.businessId

  useEffect(() => {
    const fetchLocs = async () => {
      if (businessId) {
        setLoadingLocations(true)

        try {
          const fetchedLocations = await getLocations(businessId)

          setLocations(fetchedLocations)

          // Clear locationId if it's not in the new locations list
          // and only if we are not in the initial mount phase for an existing user
          if (fetchedLocations.length > 0 && values.locationId) {
            const locationExists = fetchedLocations.some(loc => loc.id === values.locationId)

            if (!locationExists) {
              setFieldValue('locationId', '')
            }
          } else if (fetchedLocations.length === 0) {
            setFieldValue('locationId', '')
          }
        } finally {
          setLoadingLocations(false)
        }
      } else {
        setLocations([])
        setFieldValue('locationId', '')
      }
    }

    fetchLocs()
  }, [businessId, setLocations, setLoadingLocations, setFieldValue]) // Removed values.locationId from deps to avoid infinite loop

  return null
}

const UserDialog = ({ open, onClose, onSuccess, user, businessId: propBusinessId }: UserDialogProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)

  useEffect(() => {
    const fetchInitialData = async () => {
      const [fetchedRoles, fetchedBusinesses] = await Promise.all([
        getRoles(),
        getBusinesses()
      ])

      setRoles(fetchedRoles)
      setBusinesses(fetchedBusinesses)

      // Fetch initial locations if business is pre-selected (for edit mode or propBusinessId)
      const primaryRole = user?.userBusinessRoles?.[0]
      const initialBusinessId = primaryRole?.businessId || propBusinessId

      if (initialBusinessId) {
        setLoadingLocations(true)

        try {
          const initialLocations = await getLocations(initialBusinessId)

          setLocations(initialLocations)
        } finally {
          setLoadingLocations(false)
        }
      }
    }

    if (open) {
      fetchInitialData()
    }
  }, [open, user, propBusinessId])

  const validationSchema = useMemo(() => yup.object({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    role: yup.string().required('Role is required'),
    businessId: yup.string().required('Business is required'),
    locationId: locations.length > 0 ? yup.string().required('Location is required') : yup.string().nullable(),
    password: user ? yup.string() : yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
  }), [user, locations.length])

  const initialValues = useMemo(
    () => {
      // Handle both flat structure (new) and nested structure (old)
      const name = user?.name || user?.user?.name || ''
      const email = user?.email || user?.user?.email || ''
      const roleName = typeof user?.role === 'string' ? user.role : (user?.role?.name || '')

      // Find businessId and locationId if available in userBusinessRoles
      const primaryRole = user?.userBusinessRoles?.[0]
      const userBusinessId = primaryRole?.businessId || propBusinessId || ''
      const userLocationId = primaryRole?.locationId || ''

      const nameParts = name.split(' ')
      const firstName = nameParts.length > 0 ? nameParts[0] : ''
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

      return {
        firstName,
        lastName,
        email,
        role: roleName,
        businessId: userBusinessId,
        locationId: userLocationId,
        password: ''
      }
    },
    [user, propBusinessId]
  )

  const handleAction = async (apiPayload: any) => {
    const { data } = apiPayload

    const payload = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: data.role,
      businessId: data.businessId,
      locationId: data.locationId || null,
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
      data: data as any,
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
      onClose={onClose}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 450 } } }}
    >
      <Box sx={{ p: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h5'>{user ? 'Edit User' : 'Add User'}</Typography>
        <IconButton size='small' onClick={onClose} sx={{ color: 'text.secondary' }}>
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
          onCancel={onClose}
          getPayload={values => ({ data: values })}
          createActionFunc={handleAction}
          onActionSuccess={() => {
            onSuccess()
            onClose()
          }}
        >
          {formik => {
            return (
              <Grid container spacing={5}>
                <LocationWatcher setLocations={setLocations} setLoadingLocations={setLoadingLocations} />
                <Grid size={{ xs: 12 }}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Business'
                    placeholder='Select Business'
                    {...formik.getFieldProps('businessId')}
                    error={formik.touched.businessId && Boolean(formik.errors.businessId)}
                    helperText={formik.touched.businessId && (formik.errors.businessId as string)}
                    slotProps={{
                      select: {
                        displayEmpty: true
                      }
                    }}
                  >
                    <MenuItem value='' disabled>
                      <Typography color='text.secondary'>Select Business</Typography>
                    </MenuItem>
                    {businesses.map((business) => (
                      <MenuItem key={business.id} value={business.id}>
                        {business.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>

                {formik.values.businessId && (
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Location'
                      placeholder='Select Location'
                      {...formik.getFieldProps('locationId')}
                      error={formik.touched.locationId && Boolean(formik.errors.locationId)}
                      helperText={formik.touched.locationId && (formik.errors.locationId as string)}
                      disabled={loadingLocations}
                      slotProps={{
                        select: {
                          displayEmpty: true
                        }
                      }}
                    >
                      <MenuItem value='' disabled>
                        <Typography color='text.secondary'>
                          {loadingLocations ? 'Loading locations...' : locations.length > 0 ? 'Select Location' : 'No locations available'}
                        </Typography>
                      </MenuItem>
                      {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>
                )}

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
                    placeholder='Select Role'
                    {...formik.getFieldProps('role')}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    helperText={formik.touched.role && (formik.errors.role as string)}
                    slotProps={{
                      select: {
                        displayEmpty: true
                      }
                    }}
                  >
                    <MenuItem value='' disabled>
                      <Typography color='text.secondary'>Select Role</Typography>
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
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
            )
          }}
        </FormPageWrapper>
      </Box>
    </Drawer>
  )
}

export default UserDialog
