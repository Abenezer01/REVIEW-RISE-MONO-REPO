/* eslint-disable import/no-unresolved */

import { Suspense } from 'react'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

import { useTranslations } from 'next-intl'

import AdminKPIWidgets from '@/components/admin/dashboard/AdminKPIWidgets'
import AdminErrorBoundary from '@/components/admin/layout/AdminErrorBoundary'

const AdminPage = () => {
  const tDashboard = useTranslations('dashboard')
  const tCommon = useTranslations('common')

  return (
    <AdminErrorBoundary>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Typography variant='h3' className='mbe-2'>
            {tDashboard('overview.title')}
          </Typography>
          <Typography variant='body1'>
            {tDashboard('overview.welcome')}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 2 }}>
            <Suspense fallback={<Box aria-busy='true' aria-live='polite'>{tCommon('common.loading')}</Box>}>
              <AdminKPIWidgets />
            </Suspense>
          </Box>
        </Grid>
      </Grid>
    </AdminErrorBoundary>
  )
}

export default AdminPage
