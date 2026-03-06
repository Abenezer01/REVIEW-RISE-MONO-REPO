/* eslint-disable import/no-unresolved */

import { Suspense } from 'react'

import Box from '@mui/material/Box'

import { useTranslations } from 'next-intl'

import AdvancedDashboard from '@/components/admin/dashboard/AdvancedDashboard'
import AdminErrorBoundary from '@/components/admin/layout/AdminErrorBoundary'

const AdminPage = () => {
  const tCommon = useTranslations('common')

  return (
    <AdminErrorBoundary>
      <Suspense fallback={<Box aria-busy='true' aria-live='polite' sx={{ p: 4 }}>{tCommon('common.loading')}</Box>}>
        <AdvancedDashboard />
      </Suspense>
    </AdminErrorBoundary>
  )
}

export default AdminPage
