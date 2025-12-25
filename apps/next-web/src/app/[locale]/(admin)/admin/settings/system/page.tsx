/* eslint-disable import/no-unresolved */

import { getSystemSettings } from '@/app/actions/system-settings'

import SystemSettingsClient from './SystemSettingsClient'

export default async function SystemSettingsPage() {
  const settings = await getSystemSettings()

  return (
    <div>
      <SystemSettingsClient initialSettings={settings} />
    </div>
  )
}
