/* eslint-disable import/no-unresolved */
'use server'

import { cookies, headers } from 'next/headers'

import jwt from 'jsonwebtoken'

import { backendClient } from '@/utils/backendClient'

type TokenPayload = {
  userId: string
  email: string
  roles: string[]
  iat: number
  exp: number
}

type TokenStatus = {
  isValid: boolean
  expiresAt: number | null
  needsRefresh: boolean
}

const REFRESH_THRESHOLD_SECONDS = 300 // 5 minutes

export async function getAuthTokenStatus(): Promise<TokenStatus> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')

  if (!accessToken?.value) {
    return { isValid: false, expiresAt: null, needsRefresh: false }
  }

  try {
    const decoded = jwt.decode(accessToken.value) as TokenPayload | null

    if (!decoded || !decoded.exp) {
      return { isValid: false, expiresAt: null, needsRefresh: false }
    }

    const expiresAt = decoded.exp * 1000 // Convert to ms
    const timeUntilExpiry = expiresAt - Date.now()
    const needsRefresh = timeUntilExpiry < REFRESH_THRESHOLD_SECONDS * 1000 && timeUntilExpiry > 0

    return {
      isValid: timeUntilExpiry > 0,
      expiresAt,
      needsRefresh
    }
  } catch (error) {
    console.error('Error decoding token:', error)

    return { isValid: false, expiresAt: null, needsRefresh: false }
  }
}

export type RefreshResult = {
  success: boolean
  message?: string
  shouldLogout?: boolean
}

export async function refreshAccessToken(): Promise<RefreshResult> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')

  if (!refreshToken?.value) {
    return { success: false, message: 'No refresh token found', shouldLogout: true }
  }

  // Determine local base URL for BFF call
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const API_BASE_URL = `${protocol}://${host}`

  try {
    const response = await backendClient('/api/auth/refresh-token', {
      method: 'POST',
      data: { refreshToken: refreshToken.value },
      baseUrl: API_BASE_URL
    })

    const data = response?.data || response

    if (data?.accessToken) {
      cookieStore.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      })

      return { success: true }
    }

    // If we got a response but no accessToken, something is wrong
    return { success: false, message: 'Invalid response format', shouldLogout: false }
  } catch (error: any) {
    console.error('Token refresh error:', error)

    // Check for 401/403 - Invalid refresh token
    if (error.status === 401 || error.status === 403) {
      await logout()

      return { success: false, message: 'Invalid refresh token', shouldLogout: true }
    }

    // Other errors (network, 500) - Do not logout, allow retry
    return { success: false, message: error.message || 'Refresh failed', shouldLogout: false }
  }
}

async function logout() {
  const cookieStore = await cookies()
  
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}
