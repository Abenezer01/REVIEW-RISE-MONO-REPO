/* eslint-disable import/no-unresolved */
'use client'

import StatisticsCard from '@/components/statistics/StatisticsCard'

const AdminKPIWidgets = () => {
  return (
    <StatisticsCard
      title="Admin KPIs"
      actionText="Refreshed just now"
      gridItemSize={{ xs: 12, sm: 6, md: 3 }}
      data={[
        { stats: '0', title: 'Total accounts', color: 'primary', icon: 'tabler-users' },
        { stats: '0', title: 'Active locations', color: 'success', icon: 'tabler-map-pin' },
        { stats: '0', title: 'Failed jobs in the last 24 hours', color: 'error', icon: 'tabler-alert-triangle' },
        { stats: '0', title: 'Subscription issues', color: 'info', icon: 'tabler-alert-circle' }
      ]}
    />
  )
}

export default AdminKPIWidgets
