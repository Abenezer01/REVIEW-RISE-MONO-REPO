/* eslint-disable import/no-unresolved */

import { Suspense } from 'react'

import Box from '@mui/material/Box'

import { useTranslations } from 'next-intl'

import HomeDashboard from '@/components/admin/dashboard/home/HomeDashboard'
import AdminErrorBoundary from '@/components/admin/layout/AdminErrorBoundary'

const AdminPage = () => {
  const tCommon = useTranslations('common')

  return (
    <AdminErrorBoundary>
      <Suspense fallback={<Box aria-busy='true' aria-live='polite' sx={{ p: 4 }}>{tCommon('common.loading')}</Box>}>
        <HomeDashboard />
      </Suspense>
    </AdminErrorBoundary>
  )
}

export default AdminPage
