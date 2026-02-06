/* eslint-disable import/no-unresolved */
'use client'

import { useTranslations } from 'next-intl'

import StatisticsCard from '@/components/statistics/StatisticsCard'

const AdminKPIWidgets = () => {
  const t = useTranslations('admin')

  return (
    <StatisticsCard
      title={t('dashboard.kpi.title')}
      actionText={t('dashboard.kpi.refreshedJustNow')}
      gridItemSize={{ xs: 12, sm: 6, md: 3 }}
      data={[
        { stats: '0', title: t('dashboard.kpi.totalAccounts'), color: 'primary', icon: 'tabler-users' },
        { stats: '0', title: t('dashboard.kpi.activeLocations'), color: 'success', icon: 'tabler-map-pin' },
        { stats: '0', title: t('dashboard.kpi.failedJobs24h'), color: 'error', icon: 'tabler-alert-triangle' },
        { stats: '0', title: t('dashboard.kpi.subscriptionIssues'), color: 'info', icon: 'tabler-alert-circle' }
      ]}
    />
  )
}

export default AdminKPIWidgets
