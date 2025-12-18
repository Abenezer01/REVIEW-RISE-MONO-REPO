/* eslint-disable import/no-unresolved */
// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import ThemeProvider from '@components/theme'
import { SettingsProvider } from '@core/contexts/settingsContext'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

import { AuthProvider } from '@/contexts/AuthContext'

import TokenRefresher from '@/components/TokenRefresher'
import { getServerUser } from '@/utils/serverAuth'

type Props = ChildrenType & {
  direction: Direction
}

// React Query Wrapper

const Providers = async (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()
  const user = await getServerUser()

  return (
    <AuthProvider user={user}>
      <TokenRefresher />
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            {children}
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </AuthProvider>
  )
}

export default Providers
