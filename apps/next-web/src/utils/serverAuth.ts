/* eslint-disable import/no-unresolved */
import { cookies } from 'next/headers'

import { backendClient } from '@/utils/backendClient'

import type { User } from '@/contexts/AuthContext'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL

export const getServerUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')

    if (!accessToken) {
      return null
    }

    if (AUTH_SERVICE_URL) {
      try {
        const apiResponse = await backendClient<any>('/v1/auth/me', {
          baseUrl: AUTH_SERVICE_URL
        })

        const data = apiResponse?.data ?? apiResponse
        const u = data?.user

        if (u) {
          return {
            id: u.id,
            email: u.email,
            role: u.role
          }
        }

        return null
      } catch {
        // We cannot delete cookies in a Server Component during render.
        // Just return null, and let middleware or client-side handle the invalid session.
        return null
      }
    }

    // Fallback/Mock for development if no backend
    if (accessToken.value) {
      return {
        id: '1',
        email: 'admin@admin.com',
        firstName: 'Admin',
        role: 'admin'
      }
    }

    return null
  } catch (error) {
    console.error('getServerUser error:', error)

    return null
  }
}
