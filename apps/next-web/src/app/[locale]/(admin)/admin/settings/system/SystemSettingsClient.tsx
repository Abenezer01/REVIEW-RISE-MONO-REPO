/* eslint-disable import/no-unresolved */
'use client'

import { Box } from '@mui/material'
import { PageHeader } from '@platform/shared-ui'
import { useTranslations } from 'next-intl'

import { type SystemSettingsData } from '@/app/actions/system-settings'
import SystemSettingsForm from './SystemSettingsForm'

export default function SystemSettingsClient({ initialSettings }: { initialSettings: SystemSettingsData }) {
  const t = useTranslations('settings')

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader title={t('system.title')} subtitle={t('system.subtitle')} />

      <SystemSettingsForm initialSettings={initialSettings} />
    </Box>
  )
}
