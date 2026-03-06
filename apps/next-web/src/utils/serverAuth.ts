/* eslint-disable import/no-unresolved */
import { cookies } from 'next/headers'

import { backendClient } from '@/utils/backendClient'
import { getServerAuthHeaders } from '@/utils/getServerAuthHeaders'
import { SERVICES_CONFIG } from '@/configs/services'

import type { User } from '@/contexts/AuthContext'

const AUTH_SERVICE_URL = SERVICES_CONFIG.auth.url

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

    const parseUserCookie = (raw: string): User | null => {
      const attempts = [raw]

      try {
        attempts.push(decodeURIComponent(raw))
      } catch {
        // ignore decode failures and try raw parsing only
      }

      for (const candidate of attempts) {
        try {
          const parsed = JSON.parse(candidate)

          if (parsed && parsed.id && parsed.email) {
            return parsed as User
          }
        } catch {
          // try next parse strategy
        }
      }

      return null
    }

    if (userInfoCookie?.value) {
      const parsed = parseUserCookie(userInfoCookie.value)

      if (parsed) return parsed
    }

    if (!accessToken) {
      return null
    }

    // Use token claims as a safe fallback during the same request where middleware refreshed
    // the token and set a new cookie on the response (not yet visible to server components).
    if (claims?.userId && claims?.email) {
      const roles = Array.isArray(claims.roles) ? claims.roles : (claims.role ? [claims.role] : [])

      return {
        id: claims.userId,
        email: claims.email,
        role: claims.role || roles[0],
        roles,
        permissions: Array.isArray(claims.permissions) ? claims.permissions : [],
        firstName: claims.given_name,
        lastName: claims.family_name,
        avatar: claims.picture,
        username: claims.preferred_username || claims.email,
        locationId: claims.locationId
      }
    }

    if (AUTH_SERVICE_URL) {
      try {
        const authHeaders = await getServerAuthHeaders()

        const apiResponse = await backendClient<any>('/v1/auth/me', {
          baseUrl: AUTH_SERVICE_URL,
          headers: authHeaders
        })

        const data = apiResponse?.data ?? apiResponse
        const u = data?.user

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
            role: u.role || claims?.role,
            roles: u.roles || (u.role ? [u.role] : (claims?.roles || (claims?.role ? [claims.role] : []))),
            permissions: u.permissions || claims?.permissions || [],
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
