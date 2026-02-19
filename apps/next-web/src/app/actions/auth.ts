/* eslint-disable import/no-unresolved */
'use server'

import { cookies, headers } from 'next/headers'

import { z } from 'zod'

import { SystemMessageCode } from '@platform/contracts'

import { backendClient } from '@/utils/backendClient'
import { ROLES } from '@/configs/roles'
import menuData, { type MenuItem } from '@/configs/menu'

import type { User } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginResponse = {
  success: boolean
  user?: User
  message?: string
  messageCode?: SystemMessageCode
  errors?: Record<string, string[]>
}

export async function loginAction(prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
  // Extract data from FormData
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate input against schema
  const validationResult = loginSchema.safeParse(credentials)

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      messageCode: SystemMessageCode.VALIDATION_ERROR,
      errors: validationResult.error.flatten().fieldErrors
    }
  }

  const { email, password } = validationResult.data

  // Determine local base URL for BFF call
  const headersList = await headers()
  const host = headersList.get('host')

  // Use HTTP for internal server-to-server calls (Nginx handles external HTTPS)
  const protocol = 'http'
  const API_BASE_URL = `${protocol}://${host}`

  try {
    let data;

    try {
      const response = await backendClient('/api/auth/login', {
        method: 'POST',
        data: { email, password },
        baseUrl: API_BASE_URL
      })

      // Handle ApiResponse structure from backend
      if (response && response.user) {
        data = response
      } else if (response && response.data) {
        data = response.data
      } else {
        data = response
      }
    } catch (error) {
      throw error
    }

    // Validate user role before setting cookies
    if (data?.user) {
      const userRole = data.user.role
      const allowedRoles = Object.values(ROLES) as string[]

      if (!allowedRoles.includes(userRole)) {
        return {
          success: false,
          message: 'Invalid user role - please contact administrator',
          messageCode: SystemMessageCode.FORBIDDEN
        }
      }

      const hasAccess = (() => {
        const check = (items: MenuItem[]): boolean =>
          items.some(item => (item.allowedRoles?.includes(userRole as any) ?? false) || (item.children ? check(item.children) : false))

        return check(menuData)
      })()

      if (userRole === ROLES.OWNER && !hasAccess) {
        return {
          success: false,
          message: 'Access Denied: Your account does not have required menu permissions',
          messageCode: SystemMessageCode.FORBIDDEN
        }
      }
    }

    if (data?.accessToken) {
      const cookieStore = await cookies()

      cookieStore.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      })

      if (data.refreshToken) {
        cookieStore.set('refreshToken', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/'
        })
      }
    }

    let user;

    if (data?.user) {
      const nameParts = data.user.name ? data.user.name.split(' ') : [];

      user = {
        id: data.user.id,
        email: data.user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: data.user.role,
        roles: data.user.roles || (data.user.role ? [data.user.role] : []),
        permissions: data.user.permissions || [],
        avatar: data.user.image,
        username: data.user.email
      }

      try {
        const cookieStore = await cookies()
        
        cookieStore.set('userInfo', JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        })
      } catch {}
    }

    return {
      success: true,
      user,
      messageCode: SystemMessageCode.AUTH_LOGIN_SUCCESS
    }

  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Login failed',
      messageCode: SystemMessageCode.AUTH_LOGIN_FAILED
    }
  }
}
