/* eslint-disable import/no-unresolved */
'use client'

import { useEffect, useRef } from 'react'

import { Toaster } from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'
import { getAuthTokenStatus, refreshAccessToken } from '@/app/actions/token'

export default function TokenRefresher() {
  const { user, logout } = useAuth()
  const isRefreshingRef = useRef(false)
  const retryCountRef = useRef(0)

  useEffect(() => {
    if (!user) return

    let timeoutId: NodeJS.Timeout

    const checkToken = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) return

      try {
        const status = await getAuthTokenStatus()

        // If token is expiring soon (needsRefresh) or has already expired
        if (status.needsRefresh || (!status.isValid && status.expiresAt)) {
          console.log('[TokenRefresher] Token needs refresh. Status:', status)

          isRefreshingRef.current = true

          try {
            const result = await refreshAccessToken()

            if (result.success) {
              console.log('[TokenRefresher] Token refreshed successfully')
              retryCountRef.current = 0
            } else {
              console.warn('[TokenRefresher] Refresh failed:', result.message)

              if (result.shouldLogout) {
                console.warn('[TokenRefresher] Fatal error, logging out...')
                await logout()
              } else {
                // Exponential backoff
                const count = retryCountRef.current
                const delay = Math.min(1000 * Math.pow(2, count), 30000)

                console.log(`[TokenRefresher] Retrying in ${delay}ms... (Attempt ${count + 1})`)

                retryCountRef.current = count + 1

                // Schedule retry
                timeoutId = setTimeout(checkToken, delay)
              }
            }
          } finally {
            isRefreshingRef.current = false
          }
        } else if (!status.isValid && !status.expiresAt) {
          console.warn('[TokenRefresher] No valid token found, logging out...')
          await logout()
        } else {
          // Token is fine
          retryCountRef.current = 0
        }
      } catch (error) {
        console.error('[TokenRefresher] Error checking token:', error)
        isRefreshingRef.current = false
      }
    }

    // Initial check
    checkToken()

    // Regular interval
    const intervalId = setInterval(checkToken, 60 * 1000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [user, logout])

  return <Toaster position="top-right" />
}
