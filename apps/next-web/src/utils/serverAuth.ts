/* eslint-disable import/no-unresolved */
import { cookies } from 'next/headers'

import { backendClient } from '@/utils/backendClient'

import type { User } from '@/contexts/AuthContext'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL

export const getServerUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')

    const decodeJwt = (t: string) => {
      try {
        const parts = t.split('.')

        if (parts.length < 2) return null
        const json = Buffer.from(parts[1], 'base64').toString('utf-8')

        return JSON.parse(json)
      } catch {
        return null
      }
    }

    const claims = accessToken?.value ? decodeJwt(accessToken.value) : null

    const userInfoCookie = cookieStore.get('userInfo')

    if (userInfoCookie?.value) {
      try {
        const parsed = JSON.parse(userInfoCookie.value)

        if (parsed && parsed.id && parsed.email) {
          return parsed as User
        }
      } catch {}
    }

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

        console.log("User", u);


        if (u) {
          const name = typeof u.name === 'string' ? u.name : ''
          const parts = name.trim().split(' ').filter(Boolean)

          const firstName =
            (u.firstName as string | undefined) ||
            (parts[0] || undefined) ||
            (claims?.given_name as string | undefined)

            const lastName =
            (u.lastName as string | undefined) ||
            (parts.slice(1).join(' ') || undefined) ||
            (claims?.family_name as string | undefined)

            const avatar =
            (u.avatar as string | undefined) ||
            (u.image as string | undefined) ||
            (claims?.picture as string | undefined) ||
            undefined

            const username =
            (u.username as string | undefined) ||
            (claims?.preferred_username as string | undefined) ||
            u.email

          return {
            id: u.id,
            email: u.email,
            role: u.role,
            firstName,
            lastName,
            avatar,
            username
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
