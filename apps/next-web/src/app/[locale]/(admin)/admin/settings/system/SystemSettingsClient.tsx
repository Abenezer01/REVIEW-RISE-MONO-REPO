/* eslint-disable import/no-unresolved */
'use client'

import { Box } from '@mui/material'
import { PageHeader } from '@platform/shared-ui'

import { type SystemSettingsData } from '@/app/actions/system-settings'
import SystemSettingsForm from './SystemSettingsForm'

export default function SystemSettingsClient({ initialSettings }: { initialSettings: SystemSettingsData }) {
  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader title="System Settings" subtitle="Configure global system parameters" />

      <SystemSettingsForm initialSettings={initialSettings} />
    </Box>
  )
}
